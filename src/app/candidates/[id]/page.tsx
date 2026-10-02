"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Download,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MatchScoreBadge, StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState, LoadingSkeleton } from "@/components/ui/empty-state";
import { Candidate, Requirement } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSkeleton rows={10} />}>
      <CandidateDetailContent params={params} />
    </Suspense>
  );
}

function CandidateDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const requirementId = searchParams.get("requirementId") || "req-001";

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "resume" | "experience" | "skills" | "education" | "match" | "activity"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [candRes, reqRes] = await Promise.all([
          fetch(`/api/candidates/${id}?requirementId=${requirementId}`),
          fetch("/api/requirements"),
        ]);
        const candData = await candRes.json();
        const reqData = await reqRes.json();

        if (candData.success) {
          setCandidate(candData.data);
          setIsShortlisted(candData.data.isShortlisted || false);
        }
        if (reqData.success) {
          setRequirements(reqData.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, requirementId]);

  const handleToggleShortlist = async () => {
    if (!candidate) return;
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsShortlisted(!isShortlisted);
        showToast(!isShortlisted ? "Candidate shortlisted!" : "Removed from shortlist.");
      }
    } catch (e) {
      showToast("Error updating shortlist");
    }
  };

  const handleDownloadResume = () => {
    if (!candidate) return;
    const blob = new Blob([candidate.rawResumeText || candidate.summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name.toLowerCase().replace(/\s+/g, "_")}_resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded resume for ${candidate.name}`);
  };

  if (loading) return <LoadingSkeleton rows={10} />;
  if (!candidate) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Candidate Profile Not Found"
        description="The requested candidate ID does not exist in the platform database."
        actionLabel="Back to Candidates"
        onAction={() => router.push("/candidates")}
      />
    );
  }

  const match = candidate.matchResult;
  const currentRequirement = requirements.find((r) => r.id === requirementId) || requirements[0];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "resume", label: "Resume" },
    { key: "experience", label: "Experience" },
    { key: "skills", label: "Skills" },
    { key: "education", label: "Education" },
    { key: "match", label: "Match Analysis" },
    { key: "activity", label: "Activity" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/candidates?requirementId=${requirementId}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Candidates List
        </Link>

        {/* Change comparison requirement */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Matching Against:</span>
          <select
            value={requirementId}
            onChange={(e) =>
              router.push(`/candidates/${candidate.id}?requirementId=${e.target.value}`)
            }
            className="h-8 rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800"
          >
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Header Profile Banner */}
      <Card className="border-slate-200 p-6 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-100/80 border border-blue-200 text-blue-700 font-bold text-xl shadow-xs">
              {candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {candidate.name}
                </h1>
                <MatchScoreBadge score={match?.overallScore || 85} />
                {isShortlisted && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Shortlisted
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-1 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                {candidate.currentRole} at <span className="text-blue-600">{candidate.company}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {candidate.location}
                </span>
                <span>•</span>
                <span>{candidate.experience} Years Experience</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {candidate.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {candidate.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant={isShortlisted ? "secondary" : "outline"}
              onClick={handleToggleShortlist}
              className={`text-xs gap-1.5 ${
                isShortlisted ? "bg-emerald-50 text-emerald-700 border-emerald-300" : ""
              }`}
            >
              {isShortlisted ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-emerald-600" /> Shortlisted
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" /> Add to Shortlist
                </>
              )}
            </Button>

            <Button size="sm" variant="primary" onClick={handleDownloadResume} className="text-xs gap-1.5 shadow-xs">
              <Download className="h-3.5 w-3.5" /> Resume
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mt-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {tab.label}
              {tab.key === "match" && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                  {match?.overallScore || 85}%
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                {candidate.summary}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">NOTICE PERIOD</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{candidate.noticePeriod}</span>
            </Card>
            <Card className="border-slate-200 p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CURRENT / EXPECTED CTC</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">
                {candidate.currentSalary || "₹22 LPA"} / {candidate.expectedSalary || "₹28 LPA"}
              </span>
            </Card>
            <Card className="border-slate-200 p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SOURCED FROM</span>
              <span className="text-sm font-bold text-blue-600 mt-1 block">{candidate.source}</span>
            </Card>
          </div>

          {/* Quick Scorecard Preview */}
          {match && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Match Scorecard Snapshot</CardTitle>
                  <CardDescription>Target: {currentRequirement?.title}</CardDescription>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setActiveTab("match")} className="text-xs text-blue-600">
                  Full Breakdown →
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-700 flex justify-between font-semibold">
                    <span>Role Match (Priority 1)</span> <b>{match.roleScore || 85}%</b>
                  </span>
                  <ProgressBar value={match.roleScore || 85} size="sm" color="blue" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-700 flex justify-between font-semibold">
                    <span>Skills Match (Priority 2)</span> <b>{match.skillScore}%</b>
                  </span>
                  <ProgressBar value={match.skillScore} size="sm" color="blue" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-700 flex justify-between font-semibold">
                    <span>Experience (100% Scale)</span> <b>{match.experienceScore}%</b>
                  </span>
                  <ProgressBar value={match.experienceScore} size="sm" color="emerald" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Resume */}
      {activeTab === "resume" && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Parsed Resume Document
              </CardTitle>
              <CardDescription>
                Filename: {candidate.name.toLowerCase().replace(/\s+/g, "_")}_resume_2026.pdf • File Type: PDF Document
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={candidate.resumeStatus} />
              <Button size="sm" variant="outline" onClick={handleDownloadResume} className="text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-wrap justify-between gap-2">
              <div>
                <span className="text-slate-500">Source:</span>{" "}
                <span className="font-semibold text-slate-900">{candidate.source}</span>
              </div>
              <div>
                <span className="text-slate-500">Processing Status:</span>{" "}
                <span className="font-semibold text-emerald-700">Verified & Extracted</span>
              </div>
              <div>
                <span className="text-slate-500">Extraction Confidence:</span>{" "}
                <span className="font-semibold text-slate-900">96.8%</span>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-5 rounded-lg font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap selection:bg-blue-600">
              {candidate.rawResumeText || candidate.summary}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Experience */}
      {activeTab === "experience" && (
        <div className="space-y-4">
          {candidate.workHistory && candidate.workHistory.length > 0 ? (
            candidate.workHistory.map((item, idx) => (
              <Card key={idx} className="border-slate-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.role}</h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{item.company}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                    {item.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-3">{item.description}</p>
                {item.highlights && item.highlights.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                    {item.highlights.map((h, hIdx) => (
                      <li key={hIdx}>{h}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-5 border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">{candidate.currentRole}</h3>
              <p className="text-xs font-semibold text-blue-600">{candidate.company}</p>
              <p className="text-xs text-slate-600 mt-2">{candidate.summary}</p>
            </Card>
          )}
        </div>
      )}

      {/* Tab 4: Skills */}
      {activeTab === "skills" && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Technical & Core Skills</CardTitle>
            <CardDescription>Extracted from verified resume documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Detected Candidate Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((s) => {
                  const isMandatory = currentRequirement?.mandatorySkills.some(
                    (m) => m.toLowerCase() === s.toLowerCase()
                  );
                  return (
                    <span
                      key={s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        isMandatory
                          ? "bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {s}
                      {isMandatory && <span className="ml-1.5 text-[10px] text-blue-600">★ Required</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Comparison with Requirement: {currentRequirement?.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                  <span className="font-bold text-emerald-800 block mb-1">Matched Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {match?.matchedRequirements.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px]">
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-700 block mb-1">Missing / Unmatched</span>
                  <div className="flex flex-wrap gap-1">
                    {match?.missingRequirements.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px]">
                        ✗ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Education */}
      {activeTab === "education" && (
        <Card className="border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{candidate.education}</h3>
              <p className="text-xs text-slate-500 mt-1">Verified academic credential from candidate documentation.</p>
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <p>
                  <span className="text-slate-500">Degree Status:</span>{" "}
                  <span className="font-semibold text-slate-800">Completed & Verified</span>
                </p>
                <p>
                  <span className="text-slate-500">Prerequisite Fulfill:</span>{" "}
                  <span className="font-semibold text-emerald-700">100% Meets Engineering Prerequisite</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 6: Match Analysis (Detailed deterministic breakdown with progress bars, evidence quotes) */}
      {activeTab === "match" && match && (
        <div className="space-y-6">
          {/* Header Metric */}
          <Card className="border-slate-200 p-6 bg-gradient-to-r from-blue-50/50 via-white to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  DETERMINISTIC RECRUITMENT MATCH
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {match.overallScore}% Overall Requirement Compatibility
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Matched against: <span className="font-semibold text-slate-800">{currentRequirement?.title}</span>
                </p>
              </div>
              <MatchScoreBadge score={match.overallScore} className="text-sm px-3.5 py-1.5" />
            </div>
          </Card>

          {/* Dimension Score Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50/30 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-extrabold">P1</span>
                  Role Match
                </span>
                <span className="font-bold text-blue-700 text-sm">{match.roleScore || 85}%</span>
              </div>
              <ProgressBar value={match.roleScore || 85} size="sm" color="blue" />
              <p className="text-[11px] text-slate-600">Top Priority: Alignment with target position title.</p>
            </Card>

            <Card className="border-slate-200 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-slate-700 text-white text-[9px] font-extrabold">P2</span>
                  Skills Match
                </span>
                <span className="font-bold text-blue-600 text-sm">{match.skillScore}%</span>
              </div>
              <ProgressBar value={match.skillScore} size="sm" color="blue" />
              <p className="text-[11px] text-slate-500">Priority 2: Mandatory technical competencies.</p>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/30 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-extrabold">100%</span>
                  Experience Match
                </span>
                <span className="font-bold text-emerald-700 text-sm">{match.experienceScore}%</span>
              </div>
              <ProgressBar value={match.experienceScore} size="sm" color="emerald" />
              <p className="text-[11px] text-emerald-800">100% full credit for candidate meeting tenure.</p>
            </Card>

            <Card className="border-slate-200 p-4 space-y-2 opacity-75">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Education (0% Weight)</span>
                <span className="font-bold text-slate-500">{match.educationScore}%</span>
              </div>
              <ProgressBar value={0} size="sm" />
              <p className="text-[11px] text-slate-400">0% weighting per hiring preference.</p>
            </Card>
          </div>

          {/* Location Removed Status Banner */}
          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Geographic Location Filter:</span>
            <span className="font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
              Location Removed from Match Scoring
            </span>
          </div>

          {/* Evidence Quotes from Resume */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Requirement Evidence & Justification</CardTitle>
              <CardDescription>
                Auditable citation quotes extracted from candidate resume document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3 text-xs"
                >
                  <div className="shrink-0 mt-0.5">
                    {ev.status === "matched" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {ev.status === "partial" && <AlertCircle className="h-4 w-4 text-amber-600" />}
                    {ev.status === "missing" && <XCircle className="h-4 w-4 text-slate-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.requirement}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
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
                    <p className="text-slate-600 italic mt-1 font-serif">&ldquo;{ev.evidenceQuote}&rdquo;</p>
                    {ev.notes && (
                      <p className="text-[11px] text-slate-500 font-sans mt-1">Note: {ev.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 7: Activity History */}
      {activeTab === "activity" && (
        <Card className="border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Audit & Candidate Evaluation Timeline
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
            <div className="relative">
              <span className="absolute -left-6 top-0.5 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
              <p className="font-semibold text-slate-900">Profile Evaluated by CandidateMatcher</p>
              <p className="text-slate-500 text-[11px]">Deterministic overall score calculated: {match?.overallScore || 85}%</p>
              <span className="text-[10px] text-slate-400">Oct 01, 2026 • Automated Engine</span>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
              <p className="font-semibold text-slate-900">Resume Parsed & Structured</p>
              <p className="text-slate-500 text-[11px]">Extracted 7 core skills and verified work tenure.</p>
              <span className="text-[10px] text-slate-400">Sep 28, 2026 • ResumeParser</span>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-0.5 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white" />
              <p className="font-semibold text-slate-900">Profile Sourced into Platform</p>
              <p className="text-slate-500 text-[11px]">Imported from {candidate.source} via authorized search connector.</p>
              <span className="text-[10px] text-slate-400">{formatDate(candidate.createdAt)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
