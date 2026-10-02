"use client";

import React from "react";
import Link from "next/link";
import { SearchRun } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge, MatchScoreBadge } from "@/components/ui/badge";
import { SearchCode, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function RecentSearchRunsList({ searchRuns }: { searchRuns: SearchRun[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <SearchCode className="h-4 w-4 text-blue-600" />
            Recent External Search Runs
          </CardTitle>
          <CardDescription>Resdex connector pipeline runs and resume batch processing</CardDescription>
        </div>
        <Link href="/search-runs">
          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800">
            All Runs ({searchRuns.length}) <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Run ID</th>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Candidates Found</th>
              <th className="py-3 px-4 text-center">Resumes Processed</th>
              <th className="py-3 px-4 text-center">Top Match</th>
              <th className="py-3 px-4">Started At</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {searchRuns.slice(0, 4).map((run) => (
              <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{run.id}</td>
                <td className="py-3 px-4 font-medium text-slate-800">{run.requirementTitle}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={run.status} />
                </td>
                <td className="py-3 px-4 text-center font-semibold">{run.candidateCount}</td>
                <td className="py-3 px-4 text-center text-slate-600">{run.processedResumeCount}</td>
                <td className="py-3 px-4 text-center">
                  {run.topMatchScore ? (
                    <MatchScoreBadge score={run.topMatchScore} />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-500">{formatDate(run.startedAt)}</td>
                <td className="py-3 px-4 text-right">
                  <Link href={`/search-runs?runId=${run.id}`}>
                    <Button size="sm" variant="outline" className="text-[11px] h-7 px-2">
                      Pipeline
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
