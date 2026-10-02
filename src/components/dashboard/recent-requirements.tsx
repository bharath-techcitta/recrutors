"use client";

import React from "react";
import Link from "next/link";
import { Requirement } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge, MatchScoreBadge } from "@/components/ui/badge";
import { Briefcase, ArrowUpRight, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function RecentRequirementsTable({ requirements }: { requirements: Requirement[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-600" />
            Recent Hiring Requirements
          </CardTitle>
          <CardDescription>Structured hiring criteria and active sourcing pipelines</CardDescription>
        </div>
        <Link href="/requirements">
          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800">
            View All ({requirements.length}) <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-center">Candidates</th>
              <th className="py-3 px-4 text-center">Top Match</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requirements.slice(0, 5).map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  <Link href={`/requirements/${req.id}`} className="hover:text-blue-600 hover:underline">
                    {req.title}
                  </Link>
                  <p className="text-[10px] text-slate-400 font-normal">{req.id}</p>
                </td>
                <td className="py-3.5 px-4 text-slate-600">{req.department}</td>
                <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> {req.location}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                  {req.candidateCount || 0}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {req.topMatchScore ? (
                    <MatchScoreBadge score={req.topMatchScore} />
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={req.status} />
                </td>
                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                  {formatDate(req.createdAt)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/requirements/${req.id}`}>
                      <Button size="sm" variant="outline" className="text-[11px] h-7 px-2">
                        View
                      </Button>
                    </Link>
                    <Link href={`/candidates?requirementId=${req.id}`}>
                      <Button size="sm" variant="subtle" className="text-[11px] h-7 px-2">
                        Candidates
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
