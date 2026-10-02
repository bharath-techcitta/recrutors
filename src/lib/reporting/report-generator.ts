import { Candidate, Requirement } from "@/types";

export interface ReportSummary {
  requirement: Requirement;
  totalFound: number;
  totalProcessed: number;
  totalShortlisted: number;
  averageMatchScore: number;
  topCandidates: Candidate[];
  scoreBreakdownAverage: {
    role: number;
    skills: number;
    experience: number;
    education: number;
  };
  skillCoverage: {
    skill: string;
    matchedCount: number;
    percentage: number;
  }[];
  missingSkillsAnalysis: {
    skill: string;
    deficitCount: number;
    percentage: number;
  }[];
  generatedAt: string;
}

export class ReportGenerator {
  public static generate(requirement: Requirement, candidates: Candidate[]): ReportSummary {
    const totalFound = candidates.length;
    const totalProcessed = candidates.filter((c) => c.resumeStatus === "Parsed").length;
    const totalShortlisted = candidates.filter((c) => c.isShortlisted).length;

    // Calculate score averages
    let sumOverall = 0;
    let sumRole = 0;
    let sumSkills = 0;
    let sumExp = 0;

    for (const c of candidates) {
      const m = c.matchResult;
      if (m) {
        sumOverall += m.overallScore;
        sumRole += m.roleScore || 85;
        sumSkills += m.skillScore;
        sumExp += m.experienceScore;
      }
    }

    const n = totalFound || 1;
    const averageMatchScore = Math.round(sumOverall / n);

    const scoreBreakdownAverage = {
      role: Math.round(sumRole / n),
      skills: Math.round(sumSkills / n),
      experience: Math.round(sumExp / n),
      education: 0, // Explicitly 0% per priority configuration
    };

    // Skill coverage analysis
    const allMandatory = requirement.mandatorySkills;
    const skillCoverage = allMandatory.map((skill) => {
      const count = candidates.filter(
        (c) =>
          c.skills.some((s) => s.toLowerCase() === skill.toLowerCase()) ||
          (c.rawResumeText && new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i").test(c.rawResumeText))
      ).length;
      return {
        skill,
        matchedCount: count,
        percentage: Math.round((count / n) * 100),
      };
    });

    // Missing skills analysis
    const missingSkillsAnalysis = allMandatory
      .map((skill) => {
        const found = skillCoverage.find((sc) => sc.skill === skill)?.matchedCount || 0;
        const deficitCount = totalFound - found;
        return {
          skill,
          deficitCount,
          percentage: Math.round((deficitCount / n) * 100),
        };
      })
      .sort((a, b) => b.deficitCount - a.deficitCount);

    const topCandidates = [...candidates]
      .sort((a, b) => {
        const scoreDiff = (b.matchResult?.overallScore || 0) - (a.matchResult?.overallScore || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const roleDiff = (b.matchResult?.roleScore || 0) - (a.matchResult?.roleScore || 0);
        if (roleDiff !== 0) return roleDiff;
        return (b.matchResult?.skillScore || 0) - (a.matchResult?.skillScore || 0);
      })
      .slice(0, 10);

    return {
      requirement,
      totalFound,
      totalProcessed,
      totalShortlisted,
      averageMatchScore,
      topCandidates,
      scoreBreakdownAverage,
      skillCoverage,
      missingSkillsAnalysis,
      generatedAt: new Date().toISOString(),
    };
  }

  public static toCSV(report: ReportSummary): string {
    const headers = [
      "Rank",
      "Candidate Name",
      "Current Role",
      "Company",
      "Experience (Yrs)",
      "Overall Match %",
      "Role Match % (Priority 1)",
      "Skills Score % (Priority 2)",
      "Experience Score % (100% Scale)",
      "Education Score % (0% Weight)",
      "Shortlisted",
      "Source",
    ];

    const rows = report.topCandidates.map((c, index) => {
      const m = c.matchResult;
      return [
        index + 1,
        `"${c.name}"`,
        `"${c.currentRole}"`,
        `"${c.company}"`,
        c.experience,
        m?.overallScore || 0,
        m?.roleScore || 0,
        m?.skillScore || 0,
        m?.experienceScore || 0,
        0, // 0 for education
        c.isShortlisted ? "YES" : "NO",
        `"${c.source}"`,
      ].join(",");
    });

    return [
      `# TalentMatch AI Recruitment Matching Report`,
      `# Requirement: "${report.requirement.title}" (${report.requirement.id})`,
      `# Priority Model: Role Alignment (Priority 1) -> Skills Matching (Priority 2) -> Experience (100% Scale) -> Education (0%) [Location Removed]`,
      `# Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      `# Total Candidates Evaluated: ${report.totalFound} | Shortlisted: ${report.totalShortlisted} | Avg Match: ${report.averageMatchScore}%`,
      "",
      headers.join(","),
      ...rows,
    ].join("\n");
  }
}
