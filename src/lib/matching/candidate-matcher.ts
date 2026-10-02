import { Candidate, MatchResult, MatchingWeights, Requirement, RequirementEvidence } from "@/types";

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  roleMatch: 45,        // Priority 1: Role alignment
  mandatorySkills: 35,  // Priority 2: Core technical skills matching
  experience: 20,       // 100% scale for candidates meeting experience requirement
  education: 0,         // 0% for education
};

export class CandidateMatcher {
  private weights: MatchingWeights;

  constructor(weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS) {
    this.weights = { ...DEFAULT_MATCHING_WEIGHTS, ...weights };
  }

  public setWeights(weights: MatchingWeights) {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Deterministic, explainable matching prioritizing:
   * 1. Role Match (Priority 1)
   * 2. Skills Match (Priority 2)
   * 3. Experience (100% full credit for meeting/exceeding required tenure)
   * 4. Education: 0% weight
   * 5. Location: Removed from scoring
   */
  public evaluate(candidate: Candidate, requirement: Requirement): MatchResult {
    const rawText = (candidate.rawResumeText || `${candidate.summary} ${candidate.skills.join(" ")} ${candidate.experience} years`).toLowerCase();
    const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());

    const matchedRequirements: string[] = [];
    const partialRequirements: string[] = [];
    const missingRequirements: string[] = [];
    const evidenceList: RequirementEvidence[] = [];

    // ==========================================
    // 1. PRIORITY 1: ROLE MATCHING
    // ==========================================
    const roleScore = this.calculateRoleScore(candidate, requirement, matchedRequirements, partialRequirements, missingRequirements, evidenceList);

    // ==========================================
    // 2. PRIORITY 2: MANDATORY SKILLS MATCHING
    // ==========================================
    let mandatoryMatchedCount = 0;
    const totalMandatory = requirement.mandatorySkills.length || 1;

    for (const skill of requirement.mandatorySkills) {
      const sLower = skill.toLowerCase();
      const inSkillsList = candidateSkillsLower.includes(sLower);
      const inResumeText = rawText.includes(sLower);

      if (inSkillsList || inResumeText) {
        mandatoryMatchedCount++;
        matchedRequirements.push(skill);
        const quote = this.extractEvidenceSentence(candidate.rawResumeText || "", skill) || `Demonstrated proficiency in ${skill} listed in candidate core competency.`;
        evidenceList.push({
          requirement: skill,
          status: "matched",
          evidenceQuote: quote,
          category: "mandatory_skill",
          notes: "Direct skill match found in verified technical profile.",
        });
      } else {
        const isPartial = this.checkPartialSkillMatch(sLower, candidateSkillsLower, rawText);
        if (isPartial) {
          mandatoryMatchedCount += 0.5;
          partialRequirements.push(skill);
          evidenceList.push({
            requirement: skill,
            status: "partial",
            evidenceQuote: `Candidate exhibits adjacent competency with ${isPartial.matchedWith} instead of strict ${skill}.`,
            category: "mandatory_skill",
            notes: "Transferable skill identified.",
          });
        } else {
          missingRequirements.push(skill);
          evidenceList.push({
            requirement: skill,
            status: "missing",
            evidenceQuote: `No direct evidence of "${skill}" located in parsed resume documents.`,
            category: "mandatory_skill",
          });
        }
      }
    }
    const skillScore = Math.min(100, Math.round((mandatoryMatchedCount / totalMandatory) * 100));

    // ==========================================
    // 3. EXPERIENCE: 100% SCALE FOR MEETING/EXCEEDING REQUIRED TENURE
    // ==========================================
    const exp = candidate.experience;
    const minExp = requirement.minExperience;
    let experienceScore = 100;

    if (exp >= minExp) {
      // 100% for candidate meeting or exceeding the minimum experience
      experienceScore = 100;
      matchedRequirements.push(`${exp}+ years experience (100% match, meets ${minExp}+ yrs required)`);
      evidenceList.push({
        requirement: `${minExp}+ Years Experience`,
        status: "matched",
        evidenceQuote: `Candidate has verified ${exp} years of relevant experience, qualifying for 100% experience score (target: ${minExp}+ years).`,
        category: "experience",
      });
    } else {
      const deficit = minExp - exp;
      if (deficit <= 1) {
        experienceScore = 80;
        partialRequirements.push(`${exp} years experience (Target: ${minExp} yrs)`);
        evidenceList.push({
          requirement: `${minExp} Years Experience`,
          status: "partial",
          evidenceQuote: `Candidate has ${exp} years, slightly under the ${minExp}-year threshold.`,
          category: "experience",
        });
      } else {
        experienceScore = Math.max(30, Math.round((exp / minExp) * 100));
        missingRequirements.push(`Lacks required ${minExp} years experience (has ${exp} yrs)`);
        evidenceList.push({
          requirement: `${minExp} Years Experience`,
          status: "missing",
          evidenceQuote: `Candidate tenure (${exp} years) is below target ${minExp} years.`,
          category: "experience",
        });
      }
    }

    // ==========================================
    // 4. EDUCATION: 0% WEIGHT
    // ==========================================
    const educationScore = 0; // Explicitly 0% per requirement
    evidenceList.push({
      requirement: "Education Requirement",
      status: "matched",
      evidenceQuote: `Candidate credentials (${candidate.education}) noted. Education weighting is set to 0% per priority configuration.`,
      category: "education",
    });

    // ==========================================
    // 5. LOCATION: REMOVED FROM SCORING
    // ==========================================
    // Location is completely excluded from calculating overallScore.

    // ==========================================
    // 6. CALCULATE WEIGHTED OVERALL SCORE
    // ==========================================
    const roleWeight = this.weights.roleMatch ?? 45;
    const skillsWeight = this.weights.mandatorySkills ?? 35;
    const expWeight = this.weights.experience ?? 20;

    const totalActiveWeight = roleWeight + skillsWeight + expWeight || 100;

    const weightedScore =
      (roleScore * roleWeight +
        skillScore * skillsWeight +
        experienceScore * expWeight) /
      totalActiveWeight;

    const overallScore = Math.min(99, Math.max(20, Math.round(weightedScore)));

    return {
      candidateId: candidate.id,
      requirementId: requirement.id,
      overallScore,
      roleScore,
      skillScore,
      experienceScore,
      educationScore,
      locationScore: undefined, // Location removed
      matchedRequirements,
      partialRequirements,
      missingRequirements,
      evidence: evidenceList,
      createdAt: new Date().toISOString(),
    };
  }

  private calculateRoleScore(
    candidate: Candidate,
    requirement: Requirement,
    matchedRequirements: string[],
    partialRequirements: string[],
    missingRequirements: string[],
    evidenceList: RequirementEvidence[]
  ): number {
    const candRole = candidate.currentRole.toLowerCase();
    const reqTitle = requirement.title.toLowerCase();

    // Check title token overlap
    const reqTokens = reqTitle
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => !["and", "or", "in", "for", "with", "a", "an", "the"].includes(w));

    let matchedTokens = 0;
    for (const t of reqTokens) {
      if (candRole.includes(t)) {
        matchedTokens++;
      }
    }

    const tokenMatchRatio = reqTokens.length > 0 ? matchedTokens / reqTokens.length : 0.5;

    let roleScore = 60;
    if (tokenMatchRatio >= 0.75 || candRole === reqTitle) {
      roleScore = 100;
      matchedRequirements.push(`Role Match: ${candidate.currentRole} aligns directly with ${requirement.title}`);
      evidenceList.push({
        requirement: `Role Alignment (${requirement.title})`,
        status: "matched",
        evidenceQuote: `Current role "${candidate.currentRole}" is a direct match for target position "${requirement.title}".`,
        category: "role",
        notes: "Priority 1 criteria fulfilled with top score.",
      });
    } else if (tokenMatchRatio >= 0.4 || this.checkAdjacentRole(candRole, reqTitle)) {
      roleScore = 85;
      matchedRequirements.push(`Adjacent Role Match: ${candidate.currentRole}`);
      evidenceList.push({
        requirement: `Role Alignment (${requirement.title})`,
        status: "matched",
        evidenceQuote: `Candidate role "${candidate.currentRole}" demonstrates strong functional alignment with "${requirement.title}".`,
        category: "role",
      });
    } else {
      roleScore = 55;
      partialRequirements.push(`Partial Role Match: ${candidate.currentRole}`);
      evidenceList.push({
        requirement: `Role Alignment (${requirement.title})`,
        status: "partial",
        evidenceQuote: `Candidate is currently "${candidate.currentRole}", which requires transitional onboarding for "${requirement.title}".`,
        category: "role",
      });
    }

    return roleScore;
  }

  private checkAdjacentRole(roleA: string, roleB: string): boolean {
    const clusters: string[][] = [
      ["full stack", "backend", "frontend", "software engineer", "developer", "sde"],
      ["ai", "ml", "machine learning", "data science", "deep learning", "research engineer"],
      ["devops", "cloud", "infrastructure", "sre", "platform engineer", "systems"],
      ["product manager", "product lead", "pm", "product director", "product strategy"],
      ["data engineer", "etl", "big data", "spark", "pipeline architect"],
    ];

    for (const cluster of clusters) {
      const matchA = cluster.some((k) => roleA.includes(k));
      const matchB = cluster.some((k) => roleB.includes(k));
      if (matchA && matchB) return true;
    }
    return false;
  }

  private extractEvidenceSentence(text: string, term: string): string | null {
    if (!text) return null;
    const sentences = text.split(/(?<=[.?!])\s+/);
    const match = sentences.find((s) => new RegExp(`\\b${term}\\b`, "i").test(s));
    return match ? match.trim().replace(/^•\s*/, "") : null;
  }

  private checkPartialSkillMatch(
    skill: string,
    candidateSkills: string[],
    rawText: string
  ): { matchedWith: string } | null {
    const adjacentSkillsMap: Record<string, string[]> = {
      kubernetes: ["docker", "containerization", "ecs", "helm"],
      docker: ["podman", "kubernetes", "containerd"],
      postgresql: ["mysql", "sql", "oracle", "mariadb"],
      fastapi: ["flask", "django", "tornado"],
      react: ["next.js", "vue", "angular"],
      "next.js": ["react", "remix", "vue"],
      aws: ["azure", "gcp", "google cloud"],
      terraform: ["cloudformation", "ansible", "pulumi"],
      kafka: ["rabbitmq", "redis streams", "sqs"],
      graphql: ["restful apis", "grpc", "rest api"],
    };

    const adjacents = adjacentSkillsMap[skill] || [];
    for (const adj of adjacents) {
      if (candidateSkills.includes(adj) || rawText.includes(adj)) {
        return { matchedWith: adj.charAt(0).toUpperCase() + adj.slice(1) };
      }
    }
    return null;
  }
}
