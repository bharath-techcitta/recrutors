import { Candidate, Requirement } from "@/types";
import { mockCandidates, mockRequirements } from "@/data/mock-data";
import { CandidateMatcher, DEFAULT_MATCHING_WEIGHTS } from "@/lib/matching/candidate-matcher";
import { ChatSession, MatchedCandidateData } from "./types";

const matcher = new CandidateMatcher({
  ...DEFAULT_MATCHING_WEIGHTS,
  roleMatch: 45,
  mandatorySkills: 35,
  experience: 20, // 100% weight for experience satisfaction
  education: 0,   // 0% for education
});

/**
 * Pre-computes initial chat sessions based on mockRequirements & mockCandidates
 */
export function getInitialChatSessions(): ChatSession[] {
  return mockRequirements.map((req) => {
    // Evaluate all candidates against this requirement
    const evaluated: MatchedCandidateData[] = mockCandidates
      .map((cand) => ({
        candidate: cand,
        match: matcher.evaluate(cand, req),
        shortlisted: false,
      }))
      .filter((item) => item.match.overallScore >= 50)
      .sort((a, b) => b.match.overallScore - a.match.overallScore);

    const userMessage = {
      id: `msg-user-${req.id}`,
      role: "user" as const,
      content: req.description || `Search and rank candidates for ${req.title} with ${req.minExperience}+ years experience. Skills: ${req.mandatorySkills.join(", ")}.`,
      timestamp: req.createdAt,
    };

    const assistantMessage = {
      id: `msg-asst-${req.id}`,
      role: "assistant" as const,
      content: `I've analyzed the requirement for **${req.title}** and performed deterministic matching across the candidate database.
- **Priority 1 (Role Alignment)**: 45% weight applied to current title and relevant job functions.
- **Priority 2 (Core Skills Match)**: 35% weight applied for mandatory skills (${req.mandatorySkills.slice(0, 4).join(", ")}).
- **100% Experience Criteria**: 20% full weight awarded to candidates meeting ${req.minExperience}+ years.
- **Education Weight**: 0% (excluded per recruitment policy).
- **Location**: Excluded from deterministic scoring.

Found **${evaluated.length} verified candidate profiles** meeting criteria:`,
      timestamp: req.createdAt,
      matchedCandidates: evaluated,
      requirement: req,
      searchSummary: {
        roleTitle: req.title,
        expCriteria: `${req.minExperience} - ${req.maxExperience} years`,
        topScore: evaluated[0]?.match.overallScore || 0,
        totalMatched: evaluated.length,
      },
    };

    return {
      id: req.id,
      title: req.title,
      createdAt: req.createdAt,
      requirement: req,
      messages: [userMessage, assistantMessage],
    };
  });
}

/**
 * Parses user input (pasted JD or requirement query) and matches candidate profiles
 */
export function processRequirementQuery(
  rawText: string,
  fileName?: string
): {
  requirement: Requirement;
  matchedCandidates: MatchedCandidateData[];
} {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  
  // Try to determine a clean role title
  let roleTitle = "Technical Professional";
  const titlePatterns = [
    /(?:senior|lead|principal|staff|junior)?\s*(?:full\s*stack|backend|frontend|software|ai|ml|machine\s*learning|devops|cloud|data|product)\s*(?:engineer|developer|architect|specialist|manager)/i,
    /(?:hiring|looking for|seeking|position:?|role:?)\s*([a-zA-Z\s]{4,35})/i,
  ];

  for (const pattern of titlePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      roleTitle = match[0].replace(/^(hiring|looking for|seeking|position:?|role:?)\s*/i, "").trim();
      roleTitle = roleTitle.charAt(0).toUpperCase() + roleTitle.slice(1);
      break;
    }
  }

  if (roleTitle === "Technical Professional" && lines.length > 0) {
    const firstLine = lines[0].replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    if (firstLine.length > 3 && firstLine.length < 50) {
      roleTitle = firstLine;
    }
  }

  // Detect experience requirement
  let minExp = 4;
  const expMatch = rawText.match(/(\d+)\+?\s*(?:to\s*(\d+))?\s*(?:years?|yrs?)/i);
  if (expMatch) {
    minExp = parseInt(expMatch[1], 10);
  }

  // Detect skills
  const knownSkills = [
    "Python", "FastAPI", "React", "Next.js", "TypeScript", "JavaScript",
    "PostgreSQL", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Node.js", "GraphQL", "Redis", "Kafka", "PyTorch", "TensorFlow",
    "LangChain", "Vector Databases", "LLMs", "Terraform", "CI/CD",
    "Linux", "MongoDB", "Tailwind", "Java", "Spring Boot", "Go", "Golang"
  ];

  const lowerRaw = rawText.toLowerCase();
  const detectedSkills = knownSkills.filter((skill) =>
    lowerRaw.includes(skill.toLowerCase())
  );

  const mandatorySkills = detectedSkills.length > 0 ? detectedSkills : ["Python", "Backend Architecture", "APIs"];

  const newReq: Requirement = {
    id: `req-${Date.now()}`,
    title: roleTitle,
    department: "Engineering",
    location: "Remote / Hybrid",
    minExperience: minExp,
    maxExperience: minExp + 5,
    mandatorySkills,
    preferredSkills: ["Docker", "Git", "System Design"],
    education: "Any Degree (0% Weight)",
    domain: "Software / Tech",
    noticePeriod: "30 Days or less",
    description: rawText,
    status: "Ready",
    createdAt: new Date().toISOString(),
    candidateCount: 0,
    topMatchScore: 0,
  };

  // Evaluate mockCandidates
  const evaluated: MatchedCandidateData[] = mockCandidates
    .map((cand) => ({
      candidate: cand,
      match: matcher.evaluate(cand, newReq),
      shortlisted: false,
    }))
    .sort((a, b) => b.match.overallScore - a.match.overallScore);

  newReq.candidateCount = evaluated.length;
  newReq.topMatchScore = evaluated[0]?.match.overallScore || 0;

  return {
    requirement: newReq,
    matchedCandidates: evaluated,
  };
}
