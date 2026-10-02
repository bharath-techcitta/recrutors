"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";

export function TopHeader({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [globalSearch, setGlobalSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate breadcrumb items
  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    { label: "TalentMatch", href: "/dashboard" },
    ...pathParts.map((part, idx) => {
      const href = "/" + pathParts.slice(0, idx + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
      return { label, href };
    }),
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    router.push(`/candidates?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  const notifications = [
    {
      id: "1",
      title: "Search Run Completed",
      desc: "SR-801 found 18 candidates for Senior Full Stack Engineer (Top match: 92%).",
      type: "success",
      time: "10 mins ago",
    },
    {
      id: "2",
      title: "Naukri Resdex Adapter Ready",
      desc: "Connector validated sandbox boundary & enterprise rate limit rules.",
      type: "info",
      time: "42 mins ago",
    },
    {
      id: "3",
      title: "Candidate Shortlisted",
      desc: "Arjun Rao was added to candidate shortlist.",
      type: "success",
      time: "2 hours ago",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 lg:px-8 backdrop-blur-xs">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 lg:hidden hover:bg-slate-50"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden sm:flex items-center text-xs font-medium text-slate-500">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-slate-400" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-slate-900">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-slate-800 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center/Right: Global Search, Quick Action, Notifications, User */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <form onSubmit={handleGlobalSearch} className="relative hidden md:block w-64 lg:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates, skills, roles..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
          </form>

          {/* New Requirement CTA */}
          <Link href="/requirements/new">
            <Button size="sm" variant="primary" className="gap-1.5 text-xs font-semibold shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Requirement</span>
            </Button>
          </Link>

          {/* Notifications button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* User badge */}
          <div className="flex items-center gap-2 pl-1">
            <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
              SJ
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Activity Notifications"
        description="Real-time system events, search runs, and candidate updates."
        maxWidth="md"
      >
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex gap-3">
              <div className="shrink-0 mt-0.5">
                {n.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {n.type === "info" && <Info className="h-4 w-4 text-blue-600" />}
                {n.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <Link
              href="/search-runs"
              onClick={() => setShowNotifications(false)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View Search Runs <ExternalLink className="h-3 w-3" />
            </Link>
            <Button size="sm" variant="outline" onClick={() => setShowNotifications(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
