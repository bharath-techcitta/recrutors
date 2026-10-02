"use client";

import React from "react";
import { X, Download, Briefcase, Mail, Phone, Award, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { MatchedCandidateData } from "./types";
import { downloadCandidateProfile } from "./download-utils";

interface CandidateModalProps {
  item: MatchedCandidateData | null;
  roleTitle: string;
  onClose: () => void;
  onToggleShortlist?: (id: string) => void;
}

export function CandidateModal({ item, roleTitle, onClose, onToggleShortlist }: CandidateModalProps) {
  if (!item) return null;
  const { candidate, match, shortlisted } = item;

  const scoreColor =
    match.overallScore >= 85
      ? "text-[#164A3A] bg-[#164A3A]/10 border-[#164A3A]/30"
      : "text-[#C9785C] bg-[#C9785C]/15 border-[#C9785C]/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#FFFFFF] border border-[#D9D7D0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1D2521]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#D9D7D0] bg-[#F7F6F2]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#164A3A] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              {candidate.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-[#1D2521] tracking-tight">{candidate.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-mono-numbers font-bold border ${scoreColor}`}>
                  {match.overallScore}% Match
                </span>
                {shortlisted && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9785C]/15 text-[#C9785C] border border-[#C9785C]/30">
                    ⭐ Shortlisted
                  </span>
                )}
              </div>
              <p className="text-base text-[#68716C] font-medium mt-0.5">
                {candidate.currentRole} • {candidate.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadCandidateProfile(item, roleTitle)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#164A3A] hover:bg-[#0F382C] text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download CV
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#68716C] hover:text-[#1D2521] hover:bg-[#EAE7DF] rounded-xl transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#D9D7D0]">
              <span className="text-xs text-[#68716C] block font-semibold uppercase tracking-wider">Total Experience</span>
              <span className="text-lg font-extrabold text-[#1D2521] font-mono-numbers flex items-center gap-1.5 mt-1">
                <Briefcase className="w-4 h-4 text-[#164A3A]" />
                {candidate.experience} Years
              </span>
              <span className="text-xs text-[#164A3A] font-mono-numbers font-semibold mt-0.5 block">100% Weight Credit</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#D9D7D0]">
              <span className="text-xs text-[#68716C] block font-semibold uppercase tracking-wider">Notice Period</span>
              <span className="text-lg font-extrabold text-[#1D2521] flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-[#C9785C]" />
                {candidate.noticePeriod}
              </span>
              <span className="text-xs text-[#68716C] font-medium mt-0.5 block">Availability</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#D9D7D0]">
              <span className="text-xs text-[#68716C] block font-semibold uppercase tracking-wider">Email Contact</span>
              <span className="text-sm font-semibold text-[#1D2521] flex items-center gap-1.5 mt-1.5 truncate" title={candidate.email}>
                <Mail className="w-4 h-4 text-[#68716C] flex-shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </span>
              <span className="text-xs text-[#68716C] font-medium mt-0.5 block">Verified</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#D9D7D0]">
              <span className="text-xs text-[#68716C] block font-semibold uppercase tracking-wider">Phone / Mobile</span>
              <span className="text-sm font-mono-numbers font-semibold text-[#1D2521] flex items-center gap-1.5 mt-1.5 truncate">
                <Phone className="w-4 h-4 text-[#68716C] flex-shrink-0" />
                {candidate.phone}
              </span>
              <span className="text-xs text-[#68716C] font-medium mt-0.5 block">Direct</span>
            </div>
          </div>

          {/* Deterministic Match Breakdown */}
          <div className="p-5 rounded-2xl bg-[#F7F6F2] border border-[#D9D7D0] space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D2521] flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#164A3A]" />
                Scoring Evaluation
              </h3>
              <span className="text-xs text-[#68716C] font-mono-numbers font-medium">Deterministic Matching Engine</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-mono-numbers">
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D9D7D0]">
                <div className="text-[#68716C] text-xs font-semibold">Role Match (45%)</div>
                <div className="text-[#164A3A] font-bold text-base mt-1">{match.roleScore} / 45 pts</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D9D7D0]">
                <div className="text-[#68716C] text-xs font-semibold">Skills Match (35%)</div>
                <div className="text-[#164A3A] font-bold text-base mt-1">{match.skillScore} / 35 pts</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D9D7D0]">
                <div className="text-[#68716C] text-xs font-semibold">Experience (20%)</div>
                <div className="text-[#164A3A] font-bold text-base mt-1">{match.experienceScore} / 20 pts (100%)</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D9D7D0]">
                <div className="text-[#68716C] text-xs font-semibold">Education (0%)</div>
                <div className="text-[#68716C] font-bold text-base mt-1">{match.educationScore} / 0 pts</div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-[#164A3A] uppercase tracking-wider flex items-center gap-2 mb-2.5">
                <CheckCircle2 className="w-4 h-4" /> Matched Skills ({match.matchedRequirements.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {match.matchedRequirements.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-[#164A3A]/10 text-[#164A3A] border border-[#164A3A]/20"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {match.missingRequirements.length > 0 && (
              <div>
                <span className="text-xs font-bold text-[#C9785C] uppercase tracking-wider flex items-center gap-2 mb-2.5">
                  <AlertCircle className="w-4 h-4" /> Skill Gaps ({match.missingRequirements.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {match.missingRequirements.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-[#C9785C]/10 text-[#C9785C] border border-[#C9785C]/25"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Candidate Summary */}
          <div>
            <h4 className="text-xs font-bold text-[#1D2521] uppercase tracking-wider mb-2.5">Executive Summary</h4>
            <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#D9D7D0] text-sm md:text-base text-[#68716C] leading-relaxed">
              {candidate.summary}
            </div>
          </div>

          {/* Raw Resume Text / Full Profile */}
          {candidate.rawResumeText && (
            <div>
              <h4 className="text-xs font-bold text-[#1D2521] uppercase tracking-wider mb-2.5">Full Profile Dossier</h4>
              <pre className="p-4.5 rounded-xl bg-[#F7F6F2] border border-[#D9D7D0] text-sm text-[#1D2521] font-mono-numbers whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {candidate.rawResumeText}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-7 py-4 border-t border-[#D9D7D0] bg-[#F7F6F2] flex items-center justify-between">
          {onToggleShortlist ? (
            <button
              onClick={() => onToggleShortlist(candidate.id)}
              className={`px-4 py-2 text-sm font-bold rounded-xl border transition cursor-pointer ${
                shortlisted
                  ? "bg-[#C9785C]/15 text-[#C9785C] border-[#C9785C]/40"
                  : "bg-[#FFFFFF] text-[#68716C] border-[#D9D7D0] hover:text-[#C9785C] hover:border-[#C9785C]/40"
              }`}
            >
              {shortlisted ? "★ Shortlisted" : "☆ Add to Shortlist"}
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#68716C] hover:text-[#1D2521] transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => downloadCandidateProfile(item, roleTitle)}
              className="flex items-center gap-2 px-4.5 py-2 text-sm font-bold bg-[#164A3A] hover:bg-[#0F382C] text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Profile JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
