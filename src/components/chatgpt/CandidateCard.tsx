"use client";

import React from "react";
import { Download, ExternalLink, Briefcase, CheckCircle2, Star } from "lucide-react";
import { MatchedCandidateData } from "./types";
import { downloadCandidateProfile } from "./download-utils";

interface CandidateCardProps {
  item: MatchedCandidateData;
  roleTitle: string;
  onViewDetails: (item: MatchedCandidateData) => void;
  onToggleShortlist?: (id: string) => void;
}

export function CandidateCard({
  item,
  roleTitle,
  onViewDetails,
  onToggleShortlist,
}: CandidateCardProps) {
  const { candidate, match, shortlisted } = item;

  const scoreBadgeColor =
    match.overallScore >= 85
      ? "bg-[#164A3A]/10 text-[#164A3A] border-[#164A3A]/30"
      : "bg-[#C9785C]/15 text-[#C9785C] border-[#C9785C]/30";

  return (
    <div className="group relative rounded-2xl bg-[#FFFFFF] hover:bg-[#FFFFFF] border border-[#D9D7D0] hover:border-[#164A3A]/50 p-5 transition-all duration-150 flex flex-col justify-between shadow-xs hover:shadow-md">
      <div>
        {/* Top Header: Candidate Name, Role & Score */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#164A3A] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
              {candidate.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4
                  onClick={() => onViewDetails(item)}
                  className="font-bold text-[#1D2521] text-lg hover:text-[#164A3A] transition cursor-pointer tracking-tight"
                >
                  {candidate.name}
                </h4>
                {shortlisted && (
                  <span className="text-[#C9785C] text-sm flex items-center gap-0.5" title="Shortlisted">
                    <Star className="w-4 h-4 fill-[#C9785C]" />
                  </span>
                )}
              </div>
              <p className="text-sm text-[#68716C] font-medium">
                {candidate.currentRole} • <span className="text-[#68716C]/80">{candidate.company}</span>
              </p>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-base font-mono-numbers font-bold border flex items-center gap-1.5 ${scoreBadgeColor}`}>
            <span>{match.overallScore}%</span>
            <span className="text-xs font-semibold opacity-90">Match</span>
          </div>
        </div>

        {/* Experience & Criteria Highlight */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5 text-sm font-mono-numbers">
          <span className="px-2.5 py-1 rounded-lg bg-[#164A3A]/10 text-[#164A3A] border border-[#164A3A]/25 text-xs font-semibold flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            {candidate.experience} Yrs Exp (100%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#F7F6F2] text-[#68716C] border border-[#D9D7D0] text-xs font-medium">
            Role: {match.roleScore}/45
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#F7F6F2] text-[#68716C] border border-[#D9D7D0] text-xs font-medium">
            Skills: {match.skillScore}/35
          </span>
        </div>

        {/* Matched Skills Tags */}
        <div className="mb-3.5">
          <div className="flex flex-wrap gap-2 max-h-20 overflow-hidden">
            {match.matchedRequirements.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F7F6F2] text-[#1D2521] border border-[#D9D7D0] flex items-center gap-1.5 tracking-tight"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#164A3A]" />
                {skill}
              </span>
            ))}
            {match.matchedRequirements.length > 5 && (
              <span className="px-2 py-1 text-xs text-[#68716C] font-mono-numbers font-semibold self-center">
                +{match.matchedRequirements.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Brief Summary Excerpt */}
        <p className="text-sm text-[#68716C] line-clamp-2 leading-relaxed mb-4 tracking-tight">
          {candidate.summary}
        </p>
      </div>

      {/* Card Action Buttons */}
      <div className="pt-3.5 border-t border-[#D9D7D0] flex items-center justify-between gap-3">
        <button
          onClick={() => onViewDetails(item)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#1D2521] hover:text-[#164A3A] transition px-2.5 py-1.5 rounded-lg hover:bg-[#F7F6F2] border border-[#D9D7D0] hover:border-[#164A3A]/40 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-[#68716C]" />
          Dossier
        </button>

        <div className="flex items-center gap-2">
          {onToggleShortlist && (
            <button
              onClick={() => onToggleShortlist(candidate.id)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                shortlisted
                  ? "bg-[#C9785C]/15 text-[#C9785C] border-[#C9785C]/40"
                  : "bg-[#FFFFFF] text-[#68716C] border-[#D9D7D0] hover:text-[#C9785C] hover:border-[#C9785C]/40"
              }`}
              title={shortlisted ? "Remove shortlist" : "Add to shortlist"}
            >
              <Star className={`w-4 h-4 ${shortlisted ? "fill-[#C9785C]" : ""}`} />
            </button>
          )}

          <button
            onClick={() => downloadCandidateProfile(item, roleTitle)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-bold bg-[#164A3A] hover:bg-[#0F382C] text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download CV
          </button>
        </div>
      </div>
    </div>
  );
}
