import { MatchedCandidateData } from "./types";

export function downloadCandidateProfile(item: MatchedCandidateData, roleTitle: string = "Requirement") {
  const { candidate, match } = item;
  
  const content = {
    exportDate: new Date().toISOString(),
    targetedRole: roleTitle,
    candidateDetails: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      currentRole: candidate.currentRole,
      company: candidate.company,
      totalExperienceYears: candidate.experience,
      location: candidate.location,
      noticePeriod: candidate.noticePeriod,
      education: candidate.education,
      currentSalary: candidate.currentSalary || "N/A",
      expectedSalary: candidate.expectedSalary || "N/A",
    },
    matchingEvaluation: {
      overallScore: `${match.overallScore}%`,
      scoringPriorities: {
        roleMatchScore: `${match.roleScore} / 45`,
        skillsMatchScore: `${match.skillScore} / 35`,
        experienceScore: `${match.experienceScore} / 20 (100% credit applied)`,
        educationScore: `${match.educationScore} / 0 (0% weight)`,
      },
      matchedSkills: match.matchedRequirements,
      partialSkills: match.partialRequirements,
      missingSkills: match.missingRequirements,
      evidenceExtracted: match.evidence,
    },
    candidateSummary: candidate.summary,
    rawResume: candidate.rawResumeText,
  };

  const jsonStr = JSON.stringify(content, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${candidate.name.replace(/\s+/g, "_")}_Profile_${match.overallScore}pct.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAllCandidates(candidates: MatchedCandidateData[], roleTitle: string) {
  const exportPayload = {
    roleTitle,
    exportedAt: new Date().toISOString(),
    totalCandidates: candidates.length,
    candidates: candidates.map((item) => ({
      name: item.candidate.name,
      matchScore: `${item.match.overallScore}%`,
      experience: `${item.candidate.experience} years`,
      currentRole: item.candidate.currentRole,
      company: item.candidate.company,
      email: item.candidate.email,
      phone: item.candidate.phone,
      matchedSkills: item.match.matchedRequirements.join(", "),
      missingSkills: item.match.missingRequirements.join(", "),
      scoreBreakdown: {
        roleScore: item.match.roleScore,
        skillScore: item.match.skillScore,
        experienceScore: item.match.experienceScore,
        educationScore: item.match.educationScore,
      },
    })),
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${roleTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Matched_Profiles.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
