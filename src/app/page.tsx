"use client";

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import {
  Sparkles,
  Send,
  Paperclip,
  PanelLeft,
  Download,
  FileText,
  X,
  Briefcase,
  ChevronDown,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Sidebar } from "@/components/chatgpt/Sidebar";
import { CandidateCard } from "@/components/chatgpt/CandidateCard";
import { CandidateModal } from "@/components/chatgpt/CandidateModal";
import { downloadAllCandidates } from "@/components/chatgpt/download-utils";
import { getInitialChatSessions, processRequirementQuery } from "@/components/chatgpt/chat-engine";
import { ChatMessageData, ChatSession, MatchedCandidateData } from "@/components/chatgpt/types";

const SUGGESTED_PROMPTS = [
  {
    title: "Senior Full Stack Engineer",
    desc: "5+ yrs experience, FastAPI, React, PostgreSQL, Docker, AWS",
    prompt:
      "We are hiring a Senior Full Stack Engineer with 5+ years of experience. Must have strong hands-on expertise in Python, FastAPI, React, PostgreSQL, and AWS. Prior experience building resilient REST APIs and scalable enterprise web apps required.",
  },
  {
    title: "Lead AI / ML Engineer",
    desc: "7+ yrs experience, PyTorch, LLMs, Vector Databases, Python",
    prompt:
      "Looking for a Lead AI/ML Engineer with 7+ years of experience. Required skills: Python, PyTorch, Large Language Models (LLMs), Vector Databases, and Docker. Experience fine-tuning open source models and deploying high-throughput inference services.",
  },
  {
    title: "Principal DevOps & Cloud Architect",
    desc: "8+ yrs experience, Terraform, Kubernetes, AWS, CI/CD, Linux",
    prompt:
      "Seeking a Principal DevOps Architect with 8+ years experience. Mandatory skills: Terraform, Kubernetes (EKS), AWS Cloud, CI/CD pipelines, and Linux. Responsible for multi-region cloud infrastructure and automated zero-downtime releases.",
  },
  {
    title: "Senior Product Manager - Fintech",
    desc: "6+ yrs experience, Product Strategy, Agile, Payment Gateways",
    prompt:
      "Hiring a Senior Product Manager with 6+ years experience in Fintech and Payment Gateway domains. Strong background in requirement scoping, agile sprint planning, API integrations, and customer discovery.",
  },
];

export default function ChatGPTRecruiterPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchedCandidateData | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize sessions from localStorage or default mock data
  useEffect(() => {
    try {
      const stored = localStorage.getItem("talentgpt_sessions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const initial = getInitialChatSessions();
    setSessions(initial);
    if (initial.length > 0) {
      setActiveSessionId(initial[0].id);
    }
  }, []);

  // Save sessions to localStorage on update
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem("talentgpt_sessions", JSON.stringify(sessions));
      } catch {
        // Ignore quota limits
      }
    }
  }, [sessions]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setInput("");
    setAttachedFile(null);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput("");
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({ name: file.name, content });
      if (!input.trim()) {
        setInput(`JD from attached file: ${file.name}\n\n${content.slice(0, 500)}...`);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const queryText = input.trim() || (attachedFile ? attachedFile.content : "");
    if (!queryText) return;

    setIsThinking(true);
    setInput("");
    const fileInfo = attachedFile;
    setAttachedFile(null);

    const userMessage: ChatMessageData = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: queryText,
      fileName: fileInfo?.name,
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      const { requirement, matchedCandidates } = processRequirementQuery(
        queryText,
        fileInfo?.name
      );

      const assistantMessage: ChatMessageData = {
        id: `msg-asst-${Date.now()}`,
        role: "assistant",
        content: `I've analyzed the Job Description for **${requirement.title}** and performed deterministic candidate ranking:
- **Role Match (Priority 1)**: Evaluated titles against "${requirement.title}" (45% weight).
- **Core Skills (Priority 2)**: Evaluated against mandatory skills [${requirement.mandatorySkills.slice(0, 5).join(", ")}] (35% weight).
- **100% Experience Criteria**: Full 20% credit awarded to candidates with ${requirement.minExperience}+ years experience.
- **Education Weight**: Set to 0% (excluded).
- **Location**: Excluded from scoring.

Matched **${matchedCandidates.length} candidate profiles** from the recruitment database:`,
        timestamp: new Date().toISOString(),
        matchedCandidates,
        requirement,
        searchSummary: {
          roleTitle: requirement.title,
          expCriteria: `${requirement.minExperience}+ years`,
          topScore: matchedCandidates[0]?.match.overallScore || 0,
          totalMatched: matchedCandidates.length,
        },
      };

      if (activeSessionId) {
        // Append to existing active session
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, userMessage, assistantMessage],
              };
            }
            return s;
          })
        );
      } else {
        // Create new session named by requirement title
        const newSession: ChatSession = {
          id: requirement.id,
          title: requirement.title,
          createdAt: new Date().toISOString(),
          requirement,
          messages: [userMessage, assistantMessage],
        };

        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      }

      setIsThinking(false);
    }, 550);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (promptText: string) => {
    setInput(promptText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const toggleCandidateShortlist = (candId: string) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: session.messages.map((msg) => {
              if (msg.matchedCandidates) {
                return {
                  ...msg,
                  matchedCandidates: msg.matchedCandidates.map((c) => {
                    if (c.candidate.id === candId) {
                      return { ...c, shortlisted: !c.shortlisted };
                    }
                    return c;
                  }),
                };
              }
              return msg;
            }),
          };
        }
        return session;
      })
    );

    if (selectedCandidate && selectedCandidate.candidate.id === candId) {
      setSelectedCandidate({
        ...selectedCandidate,
        shortlisted: !selectedCandidate.shortlisted,
      });
    }
  };

  // Get active candidates if available
  const currentCandidates = activeSession
    ? activeSession.messages.find((m) => m.matchedCandidates?.length)?.matchedCandidates || []
    : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F6F2] text-[#1D2521]">
      {/* Sidebar with Recent Chats */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#F7F6F2] relative v0-ambient-glow">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#D9D7D0] px-5 flex items-center justify-between bg-[#F7F6F2]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3.5">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-[#68716C] hover:text-[#1D2521] hover:bg-[#EAE7DF] rounded-xl transition cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            {/* Model / Agent Selector Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D9D7D0] hover:bg-[#F2F0EA] transition cursor-pointer group shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#1D2521] tracking-tight">TalentGPT</span>
                <span className="text-xs font-mono-numbers text-[#164A3A] font-semibold px-2.5 py-0.5 rounded-full bg-[#164A3A]/10 border border-[#164A3A]/20">
                  100% Exp Match
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#68716C] group-hover:text-[#1D2521] transition" />
            </div>
          </div>

          {/* Top Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {currentCandidates.length > 0 && (
              <button
                onClick={() =>
                  downloadAllCandidates(
                    currentCandidates,
                    activeSession?.title || "Recruitment_Profiles"
                  )
                }
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-bold bg-[#164A3A] hover:bg-[#0F382C] text-white rounded-xl transition shadow-xs cursor-pointer"
                title="Export all profiles for this role"
              >
                <Download className="w-4 h-4" />
                <span>Export All ({currentCandidates.length})</span>
              </button>
            )}

            <button
              onClick={handleNewChat}
              className="px-3.5 py-2 text-sm font-semibold text-[#1D2521] hover:text-[#1D2521] bg-[#FFFFFF] hover:bg-[#EAE7DF] border border-[#D9D7D0] rounded-xl transition shadow-2xs cursor-pointer"
            >
              + New Search
            </button>
          </div>
        </header>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-7 space-y-7">
          {!activeSession || activeSession.messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="max-w-3xl mx-auto pt-8 md:pt-14 pb-8 flex flex-col items-center text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-[#164A3A] flex items-center justify-center text-white shadow-md mb-4.5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-[#1D2521] tracking-tight mb-3">
                What role are you hiring for today?
              </h1>
              <p className="text-sm md:text-base text-[#68716C] max-w-xl mb-8 leading-relaxed tracking-tight">
                Paste any Job Description (JD) or enter role criteria.
                Evaluated deterministically with{" "}
                <span className="text-[#164A3A] font-mono-numbers font-semibold">100% Experience credit</span>,{" "}
                <span className="text-[#1D2521] font-semibold">Role Priority</span>, and{" "}
                <span className="text-[#C9785C] font-semibold">Technical Skills</span>.
              </p>

              {/* Prompt Suggestion Cards */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(item.prompt)}
                    className="p-4.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#FFFFFF] border border-[#D9D7D0] hover:border-[#164A3A]/50 transition text-left group shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Briefcase className="w-4 h-4 text-[#164A3A] transition" />
                      <span className="text-base font-bold text-[#1D2521] group-hover:text-[#164A3A] transition tracking-tight">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#68716C] line-clamp-2 leading-relaxed tracking-tight">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <div className="max-w-4xl mx-auto space-y-7">
              {activeSession.messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-[#164A3A] flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-1">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-3xl ${isUser ? "w-auto" : "flex-1"}`}>
                      {/* Message Content Bubble */}
                      <div
                        className={`rounded-2xl p-5 text-sm md:text-base leading-relaxed tracking-tight ${
                          isUser
                            ? "bg-[#164A3A] text-white shadow-xs ml-auto"
                            : "bg-[#FFFFFF] text-[#1D2521] border border-[#D9D7D0] shadow-xs"
                        }`}
                      >
                        {/* If user attached a file */}
                        {isUser && message.fileName && (
                          <div className="flex items-center gap-2.5 mb-2.5 p-2.5 rounded-xl bg-white/15 text-sm text-white border border-white/20 font-mono-numbers">
                            <FileText className="w-4 h-4" />
                            <span>Attached: {message.fileName}</span>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap">{message.content}</div>

                        {/* Search summary badges if assistant */}
                        {!isUser && message.searchSummary && (
                          <div className="mt-3.5 pt-3.5 border-t border-[#D9D7D0] flex flex-wrap items-center gap-2.5 text-xs md:text-sm font-mono-numbers">
                            <span className="px-2.5 py-1 rounded-lg bg-[#164A3A]/10 text-[#164A3A] font-semibold border border-[#164A3A]/20">
                              Role: {message.searchSummary.roleTitle}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-[#F7F6F2] text-[#68716C] border border-[#D9D7D0]">
                              Criteria: {message.searchSummary.expCriteria}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-[#F7F6F2] text-[#68716C] border border-[#D9D7D0]">
                              Top: {message.searchSummary.topScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Matched Candidate Profile Cards */}
                      {!isUser && message.matchedCandidates && message.matchedCandidates.length > 0 && (
                        <div className="mt-5 space-y-3.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#68716C] font-mono-numbers">
                              Matched Profiles ({message.matchedCandidates.length})
                            </span>
                            <button
                              onClick={() =>
                                downloadAllCandidates(
                                  message.matchedCandidates || [],
                                  message.requirement?.title || "Role"
                                )
                              }
                              className="text-sm text-[#164A3A] hover:text-[#0F382C] flex items-center gap-1.5 font-bold tracking-tight cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Export All Profiles
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {message.matchedCandidates.map((candData) => (
                              <CandidateCard
                                key={candData.candidate.id}
                                item={candData}
                                roleTitle={message.requirement?.title || activeSession.title}
                                onViewDetails={(item) => setSelectedCandidate(item)}
                                onToggleShortlist={toggleCandidateShortlist}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-[#0F382C] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1 shadow-xs font-mono-numbers">
                        U
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Thinking / AI Agent Execution Indicator */}
              {isThinking && (
                <div className="flex gap-4 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-[#164A3A] flex items-center justify-center text-white flex-shrink-0 shadow-xs animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D9D7D0] rounded-2xl p-4 text-sm text-[#68716C] flex items-center gap-3 font-mono-numbers shadow-xs">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#164A3A] animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-[#164A3A] animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-[#164A3A] animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>Parsing criteria • Scoring 100% experience • Ranking profiles...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Dock: Floating Prompt Input Bar */}
        <div className="p-5 bg-gradient-to-t from-[#F7F6F2] via-[#F7F6F2] to-transparent sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto">
            {/* Attached file chip */}
            {attachedFile && (
              <div className="mb-2.5 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D9D7D0] text-sm text-[#1D2521] max-w-sm shadow-xs">
                <FileText className="w-4 h-4 text-[#164A3A] flex-shrink-0" />
                <span className="truncate flex-1 font-semibold font-mono-numbers">{attachedFile.name}</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-[#68716C] hover:text-[#1D2521] rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Box Bar */}
            <form
              onSubmit={handleSubmit}
              className="relative rounded-2xl bg-[#FFFFFF] border border-[#D9D7D0] focus-within:border-[#164A3A] shadow-[0_10px_30px_-8px_rgba(29,37,33,0.12)] flex flex-col p-3 transition"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Paste Job Description (JD) or type requirements (e.g. Senior Python Engineer with 5+ yrs)..."
                className="w-full bg-transparent text-sm md:text-base text-[#1D2521] placeholder-[#68716C] resize-none px-3.5 py-2 focus:outline-none min-h-[44px] max-h-[200px] tracking-tight leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1.5 px-1">
                {/* File Attachment & Priority indicator */}
                <div className="flex items-center gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.docx,.json,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[#68716C] hover:text-[#1D2521] hover:bg-[#F7F6F2] rounded-xl transition cursor-pointer"
                    title="Attach JD document (.txt, .pdf, .docx, .json)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono-numbers text-[#68716C] hidden sm:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#164A3A]" />
                    Role (45%) • Skills (35%) • <span className="text-[#C9785C] font-semibold">100% Exp (20%)</span>
                  </span>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() && !attachedFile}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs ${
                    input.trim() || attachedFile
                      ? "bg-[#164A3A] hover:bg-[#0F382C] text-white cursor-pointer"
                      : "bg-[#EAE7DF] text-[#68716C]/60 cursor-not-allowed"
                  }`}
                  title="Send JD"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="text-center mt-2.5">
              <span className="text-xs font-mono-numbers text-[#68716C]">
                TalentGPT v0.4 • High-precision deterministic candidate matching engine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Dossier Popup Modal */}
      <CandidateModal
        item={selectedCandidate}
        roleTitle={activeSession?.title || "Role"}
        onClose={() => setSelectedCandidate(null)}
        onToggleShortlist={toggleCandidateShortlist}
      />
    </div>
  );
}
