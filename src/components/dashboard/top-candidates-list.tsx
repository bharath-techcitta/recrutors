"use client";

import React from "react";
import Link from "next/link";
import { Candidate } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MatchScoreBadge } from "@/components/ui/badge";
import { Users, ArrowUpRight, Building2, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopCandidatesList({
  candidates,
  onToggleShortlist,
}: {
  candidates: Candidate[];
  onToggleShortlist?: (id: string) => void;
}) {
  const topList = candidates.slice(0, 5);

  return (
    <Card className="h-full border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Top Matching Candidates
          </CardTitle>
          <CardDescription>Highest scoring profiles across active requirements</CardDescription>
        </div>
        <Link href="/candidates">
          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800">
            View All <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-100">
        {topList.map((cand) => (
          <div
            key={cand.id}
            className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 font-bold text-xs">
                {cand.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/candidates/${cand.id}`}
                    className="font-semibold text-xs text-slate-900 hover:text-blue-600 hover:underline truncate"
                  >
                    {cand.name}
                  </Link>
                  {cand.isShortlisted && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                      Shortlisted
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 truncate flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="h-3 w-3 text-slate-400" />
                  {cand.currentRole} • {cand.company}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" /> {cand.location}
                  </span>
                  <span>•</span>
                  <span>{cand.experience} yrs exp</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pl-3">
              <MatchScoreBadge score={cand.matchResult?.overallScore || 85} />
              <Link href={`/candidates/${cand.id}`}>
                <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                  Review
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
