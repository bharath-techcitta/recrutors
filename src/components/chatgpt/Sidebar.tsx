"use client";

import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Sparkles,
  Users,
  Search,
} from "lucide-react";
import { ChatSession } from "./types";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  isOpen,
  onToggleOpen,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: SidebarProps) {
  const [filterText, setFilterText] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-80 bg-[#F2F0EA] border-r border-[#D9D7D0] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-[#D9D7D0] flex items-center justify-between bg-[#F2F0EA]">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-[#164A3A] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#1D2521] tracking-tight">TalentGPT</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono-numbers font-semibold bg-[#FFFFFF] text-[#68716C] border border-[#D9D7D0]">
                v0.4
              </span>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1.5 text-[#68716C] hover:text-[#1D2521] hover:bg-[#EAE7DF] rounded-lg transition cursor-pointer"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button - Primary Button #164A3A */}
        <div className="p-3.5">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#164A3A] hover:bg-[#0F382C] text-white shadow-sm transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-white/20 text-white flex items-center justify-center transition">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">New Requirement</span>
            </div>
            <kbd className="text-xs font-mono-numbers px-2 py-0.5 rounded bg-white/15 text-white/90 border border-white/20">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Search Past Requirements */}
        {sessions.length > 2 && (
          <div className="px-3.5 pb-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#68716C] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter searches..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-[#FFFFFF] border border-[#D9D7D0] focus:border-[#164A3A] rounded-lg text-[#1D2521] placeholder-[#68716C] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>
        )}

        {/* Recent Chats Section */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1.5 space-y-1">
          <div className="px-3 py-1.5 text-xs font-bold tracking-wider text-[#68716C] uppercase flex items-center justify-between">
            <span>Recent Roles</span>
            <span className="text-xs font-mono-numbers text-[#68716C] font-semibold">{filteredSessions.length}</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#68716C]">
              No previous searches
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const candCount =
                session.messages.find((m) => m.matchedCandidates?.length)
                  ?.matchedCandidates?.length || 0;

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition text-sm ${
                    isActive
                      ? "bg-[#FFFFFF] text-[#1D2521] font-semibold border border-[#D9D7D0] shadow-xs"
                      : "text-[#68716C] hover:bg-[#EAE7DF] hover:text-[#1D2521]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-[#164A3A]" : "text-[#68716C] group-hover:text-[#1D2521]"
                      }`}
                    />
                    <div className="truncate text-sm tracking-tight leading-snug">{session.title}</div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {candCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono-numbers bg-[#164A3A]/10 text-[#164A3A] border border-[#164A3A]/20 font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {candCount}
                      </span>
                    )}

                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#68716C] hover:text-[#C9785C] hover:bg-[#EAE7DF] rounded transition cursor-pointer"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recruiter User Footer Profile */}
        <div className="p-3.5 border-t border-[#D9D7D0] bg-[#F2F0EA]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D9D7D0] shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#164A3A] flex items-center justify-center font-bold text-sm text-white">
                  RC
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#164A3A] border-2 border-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1D2521] truncate tracking-tight">Recruiter Admin</div>
                <div className="text-xs text-[#68716C] truncate">Enterprise • Online</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono-numbers bg-[#C9785C]/15 text-[#C9785C] font-semibold border border-[#C9785C]/30">
              100% Exp
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
