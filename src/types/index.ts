export type RequirementStatus =
  | "Draft"
  | "Ready"
  | "Searching"
  | "Processing"
  | "Completed"
  | "Failed";

export interface Requirement {
  id: string;
  title: string;
  department: string;
  location: string;
  minExperience: number;
  maxExperience: number;
  mandatorySkills: string[];
  preferredSkills: string[];
  education: string;
  domain: string;
  noticePeriod: string;
  description: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt?: string;
  candidateCount?: number;
  topMatchScore?: number;
}

export type ResumeStatus = "Pending" | "Retrieved" | "Parsed" | "Failed";

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  highlights: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  company: string;
  experience: number; // in years
  location: string;
  skills: string[];
  education: string;
  educationDetails?: EducationItem[];
  resumeUrl: string;
  resumeStatus: ResumeStatus;
  source: "Naukri Resdex" | "Internal Database" | "Referral" | "LinkedIn";
  noticePeriod: string;
  currentSalary?: string;
  expectedSalary?: string;
  summary: string;
  workHistory?: WorkExperience[];
  rawResumeText?: string;
  createdAt: string;
  matchResult?: MatchResult;
  isShortlisted?: boolean;
}

export interface RequirementEvidence {
  requirement: string;
  status: "matched" | "partial" | "missing";
  evidenceQuote: string;
  category: "role" | "mandatory_skill" | "preferred_skill" | "experience" | "education" | "location" | "domain";
  notes?: string;
}

export interface MatchResult {
  candidateId: string;
  requirementId: string;
  overallScore: number;
  roleScore: number; // Priority 1: Role / designation alignment
  skillScore: number; // Priority 2: Core technical skills matching
  experienceScore: number; // Experience tenure evaluation (100% when meeting/exceeding requirement)
  educationScore: number; // Education weight set to 0%
  locationScore?: number; // Location removed from scoring calculation
  preferredSkillScore?: number;
  domainScore?: number;
  matchedRequirements: string[];
  partialRequirements: string[];
  missingRequirements: string[];
  evidence: RequirementEvidence[];
  createdAt: string;
}

export type SearchRunStatus = "Queued" | "Running" | "Completed" | "Failed";

export interface PipelineStage {
  name: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  timestamp?: string;
  details?: string;
}

export interface SearchRun {
  id: string;
  requirementId: string;
  requirementTitle: string;
  status: SearchRunStatus;
  startedAt: string;
  completedAt?: string;
  candidateCount: number;
  processedResumeCount: number;
  topMatchScore: number;
  error?: string;
  stages?: PipelineStage[];
  searchCriteria?: {
    keywords: string[];
    minExperience: number;
    maxExperience: number;
    locations: string[];
    noticePeriod: string;
  };
}

export interface MatchingWeights {
  roleMatch: number;        // Priority 1 (Default: 45%)
  mandatorySkills: number;  // Priority 2 (Default: 35%)
  experience: number;       // Experience tenure (Default: 20%, 100% scale for candidates meeting requirement)
  education: number;        // Education (Explicitly 0%)
  location?: number;        // Location removed (0%)
  preferredSkills?: number;
  domain?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  status: "Success" | "Warning" | "Info";
  ipAddress: string;
}

export interface NaukriIntegrationStatus {
  connected: boolean;
  statusMessage: string;
  accountType: string;
  lastSync: string;
  availableCredits: number;
  dailySearchesUsed: number;
  dailySearchLimit: number;
  environment: "Production" | "Sandbox Mock";
  authType: "Enterprise OAuth2 / Token Adapter";
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
