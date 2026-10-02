"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileBarChart2,
  Download,
  Printer,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MatchScoreBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState, LoadingSkeleton } from "@/components/ui/empty-state";
import { ReportSummary } from "@/lib/reporting/report-generator";
import { Requirement } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={8} />}>
      <ReportsContent />
    </Suspense>
  );
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialReqId = searchParams.get("requirementId") || "req-001";

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState(initialReqId);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await fetch("/api/requirements");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setRequirements(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRequirements();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reports?requirementId=${selectedReqId}`);
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedReqId]);

  const handleExportCSV = () => {
    window.location.href = `/api/reports?requirementId=${selectedReqId}&format=csv`;
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recruitment Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive matching analytics, talent pool skill coverage, and top candidate scorecards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Requirement Selector */}
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-600 max-w-[260px]"
          >
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Export CSV & Export PDF Buttons */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs gap-1.5"
            title="Download CSV Spreadsheet"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            Export CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handlePrintPDF}
            className="text-xs gap-1.5 shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={10} />
      ) : !report ? (
        <EmptyState
          icon={FileBarChart2}
          title="No Report Data"
          description="Could not generate report for the selected requirement."
        />
      ) : (
        <>
          {/* Printable Report Header */}
          <div className="hidden print:block mb-6 border-b border-slate-300 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">TalentMatch AI - Recruitment Matching Report</h1>
            <p className="text-xs text-slate-500 mt-1">
              Generated: {new Date(report.generatedAt).toLocaleString()} • Target Position: {report.requirement.title}
            </p>
          </div>

          {/* Requirement Summary Card with Key Counters */}
          <Card className="border-slate-200 p-6 bg-white shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  POSITION EVALUATION SUMMARY
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{report.requirement.title}</h2>
                <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>{report.requirement.department}</span>
                  <span>•</span>
                  <span>{report.requirement.location}</span>
                  <span>•</span>
                  <span>Target Exp: {report.requirement.minExperience}-{report.requirement.maxExperience} yrs</span>
                </p>
              </div>

              {/* 4 Key Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div className="p-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">FOUND</span>
                  <span className="text-lg font-bold text-slate-900">{report.totalFound}</span>
                </div>
                <div className="p-2 border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">PROCESSED</span>
                  <span className="text-lg font-bold text-emerald-700">{report.totalProcessed}</span>
                </div>
                <div className="p-2 border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">SHORTLISTED</span>
                  <span className="text-lg font-bold text-blue-700">{report.totalShortlisted}</span>
                </div>
                <div className="p-2 border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">AVG MATCH</span>
                  <span className="text-lg font-bold text-indigo-700">{report.averageMatchScore}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Top 10 Candidates Table */}
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Top 10 Ranked Candidates
              </CardTitle>
              <CardDescription>
                Deterministic match ranking calculated from skills, tenure, education, and domain rules
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3 text-center">Exp</th>
                    <th className="py-2.5 px-3 text-center">Role (P1)</th>
                    <th className="py-2.5 px-3 text-center">Skills (P2)</th>
                    <th className="py-2.5 px-3 text-center">Exp (100%)</th>
                    <th className="py-2.5 px-3 text-center">Match %</th>
                    <th className="py-2.5 px-3 text-center">Shortlist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.topCandidates.map((cand, idx) => (
                    <tr key={cand.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-400 text-center">#{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <Link
                          href={`/candidates/${cand.id}?requirementId=${selectedReqId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {cand.name}
                        </Link>
                        <span className="text-[10px] text-slate-400 block font-normal">{cand.currentRole}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{cand.company}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{cand.experience} yrs</td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-700">{cand.matchResult?.roleScore || 85}%</td>
                      <td className="py-3 px-3 text-center font-medium">{cand.matchResult?.skillScore || 100}%</td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-700">{cand.matchResult?.experienceScore || 100}%</td>
                      <td className="py-3 px-3 text-center">
                        <MatchScoreBadge score={cand.matchResult?.overallScore || 85} />
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">
                        {cand.isShortlisted ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            YES
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Charts: Score Breakdown & Skills Coverage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Breakdown Chart */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Candidate Pool Dimension Averages</CardTitle>
                <CardDescription>Mean scoring percentage across all evaluated candidates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px]">P1</span>
                      Role Alignment Average:
                    </span>
                    <span className="text-blue-700">{report.scoreBreakdownAverage.role}%</span>
                  </div>
                  <ProgressBar value={report.scoreBreakdownAverage.role} size="md" color="blue" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-700 text-white text-[9px]">P2</span>
                      Mandatory Skills Average:
                    </span>
                    <span className="text-blue-600">{report.scoreBreakdownAverage.skills}%</span>
                  </div>
                  <ProgressBar value={report.scoreBreakdownAverage.skills} size="md" color="blue" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-emerald-950 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px]">100%</span>
                      Experience Tenure Average:
                    </span>
                    <span className="text-emerald-700">{report.scoreBreakdownAverage.experience}%</span>
                  </div>
                  <ProgressBar value={report.scoreBreakdownAverage.experience} size="md" color="emerald" />
                </div>

                <div className="opacity-60">
                  <div className="flex justify-between font-semibold text-slate-600 mb-1">
                    <span>Education Requirement (0% Weight):</span>
                    <span>0%</span>
                  </div>
                  <ProgressBar value={0} size="md" />
                </div>

                <div className="p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded text-[11px] text-slate-500 flex justify-between">
                  <span>Location Requirement:</span>
                  <span className="font-semibold text-slate-700">Removed from match scoring</span>
                </div>
              </CardContent>
            </Card>

            {/* Skills Coverage Chart & Missing Skills Analysis */}
            <div className="space-y-6">
              {/* Skills Coverage Chart */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Skills Coverage Chart</CardTitle>
                  <CardDescription>Percentage of candidates possessing each mandatory skill</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {report.skillCoverage.map((sc) => (
                    <div key={sc.skill} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{sc.skill}</span>
                        <span className="text-slate-500 font-mono">
                          {sc.matchedCount} of {report.totalFound} ({sc.percentage}%)
                        </span>
                      </div>
                      <ProgressBar value={sc.percentage} size="sm" color="auto" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Missing Skills Analysis */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Missing Skill Analysis & Talent Gaps
                  </CardTitle>
                  <CardDescription>Skills with highest deficit in the sourced candidate pool</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {report.missingSkillsAnalysis.map((ms) => (
                    <div
                      key={ms.skill}
                      className="flex items-center justify-between p-2 rounded bg-amber-50/50 border border-amber-200/60"
                    >
                      <span className="font-semibold text-slate-800">{ms.skill}</span>
                      <span className="text-[11px] font-bold text-amber-800">
                        Missing in {ms.deficitCount} candidates ({ms.percentage}%)
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
