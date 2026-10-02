import { Candidate, MatchResult, Requirement } from "@/types";

export interface MatchedCandidateData {
  candidate: Candidate;
  match: MatchResult;
  shortlisted?: boolean;
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  fileName?: string;
  matchedCandidates?: MatchedCandidateData[];
  requirement?: Requirement;
  searchSummary?: {
    roleTitle: string;
    expCriteria: string;
    topScore: number;
    totalMatched: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  requirement?: Requirement;
  messages: ChatMessageData[];
}
