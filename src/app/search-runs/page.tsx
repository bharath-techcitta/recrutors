"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SearchCode,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Filter,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge, MatchScoreBadge } from "@/components/ui/badge";
import { Drawer, Modal } from "@/components/ui/dialog";
import { EmptyState, LoadingSkeleton } from "@/components/ui/empty-state";
import { Requirement, SearchRun } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function SearchRunsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={8} />}>
      <SearchRunsContent />
    </Suspense>
  );
}

function SearchRunsContent() {
  const searchParams = useSearchParams();
  const requestedRunId = searchParams.get("runId");

  const [searchRuns, setSearchRuns] = useState<SearchRun[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRun, setSelectedRun] = useState<SearchRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedReqForRun, setSelectedReqForRun] = useState<string>("");
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [runsRes, reqRes] = await Promise.all([
        fetch("/api/search-runs"),
        fetch("/api/requirements"),
      ]);
      const runsData = await runsRes.json();
      const reqData = await reqRes.json();

      if (runsData.success) {
        setSearchRuns(runsData.data);
        if (requestedRunId) {
          const matched = runsData.data.find((r: SearchRun) => r.id === requestedRunId);
          if (matched) setSelectedRun(matched);
        }
      }
      if (reqData.success) {
        setRequirements(reqData.data);
        if (reqData.data.length > 0 && !selectedReqForRun) {
          setSelectedReqForRun(reqData.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [requestedRunId]);

  const handleTriggerSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForRun) return;
    setIsTriggering(true);
    try {
      const res = await fetch("/api/search-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementId: selectedReqForRun }),
      });
      const data = await res.json();
      if (data.success) {
        setShowTriggerModal(false);
        fetchData();
        setSelectedRun(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggering(false);
    }
  };

  const pipelineStagesList = [
    { key: "req", title: "Requirement", desc: "Hiring criteria established and verified" },
    { key: "criteria", title: "Search Criteria", desc: "Converted to standardized search query" },
    { key: "search", title: "Search Results", desc: "Query executed against candidate source" },
    { key: "retrieval", title: "Resume Retrieval", desc: "Profile PDFs retrieved securely" },
    { key: "parsing", title: "Resume Processing", desc: "AI parsing into structured sections" },
    { key: "matching", title: "Matching", desc: "Deterministic weighted rule calculation" },
    { key: "ranking", title: "Ranking", desc: "Explainable multi-dimensional ordering" },
    { key: "top", title: "Top Candidates", desc: "Presentation of top scored profiles" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Search Runs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit history of external candidate discovery, resume ingestion, and scoring pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            isLoading={loading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowTriggerModal(true)}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Run New Search
          </Button>
        </div>
      </div>

      {/* Runs Table */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : searchRuns.length === 0 ? (
        <EmptyState
          icon={SearchCode}
          title="No Search Runs Found"
          description="Initiate a candidate search from a requirement to populate the execution pipeline history."
          actionLabel="Run New Search"
          onAction={() => setShowTriggerModal(true)}
        />
      ) : (
        <Card className="border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Run ID</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4 text-center">Candidates Found</th>
                  <th className="py-3 px-4 text-center">Resumes Processed</th>
                  <th className="py-3 px-4 text-center">Top Match</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searchRuns.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                      {run.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{run.requirementTitle}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{run.requirementId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatDateTime(run.startedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {run.candidateCount}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600">
                      {run.processedResumeCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {run.topMatchScore ? (
                        <MatchScoreBadge score={run.topMatchScore} />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="subtle"
                        className="text-[11px] h-7 px-2.5 gap-1 group-hover:bg-blue-600 group-hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRun(run);
                        }}
                      >
                        Pipeline <ChevronRight className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Interactive Detail Pipeline Drawer */}
      {selectedRun && (
        <Drawer
          isOpen={Boolean(selectedRun)}
          onClose={() => setSelectedRun(null)}
          title={`Pipeline Details: ${selectedRun.id}`}
          description={`Target Requirement: ${selectedRun.requirementTitle}`}
          width="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Run Overview Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Execution Status:</span>
                <StatusBadge status={selectedRun.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400">Started:</span> {formatDateTime(selectedRun.startedAt)}
                </div>
                <div>
                  <span className="text-slate-400">Completed:</span>{" "}
                  {selectedRun.completedAt ? formatDateTime(selectedRun.completedAt) : "In Progress..."}
                </div>
                <div>
                  <span className="text-slate-400">Profiles Sourced:</span> <b>{selectedRun.candidateCount}</b>
                </div>
                <div>
                  <span className="text-slate-400">Highest Score:</span> <b>{selectedRun.topMatchScore}%</b>
                </div>
              </div>

              {selectedRun.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-start gap-2 mt-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Error Notice:</span> {selectedRun.error}
                  </div>
                </div>
              )}
            </div>

            {/* The 8-Step Interactive Pipeline Flow */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] mb-3">
                End-to-End Processing Pipeline (8 Stages)
              </h4>

              <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {pipelineStagesList.map((stage, idx) => {
                  const isCompleted = selectedRun.status === "Completed" || (selectedRun.status === "Running" && idx < 4);
                  const isRunning = selectedRun.status === "Running" && idx === 4;
                  const isFailed = selectedRun.status === "Failed" && idx === 1;

                  return (
                    <div key={stage.key} className="relative">
                      <span
                        className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white flex items-center justify-center ${
                          isCompleted
                            ? "bg-emerald-500"
                            : isRunning
                            ? "bg-amber-500 animate-ping"
                            : isFailed
                            ? "bg-red-500"
                            : "bg-slate-300"
                        }`}
                      />

                      <div className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {stage.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700"
                                : isRunning
                                ? "bg-amber-50 text-amber-700"
                                : isFailed
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isCompleted ? "Completed" : isRunning ? "Running" : isFailed ? "Halted" : "Pending"}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Link
                href={`/candidates?requirementId=${selectedRun.requirementId}`}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View Scored Candidates <ExternalLink className="h-3 w-3" />
              </Link>
              <Button size="sm" variant="secondary" onClick={() => setSelectedRun(null)}>
                Close Drawer
              </Button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Trigger New Search Modal */}
      <Modal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        title="Execute Candidate Search Run"
        description="Query authorized recruitment connector and process resume matches."
        maxWidth="md"
      >
        <form onSubmit={handleTriggerSearch} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Hiring Requirement:
            </label>
            <select
              value={selectedReqForRun}
              onChange={(e) => setSelectedReqForRun(e.target.value)}
              className="h-9 w-full rounded border border-slate-300 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-blue-600"
            >
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.department} - {r.location})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
            <p className="font-semibold mb-1">Connector Security & Sandbox Safeguard:</p>
            <p>
              The platform executes searches compliant with Naukri Resdex rate limit policies and uses realistic simulation mocks when live credentials are not present.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTriggerModal(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isTriggering}>
              Start Pipeline Execution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
