"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Users,
  FileBarChart,
  Edit,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge, MatchScoreBadge } from "@/components/ui/badge";
import { EmptyState, LoadingSkeleton } from "@/components/ui/empty-state";
import { Requirement, Candidate } from "@/types";
import { formatDate } from "@/lib/utils";

export default function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reqRes, candRes] = await Promise.all([
          fetch(`/api/requirements/${id}`),
          fetch(`/api/candidates?requirementId=${id}`),
        ]);

        const reqData = await reqRes.json();
        const candData = await candRes.json();

        if (reqData.success) setRequirement(reqData.data);
        if (candData.success) setCandidates(candData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStartSearch = async () => {
    if (!requirement) return;
    setSearching(true);
    try {
      const res = await fetch("/api/search-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementId: requirement.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/search-runs?runId=${data.data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={8} />;
  if (!requirement) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Requirement Not Found"
        description="The hiring requirement ID does not exist or has been deleted."
        actionLabel="Back to Requirements"
        onAction={() => router.push("/requirements")}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/requirements"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Link>

        {/* 4 Required Actions: Edit, Start Search, View Candidates, Export Report */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={handleStartSearch}
            isLoading={searching}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Start Candidate Search
          </Button>

          <Link href={`/candidates?requirementId=${requirement.id}`}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              View Candidates ({candidates.length})
            </Button>
          </Link>

          <Link href={`/reports?requirementId=${requirement.id}`}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <FileBarChart className="h-3.5 w-3.5 text-indigo-600" />
              Export Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {requirement.title}
              </h1>
              <StatusBadge status={requirement.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-4">
              <span className="font-mono">{requirement.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" /> {requirement.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {requirement.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Created {formatDate(requirement.createdAt)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">CANDIDATES</span>
              <span className="text-lg font-bold text-slate-900">{candidates.length}</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">TOP MATCH</span>
              {requirement.topMatchScore ? (
                <MatchScoreBadge score={requirement.topMatchScore} />
              ) : (
                <span className="text-xs text-slate-400 font-medium">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Job Summary */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Job Description & Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-200">
            {requirement.description || "No full description provided."}
          </p>
        </div>
      </Card>

      {/* Structured Requirements Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mandatory & Preferred Skills */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Technical Skill Criteria</CardTitle>
            <CardDescription>Deterministic core and preferred evaluation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-2">
                <span>Mandatory Skills (40% Weight)</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Strict Match
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {requirement.mandatorySkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-md border border-blue-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-2">
                <span>Preferred Skills (10% Weight)</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  Bonus Signal
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {requirement.preferredSkills.length > 0 ? (
                  requirement.preferredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No preferred skills listed.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Structured Experience, Education, Domain & Location */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Structured Profile Prerequisites</CardTitle>
            <CardDescription>Academic, domain tenure, and mobility filters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Experience Range (20%):</span>
              <span className="font-semibold text-slate-900">
                {requirement.minExperience} - {requirement.maxExperience} Years
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Education (10%):</span>
              <span className="font-semibold text-slate-900 text-right max-w-[240px]">
                {requirement.education}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Domain / Industry (10%):</span>
              <span className="font-semibold text-slate-900">{requirement.domain}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Target Location (10%):</span>
              <span className="font-semibold text-slate-900">{requirement.location}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-medium">Notice Period:</span>
              <span className="font-semibold text-slate-900">{requirement.noticePeriod}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Structured Search Criteria Box */}
      <Card className="border-slate-200 bg-slate-50/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Candidate Search Connector Payload
          </CardTitle>
          <CardDescription>
            Normalized criteria dispatched to authorized search connectors (Naukri Resdex / Internal DB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-[11px] font-mono bg-white p-3 rounded border border-slate-200 text-slate-800 overflow-x-auto">
            {JSON.stringify(
              {
                requirementId: requirement.id,
                keywords: requirement.mandatorySkills,
                optionalKeywords: requirement.preferredSkills,
                experience: { min: requirement.minExperience, max: requirement.maxExperience },
                location: requirement.location,
                domain: requirement.domain,
                noticePeriod: requirement.noticePeriod,
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
