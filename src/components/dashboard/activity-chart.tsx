"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, Calendar } from "lucide-react";

interface ActivityDataPoint {
  day: string;
  matched: number;
  parsed: number;
  shortlisted: number;
}

const weeklyData: ActivityDataPoint[] = [
  { day: "Mon", matched: 32, parsed: 28, shortlisted: 6 },
  { day: "Tue", matched: 45, parsed: 38, shortlisted: 9 },
  { day: "Wed", matched: 28, parsed: 25, shortlisted: 4 },
  { day: "Thu", matched: 56, parsed: 48, shortlisted: 14 },
  { day: "Fri", matched: 62, parsed: 54, shortlisted: 12 },
  { day: "Sat", matched: 22, parsed: 18, shortlisted: 3 },
  { day: "Sun", matched: 38, parsed: 35, shortlisted: 8 },
];

export function ActivityChart() {
  const [activeTab, setActiveTab] = useState<"matched" | "parsed" | "shortlisted">("matched");
  const maxVal = 70;

  return (
    <Card className="flex flex-col h-full border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            AI Matching & Processing Activity
          </CardTitle>
          <CardDescription>Daily candidate evaluations and pipeline volume (Last 7 Days)</CardDescription>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("matched")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === "matched" ? "bg-white text-blue-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Evaluated
          </button>
          <button
            onClick={() => setActiveTab("parsed")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === "parsed" ? "bg-white text-blue-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Resumes Parsed
          </button>
          <button
            onClick={() => setActiveTab("shortlisted")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === "shortlisted" ? "bg-white text-blue-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Shortlisted
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end pt-4">
        {/* Visual Bar Chart */}
        <div className="h-48 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100">
          {weeklyData.map((item) => {
            const val = item[activeTab];
            const heightPercent = Math.round((val / maxVal) * 100);

            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip value */}
                <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {val}
                </span>

                {/* Animated bar */}
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                      activeTab === "shortlisted"
                        ? "bg-emerald-500 group-hover:bg-emerald-600"
                        : "bg-blue-600 group-hover:bg-blue-700"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day label */}
                <span className="text-xs font-medium text-slate-500">{item.day}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
              Evaluated & Scored
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              Shortlisted
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="h-3 w-3" /> Sep 25 - Oct 01, 2026
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
