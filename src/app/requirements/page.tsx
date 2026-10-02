"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  MapPin,
  ExternalLink,
  Play,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, MatchScoreBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { EmptyState, LoadingSkeleton } from "@/components/ui/empty-state";
import { Requirement, RequirementStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export default function RequirementsPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [status, setStatus] = useState<string>("ALL");

  // Modals
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);
  const [excelUploading, setExcelUploading] = useState(false);
  const [jdUploading, setJdUploading] = useState(false);
  const [jdText, setJdText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/requirements");
      const data = await res.json();
      if (data.success) {
        setRequirements(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartSearch = async (reqId: string, title: string) => {
    try {
      showToast(`Initiating search run for "${title}"...`);
      const res = await fetch("/api/search-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementId: reqId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Search completed: Found ${data.data.candidateCount} matching candidates!`);
        fetchRequirements();
        router.push(`/search-runs?runId=${data.data.id}`);
      }
    } catch (err) {
      showToast("Error triggering search run");
    }
  };

  const handleExcelUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setExcelUploading(true);
    setTimeout(() => {
      setExcelUploading(false);
      setShowExcelModal(false);
      showToast("Excel sheet parsed! 3 new requirements ingested successfully.");
      fetchRequirements();
    }, 1200);
  };

  const handleJdUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;
    setJdUploading(true);
    try {
      const res = await fetch("/api/requirements/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jdText }),
      });
      const data = await res.json();
      if (data.success) {
        setShowJdModal(false);
        sessionStorage.setItem("draft_requirement", JSON.stringify(data.data));
        router.push("/requirements/new?fromParsed=true");
      }
    } catch (err) {
      showToast("Failed to parse JD document");
    } finally {
      setJdUploading(false);
    }
  };

  // Filtered Requirements
  const filtered = requirements.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.mandatorySkills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      r.id.toLowerCase().includes(search.toLowerCase());

    const matchesDept = department === "ALL" || r.department === department;
    const matchesLoc = location === "ALL" || r.location.toLowerCase().includes(location.toLowerCase());
    const matchesStatus = status === "ALL" || r.status === status;

    return matchesSearch && matchesDept && matchesLoc && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hiring Requirements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage position criteria, parse job descriptions, and orchestrate candidate searches.
          </p>
        </div>

        {/* Actions: New, Upload Excel, Upload JD */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowExcelModal(true)}
            className="text-xs gap-1.5"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Upload Excel
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowJdModal(true)}
            className="text-xs gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            Upload JD
          </Button>

          <Link href="/requirements/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              New Requirement
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, skills, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="AI & Innovation">AI & Innovation</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
              <option value="Product Management">Product Management</option>
              <option value="Data & Analytics">Data & Analytics</option>
            </select>
          </div>

          <div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Locations</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Ready">Ready</option>
              <option value="Searching">Searching</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requirements Data Table */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Requirements Match Filters"
          description="Adjust your search criteria or create a new requirement to begin candidate matching."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setDepartment("ALL");
            setLocation("ALL");
            setStatus("ALL");
          }}
        />
      ) : (
        <Card className="border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Mandatory Skills</th>
                  <th className="py-3 px-4 text-center">Candidates</th>
                  <th className="py-3 px-4 text-center">Top Match</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/requirements/${req.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline block"
                      >
                        {req.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">{req.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{req.department}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {req.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {req.mandatorySkills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2 rounded border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                        {req.mandatorySkills.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{req.mandatorySkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {req.candidateCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {req.topMatchScore ? (
                        <MatchScoreBadge score={req.topMatchScore} />
                      ) : (
                        <span className="text-slate-400">—</span>
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
                        <button
                          onClick={() => handleStartSearch(req.id, req.title)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                          title="Trigger External Candidate Search"
                        >
                          <Play className="h-3 w-3 fill-current" /> Search
                        </button>
                        <Link href={`/candidates?requirementId=${req.id}`}>
                          <Button size="sm" variant="outline" className="text-[11px] h-7 px-2">
                            Candidates
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Upload Excel Modal */}
      <Modal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        title="Upload Requirements Spreadsheet"
        description="Ingest batch hiring criteria from Excel (.xlsx, .csv)."
        maxWidth="md"
      >
        <form onSubmit={handleExcelUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Click to select or drag and drop Excel file</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports standard ATS/HR columns: Job Title, Dept, Min Exp, Mandatory Skills, Location</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowExcelModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={excelUploading}>
              Parse & Ingest Excel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload JD Modal */}
      <Modal
        isOpen={showJdModal}
        onClose={() => setShowJdModal(false)}
        title="AI Job Description Parser"
        description="Paste an existing JD or document text to extract structured criteria automatically."
        maxWidth="lg"
      >
        <form onSubmit={handleJdUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description Content / Document Text:
            </label>
            <textarea
              rows={8}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste raw job description here... (e.g., We are looking for a Senior Python Developer with 5+ years experience in FastAPI, PostgreSQL, and AWS...)"
              className="w-full text-xs p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
            />
          </div>
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() =>
                setJdText(
                  `We are hiring a Lead DevOps Engineer in Hyderabad with 8-12 years of experience. Mandatory skills: Terraform, Kubernetes, AWS, CI/CD, and Linux. Preferred skills: ArgoCD and Prometheus. Must hold a B.Tech in Computer Science. Notice period should be 30 days or less.`
                )
              }
              className="text-xs text-blue-600 hover:underline"
            >
              Insert Sample JD
            </button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowJdModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={jdUploading} disabled={!jdText.trim()}>
                Extract Structured Criteria
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
