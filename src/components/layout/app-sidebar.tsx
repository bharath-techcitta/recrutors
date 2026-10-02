"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  SearchCode,
  FileBarChart2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Requirements", href: "/requirements", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Search Runs", href: "/search-runs", icon: SearchCode },
  { name: "Reports", href: "/reports", icon: FileBarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                  TalentMatch AI
                  <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-200">
                    Enterprise
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Recruitment Platform</span>
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {!collapsed ? "Platform Navigation" : "•"}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
              (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* System & User Profile Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={() => setShowHelpModal(true)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors",
              collapsed && "justify-center"
            )}
            title="System Documentation & Help"
          >
            <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
            {!collapsed && <span>Documentation & Help</span>}
          </button>

          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-md bg-slate-50 border border-slate-200/60 mt-2",
              collapsed && "justify-center p-1.5"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs">
              SJ
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Lead Tech Recruiter
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => setShowSignOutModal(true)}
                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-white transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Help Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="TalentMatch AI Platform Help & Architecture"
        description="Enterprise recruitment criteria matching and external connector pipeline."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
            <h4 className="font-semibold text-sm mb-1">Architecture & Data Flow</h4>
            <p>
              Hiring requirements are parsed into structured criteria, submitted to the isolated external search connector (Naukri Resdex / Mock DB), resumes are processed, and transparent deterministic matching (40% Skills, 20% Exp, 10% Edu, 10% Loc, 10% Preferred, 10% Domain) scores each candidate.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-slate-900 mb-1">Key Features:</h5>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Explainable Scoring:</strong> Full breakdown with resume evidence quotes.</li>
              <li><strong>Naukri Isolation:</strong> Strict compliance boundary protecting anti-bot and credential security.</li>
              <li><strong>Interactive Pipeline:</strong> Real-time tracking from query to candidate ranking.</li>
              <li><strong>Custom Weights:</strong> Tune matching parameters dynamically in Settings.</li>
            </ul>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setShowHelpModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Sign Out Modal */}
      <Modal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign Out Session"
        description="End active recruiter session in TalentMatch AI."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>Are you sure you want to log out of your session? Your search runs and shortlist data are saved securely.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowSignOutModal(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => setShowSignOutModal(false)}>Sign Out</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
