"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Eye,
  FileText,
  BarChart2,
  Download,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchScoreBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState, LoadingSkeleton } from "@/components/ui/empty-state";
import { Candidate, Requirement } from "@/types";

export default function CandidatesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={8} />}>
      <CandidatesContent />
    </Suspense>
  );
}

function CandidatesContent() {
  const searchParams = useSearchParams();
  const initialReqId = searchParams.get("requirementId") || "req-001";
  const initialSearch = searchParams.get("search") || "";

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState(initialReqId);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [minMatch, setMinMatch] = useState<number>(0);
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [skillFilter, setSkillFilter] = useState("ALL");
  const [shortlistedOnly, setShortlistedOnly] = useState(false);

  // Modals for Row Actions
  const [activeResumeCandidate, setActiveResumeCandidate] = useState<Candidate | null>(null);
  const [activeAnalysisCandidate, setActiveAnalysisCandidate] = useState<Candidate | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, candRes] = await Promise.all([
        fetch("/api/requirements"),
        fetch(`/api/candidates?requirementId=${selectedReqId}`),
      ]);
      const reqData = await reqRes.json();
      const candData = await candRes.json();

      if (reqData.success) setRequirements(reqData.data);
      if (candData.success) setCandidates(candData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedReqId]);

  const handleToggleShortlist = async (candId: string, currentStatus?: boolean) => {
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candId }),
      });
      const data = await res.json();
      if (data.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === candId ? { ...c, isShortlisted: !currentStatus } : c))
        );
        showToast(
          !currentStatus ? "Candidate added to shortlist." : "Candidate removed from shortlist."
        );
      }
    } catch (e) {
      showToast("Error updating shortlist.");
    }
  };

  const handleDownloadResume = (cand: Candidate) => {
    const element = document.createElement("a");
    const file = new Blob([cand.rawResumeText || cand.summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${cand.name.toLowerCase().replace(/\s+/g, "_")}_resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloading ${cand.name}'s resume document`);
  };

  // Filter logic
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const q = search.toLowerCase();
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));

      const matchScore = (c.matchResult?.overallScore || 0) >= minMatch;
      const matchLoc = locationFilter === "ALL" || c.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchSkill = skillFilter === "ALL" || c.skills.some((s) => s.toLowerCase() === skillFilter.toLowerCase());
      const matchShortlist = !shortlistedOnly || c.isShortlisted;

      return matchQuery && matchScore && matchLoc && matchSkill && matchShortlist;
    });
  }, [candidates, search, minMatch, locationFilter, skillFilter, shortlistedOnly]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and review candidates evaluated against structured hiring criteria.
          </p>
        </div>

        {/* Selected Target Requirement Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Target Role:</span>
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-600 max-w-[280px]"
          >
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, role, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Min Match % */}
          <div>
            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value={0}>All Match Scores</option>
              <option value={85}>85%+ (High Match)</option>
              <option value={75}>75%+ (Good Match)</option>
              <option value={65}>65%+ (Medium)</option>
              <option value={50}>50%+ (Broad)</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Locations</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          {/* Key Skill */}
          <div>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Skills</option>
              <option value="Python">Python</option>
              <option value="FastAPI">FastAPI</option>
              <option value="AWS">AWS</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="React">React</option>
              <option value="Kubernetes">Kubernetes</option>
              <option value="Terraform">Terraform</option>
              <option value="PyTorch">PyTorch</option>
            </select>
          </div>

          {/* Shortlisted Only toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setShortlistedOnly(!shortlistedOnly)}
              className={`h-9 w-full rounded-md text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                shortlistedOnly
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              {shortlistedOnly ? "Shortlisted Only" : "Show Shortlisted"}
            </button>
          </div>
        </div>
      </Card>

      {/* Candidate Data Table */}
      {loading ? (
        <LoadingSkeleton rows={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Candidates Found"
          description="Try broadening your match score slider, removing location filters, or running a fresh search run."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch("");
            setMinMatch(0);
            setLocationFilter("ALL");
            setSkillFilter("ALL");
            setShortlistedOnly(false);
          }}
        />
      ) : (
        <Card className="border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Current Role & Company</th>
                  <th className="py-3 px-4 text-center">Experience</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Key Skills</th>
                  <th className="py-3 px-4 text-center">Match %</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Candidate */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {cand.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <Link
                            href={`/candidates/${cand.id}?requirementId=${selectedReqId}`}
                            className="font-bold text-slate-900 hover:text-blue-600 hover:underline block"
                          >
                            {cand.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">{cand.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Company */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{cand.currentRole}</span>
                      <span className="text-slate-500 text-[11px]">{cand.company}</span>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {cand.experience} yrs
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {cand.location}
                      </span>
                    </td>

                    {/* Key Skills */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {cand.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2 rounded border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                        {cand.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{cand.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Match Score Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <MatchScoreBadge score={cand.matchResult?.overallScore || 75} />
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 font-medium">
                      {cand.source}
                    </td>

                    {/* 5 Row Actions: View Profile, View Resume, View Match Analysis, Download Resume, Add to Shortlist */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/candidates/${cand.id}?requirementId=${selectedReqId}`}
                          title="View Full Candidate Profile"
                        >
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-blue-600">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <button
                          onClick={() => setActiveResumeCandidate(cand)}
                          className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="View Resume Text Preview"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setActiveAnalysisCandidate(cand)}
                          className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="View Match Analysis Breakdown"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadResume(cand)}
                          className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Download Parsed Resume"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleShortlist(cand.id, cand.isShortlisted)}
                          className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
                            cand.isShortlisted
                              ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                          }`}
                          title={cand.isShortlisted ? "Shortlisted" : "Add to Shortlist"}
                        >
                          {cand.isShortlisted ? (
                            <BookmarkCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* View Resume Preview Modal */}
      {activeResumeCandidate && (
        <Modal
          isOpen={Boolean(activeResumeCandidate)}
          onClose={() => setActiveResumeCandidate(null)}
          title={`Resume Preview: ${activeResumeCandidate.name}`}
          description={`Retrieved via ${activeResumeCandidate.source} • Status: ${activeResumeCandidate.resumeStatus}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <p className="font-semibold text-slate-900">
                  {activeResumeCandidate.name.toLowerCase().replace(/\s+/g, "_")}_resume_2026.pdf
                </p>
                <p className="text-[11px] text-slate-500">Format: Standard ATS Text • Extracted: Verified</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadResume(activeResumeCandidate)}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap selection:bg-blue-600">
              {activeResumeCandidate.rawResumeText || activeResumeCandidate.summary}
            </div>

            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setActiveResumeCandidate(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Match Analysis Modal */}
      {activeAnalysisCandidate && (
        <Modal
          isOpen={Boolean(activeAnalysisCandidate)}
          onClose={() => setActiveAnalysisCandidate(null)}
          title={`Match Analysis: ${activeAnalysisCandidate.name}`}
          description={`Evaluated against: ${requirements.find((r) => r.id === selectedReqId)?.title || "Selected Requirement"}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Overall Score Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  DETERMINISTIC OVERALL SCORE
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {activeAnalysisCandidate.matchResult?.overallScore || 85}%
                </span>
              </div>
              <MatchScoreBadge score={activeAnalysisCandidate.matchResult?.overallScore || 85} />
            </div>

            {/* Score Breakdown (Role, Skills, Experience, Education, Location Removed) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Score Breakdown by Priority Dimensions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-md space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-extrabold">P1</span>
                      Role Match (Priority 1):
                    </span>
                    <span className="text-blue-700">{activeAnalysisCandidate.matchResult?.roleScore || 85}%</span>
                  </div>
                  <ProgressBar value={activeAnalysisCandidate.matchResult?.roleScore || 85} size="sm" color="blue" />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 rounded bg-slate-700 text-white text-[9px] font-extrabold">P2</span>
                      Skills Match (Priority 2):
                    </span>
                    <span className="text-blue-600">{activeAnalysisCandidate.matchResult?.skillScore || 100}%</span>
                  </div>
                  <ProgressBar value={activeAnalysisCandidate.matchResult?.skillScore || 100} size="sm" color="blue" />
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-md space-y-1.5">
                  <div className="flex justify-between font-bold text-emerald-950">
                    <span className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-extrabold">100%</span>
                      Experience (100% Scale):
                    </span>
                    <span className="text-emerald-700">{activeAnalysisCandidate.matchResult?.experienceScore || 100}%</span>
                  </div>
                  <ProgressBar value={activeAnalysisCandidate.matchResult?.experienceScore || 100} size="sm" color="emerald" />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5 opacity-70">
                  <div className="flex justify-between font-semibold text-slate-600">
                    <span>Education (0% Weight):</span>
                    <span>0%</span>
                  </div>
                  <ProgressBar value={0} size="sm" />
                </div>
              </div>

              {/* Location Removed notice */}
              <div className="p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded text-[11px] text-slate-500 flex justify-between items-center">
                <span>Location Constraint:</span>
                <span className="font-semibold text-slate-700">Removed from match calculation</span>
              </div>
            </div>

            {/* Matched vs Missing Evidence */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Matched & Missing Evidence Quotes
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeAnalysisCandidate.matchResult?.evidence?.map((ev, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start gap-2"
                  >
                    {ev.status === "matched" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                    {ev.status === "partial" && <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />}
                    {ev.status === "missing" && <XCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-800">{ev.requirement}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            ev.status === "matched"
                              ? "bg-emerald-100 text-emerald-800"
                              : ev.status === "partial"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic mt-0.5">&ldquo;{ev.evidenceQuote}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link href={`/candidates/${activeAnalysisCandidate.id}?requirementId=${selectedReqId}`}>
                <Button size="sm" variant="primary" className="text-xs">
                  Open Full Candidate Page
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setActiveAnalysisCandidate(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
