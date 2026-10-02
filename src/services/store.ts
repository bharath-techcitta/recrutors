import {
  AuditLog,
  Candidate,
  MatchResult,
  MatchingWeights,
  Requirement,
  SearchRun,
} from "@/types";
import {
  mockAuditLogs,
  mockCandidates,
  mockRequirements,
  mockSearchRuns,
} from "@/data/mock-data";
import { CandidateMatcher, DEFAULT_MATCHING_WEIGHTS } from "@/lib/matching/candidate-matcher";
import { getCandidateSearchConnector } from "@/lib/integrations/candidate-search-connector";

class DataStore {
  private requirements: Requirement[] = [...mockRequirements];
  private candidates: Candidate[] = [...mockCandidates];
  private searchRuns: SearchRun[] = [...mockSearchRuns];
  private auditLogs: AuditLog[] = [...mockAuditLogs];
  private weights: MatchingWeights = { ...DEFAULT_MATCHING_WEIGHTS };
  private matcher: CandidateMatcher = new CandidateMatcher(this.weights);
  private matchResultsCache: Map<string, MatchResult> = new Map();
  private naukriConnected = true;

  constructor() {
    this.precomputeMatches();
  }

  private precomputeMatches() {
    // Precompute matches for candidate-requirement pairs
    for (const req of this.requirements) {
      for (const cand of this.candidates) {
        const key = `${cand.id}-${req.id}`;
        const match = this.matcher.evaluate(cand, req);
        this.matchResultsCache.set(key, match);
      }
    }
  }

  // --- Requirements ---
  public getRequirements(): Requirement[] {
    return [...this.requirements];
  }

  public getRequirement(id: string): Requirement | undefined {
    return this.requirements.find((r) => r.id === id);
  }

  public createRequirement(req: Omit<Requirement, "id" | "createdAt" | "status">): Requirement {
    const newId = `req-${String(this.requirements.length + 1).padStart(3, "0")}`;
    const newReq: Requirement = {
      ...req,
      id: newId,
      status: "Ready",
      createdAt: new Date().toISOString(),
      candidateCount: 0,
      topMatchScore: 0,
    };
    this.requirements.unshift(newReq);

    // Compute initial matches for new requirement
    let maxScore = 0;
    let count = 0;
    for (const cand of this.candidates) {
      const match = this.matcher.evaluate(cand, newReq);
      this.matchResultsCache.set(`${cand.id}-${newId}`, match);
      if (match.overallScore >= 60) count++;
      if (match.overallScore > maxScore) maxScore = match.overallScore;
    }
    newReq.candidateCount = count;
    newReq.topMatchScore = maxScore;

    this.addAuditLog("Create Requirement", `Requirement ${newId} (${newReq.title})`);
    return newReq;
  }

  public updateRequirement(id: string, updates: Partial<Requirement>): Requirement | undefined {
    const index = this.requirements.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    this.requirements[index] = {
      ...this.requirements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.requirements[index];
  }

  // --- Candidates & Matching ---
  public getCandidates(requirementId?: string): Candidate[] {
    const req = requirementId ? this.getRequirement(requirementId) : this.requirements[0];

    return this.candidates.map((c) => {
      let matchResult: MatchResult | undefined;
      if (req) {
        const key = `${c.id}-${req.id}`;
        matchResult = this.matchResultsCache.get(key) || this.matcher.evaluate(c, req);
      }
      return {
        ...c,
        matchResult,
      };
    }).sort((a, b) => {
      const scoreDiff = (b.matchResult?.overallScore || 0) - (a.matchResult?.overallScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      // Priority 1: Role matching
      const roleDiff = (b.matchResult?.roleScore || 0) - (a.matchResult?.roleScore || 0);
      if (roleDiff !== 0) return roleDiff;
      // Priority 2: Skills matching
      const skillDiff = (b.matchResult?.skillScore || 0) - (a.matchResult?.skillScore || 0);
      if (skillDiff !== 0) return skillDiff;
      // Priority 3: Experience
      return (b.matchResult?.experienceScore || 0) - (a.matchResult?.experienceScore || 0);
    });
  }

  public getCandidate(id: string, requirementId?: string): Candidate | undefined {
    const cand = this.candidates.find((c) => c.id === id);
    if (!cand) return undefined;

    const targetReq = requirementId ? this.getRequirement(requirementId) : this.requirements[0];
    let matchResult: MatchResult | undefined;
    if (targetReq) {
      const key = `${cand.id}-${targetReq.id}`;
      matchResult = this.matchResultsCache.get(key) || this.matcher.evaluate(cand, targetReq);
    }

    return {
      ...cand,
      matchResult,
    };
  }

  public toggleCandidateShortlist(id: string): Candidate | undefined {
    const cand = this.candidates.find((c) => c.id === id);
    if (!cand) return undefined;
    cand.isShortlisted = !cand.isShortlisted;
    this.addAuditLog(
      cand.isShortlisted ? "Shortlist Candidate" : "Un-shortlist Candidate",
      `${cand.name} (${cand.id})`
    );
    return cand;
  }

  // --- Search Runs ---
  public getSearchRuns(): SearchRun[] {
    return [...this.searchRuns];
  }

  public getSearchRun(id: string): SearchRun | undefined {
    return this.searchRuns.find((sr) => sr.id === id);
  }

  public async triggerSearchRun(requirementId: string): Promise<SearchRun> {
    const req = this.getRequirement(requirementId);
    if (!req) throw new Error("Requirement not found");

    const runId = `SR-${Math.floor(810 + Math.random() * 90)}`;
    const newRun: SearchRun = {
      id: runId,
      requirementId: req.id,
      requirementTitle: req.title,
      status: "Running",
      startedAt: new Date().toISOString(),
      candidateCount: 0,
      processedResumeCount: 0,
      topMatchScore: 0,
      searchCriteria: {
        keywords: req.mandatorySkills,
        minExperience: req.minExperience,
        maxExperience: req.maxExperience,
        locations: [req.location],
        noticePeriod: req.noticePeriod,
      },
      stages: [
        { name: "criteria", label: "Structured Criteria Extraction", status: "completed", timestamp: "00:01", details: "Criteria successfully mapped" },
        { name: "search", label: "Naukri Resdex Search Query", status: "running", timestamp: "00:05", details: "Querying authorized recruitment gateway..." },
        { name: "retrieval", label: "Resume Document Retrieval", status: "pending" },
        { name: "parsing", label: "AI Resume Text Parsing", status: "pending" },
        { name: "matching", label: "Deterministic Candidate Matching", status: "pending" },
        { name: "ranking", label: "Explainable Ranking & Top 10", status: "pending" },
      ],
    };

    this.searchRuns.unshift(newRun);
    req.status = "Searching";

    // Simulate search connector pipeline
    const connector = getCandidateSearchConnector();
    const searchResult = await connector.search({
      mandatorySkills: req.mandatorySkills,
      minExperience: req.minExperience,
      maxExperience: req.maxExperience,
      location: req.location,
    });

    newRun.candidateCount = searchResult.candidates.length;
    newRun.processedResumeCount = searchResult.candidates.length;
    newRun.status = "Completed";
    newRun.completedAt = new Date().toISOString();

    let topScore = 0;
    for (const c of searchResult.candidates) {
      const match = this.matcher.evaluate(c, req);
      this.matchResultsCache.set(`${c.id}-${req.id}`, match);
      if (match.overallScore > topScore) topScore = match.overallScore;
    }

    newRun.topMatchScore = topScore;
    req.status = "Completed";
    req.candidateCount = searchResult.candidates.length;
    req.topMatchScore = topScore;

    // Complete all stages
    if (newRun.stages) {
      newRun.stages.forEach((s) => {
        s.status = "completed";
      });
    }

    this.addAuditLog("Execute Search Run", `${runId} for ${req.title}`);
    return newRun;
  }

  // --- Matching Weights ---
  public getWeights(): MatchingWeights {
    return { ...this.weights };
  }

  public updateWeights(weights: MatchingWeights): MatchingWeights {
    this.weights = { ...weights };
    this.matcher.setWeights(this.weights);
    this.matchResultsCache.clear();
    this.precomputeMatches();
    this.addAuditLog("Update Matching Weights", "Configured weighted scoring parameters");
    return this.weights;
  }

  // --- Integrations ---
  public getNaukriStatus() {
    return {
      connected: this.naukriConnected,
      statusMessage: this.naukriConnected
        ? "Connected to Authorized Naukri Resdex Enterprise API Gateway"
        : "Disconnected / Live credentials absent (operating in Sandbox Mock mode)",
      accountType: "Enterprise Corporate Recruiter Tier",
      lastSync: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      availableCredits: 4850,
      dailySearchesUsed: 42,
      dailySearchLimit: 500,
      environment: "Sandbox Mock Mode" as const,
      authType: "Enterprise OAuth2 / Token Adapter" as const,
    };
  }

  public setNaukriConnected(connected: boolean) {
    this.naukriConnected = connected;
    this.addAuditLog("Toggle Integration", `Naukri Resdex ${connected ? "Enabled" : "Disabled"}`);
    return this.getNaukriStatus();
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private addAuditLog(action: string, target: string, status: "Success" | "Warning" | "Info" = "Success") {
    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "Sarah Jenkins (Lead Recruiter)",
      action,
      target,
      status,
      ipAddress: "192.168.1.104",
    });
  }
}

// Global Singleton
const globalForStore = globalThis as unknown as { appStore?: DataStore };
export const store = globalForStore.appStore ?? new DataStore();
if (process.env.NODE_ENV !== "production") globalForStore.appStore = store;
