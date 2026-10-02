"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  User,
  Building2,
  Sliders,
  Network,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Server,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { LoadingSkeleton } from "@/components/ui/empty-state";
import { AuditLog, MatchingWeights, NaukriIntegrationStatus } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<
    "profile" | "organization" | "matching" | "integrations" | "security" | "audit"
  >("matching");

  const [weights, setWeights] = useState<MatchingWeights>({
    roleMatch: 45,
    mandatorySkills: 35,
    experience: 20,
    education: 0,
  });

  const [naukriStatus, setNaukriStatus] = useState<NaukriIntegrationStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setWeights(data.data.weights);
        setNaukriStatus(data.data.naukriStatus);
        setAuditLogs(data.data.auditLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const totalWeight =
    (weights.roleMatch || 0) +
    (weights.mandatorySkills || 0) +
    (weights.experience || 0) +
    (weights.education || 0);

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) {
      showToast(`Total weights must equal 100% (Current sum: ${totalWeight}%)`);
      return;
    }
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateWeights", weights }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Deterministic matching weights updated and recalculated across all candidates!");
      }
    } catch (err) {
      showToast("Failed to update weights.");
    }
  };

  const handleTestNaukri = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "testNaukri" }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.data);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: "Failed to communicate with integration service.",
        latencyMs: 0,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleToggleNaukri = async () => {
    if (!naukriStatus) return;
    try {
      const newStatus = !naukriStatus.connected;
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleNaukri", connected: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setNaukriStatus(data.data.naukriStatus);
        showToast(`Naukri integration ${newStatus ? "connected" : "disconnected"}.`);
      }
    } catch (err) {
      showToast("Failed to toggle integration.");
    }
  };

  const navSections = [
    { key: "matching", label: "Matching Rules", icon: Sliders },
    { key: "integrations", label: "Integrations (Naukri)", icon: Network },
    { key: "profile", label: "User Profile", icon: User },
    { key: "organization", label: "Organization", icon: Building2 },
    { key: "security", label: "Security & Compliance", icon: ShieldCheck },
    { key: "audit", label: "Audit Logs", icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure deterministic matching model weights, recruitment connector adapters, and audit access.
        </p>
      </div>

      {/* Settings Layout with Left Nav */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Section Navigation */}
        <div className="md:col-span-3 space-y-1">
          {navSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-9">
          {loading ? (
            <LoadingSkeleton rows={6} />
          ) : (
            <>
              {/* 1. MATCHING RULES SECTION */}
              {activeSection === "matching" && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">Deterministic Matching Rules</CardTitle>
                        <CardDescription>
                          Configure the exact mathematical weights applied by the CandidateMatcher engine.
                        </CardDescription>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          totalWeight === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        Total: {totalWeight}% (Required: 100%)
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-5 text-xs">
                    {/* Weight Sliders */}
                    <div className="space-y-4">
                      {/* 1. Priority 1: Role Match */}
                      <div className="space-y-1.5 p-3.5 rounded-lg bg-blue-50/50 border border-blue-200">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[10px] font-extrabold">
                              PRIORITY 1
                            </span>
                            Role & Designation Alignment:
                          </span>
                          <span className="font-bold text-blue-700 text-sm">{weights.roleMatch}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={weights.roleMatch}
                          onChange={(e) =>
                            setWeights({ ...weights, roleMatch: Number(e.target.value) })
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <p className="text-[11px] text-slate-600">
                          Evaluates target job title & functional designation alignment against candidate current/historical roles.
                        </p>
                      </div>

                      {/* 2. Priority 2: Skills Match */}
                      <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-700 text-white text-[10px] font-extrabold">
                              PRIORITY 2
                            </span>
                            Mandatory Technical Skills:
                          </span>
                          <span className="font-bold text-blue-600 text-sm">{weights.mandatorySkills}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={weights.mandatorySkills}
                          onChange={(e) =>
                            setWeights({ ...weights, mandatorySkills: Number(e.target.value) })
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <p className="text-[11px] text-slate-500">
                          Strict requirement match verified against core competencies and verified resume citations.
                        </p>
                      </div>

                      {/* 3. Experience Match */}
                      <div className="space-y-1.5 p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                        <div className="flex justify-between font-bold text-emerald-950">
                          <span className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[10px] font-extrabold">
                              100% SCALE
                            </span>
                            Experience Tenure Match:
                          </span>
                          <span className="font-bold text-emerald-700 text-sm">{weights.experience}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={weights.experience}
                          onChange={(e) =>
                            setWeights({ ...weights, experience: Number(e.target.value) })
                          }
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <p className="text-[11px] text-emerald-800">
                          Candidates with required experience receive a full 100% experience score with zero overqualification penalties.
                        </p>
                      </div>

                      {/* 4. Education Qualification (0%) */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 opacity-75">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Education Qualification (Disabled / 0% Weight):</span>
                          <span className="font-bold text-slate-500">{weights.education}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={0}
                          step={0}
                          value={0}
                          disabled
                          className="w-full accent-slate-400 cursor-not-allowed"
                        />
                        <p className="text-[11px] text-slate-500">
                          Education weighting is fixed at 0% per hiring preference. Degrees do not alter candidate scoring.
                        </p>
                      </div>

                      {/* 5. Location Removed Notice */}
                      <div className="p-3 rounded-lg bg-slate-100/70 border border-dashed border-slate-300 text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800">Location Scoring Parameter:</span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                            REMOVED FROM CALCULATION
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Location is no longer used in calculating match percentages. Candidates anywhere are evaluated strictly on Role, Skills, and Experience.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setWeights({
                          roleMatch: 45,
                          mandatorySkills: 35,
                          experience: 20,
                          education: 0,
                        })
                      }
                    >
                      Reset Defaults (45 Role / 35 Skills / 20 Exp)
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSaveWeights}
                      disabled={totalWeight !== 100}
                    >
                      Save Matching Weights
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* 2. INTEGRATIONS (NAUKRI RESDEX) SECTION */}
              {activeSection === "integrations" && naukriStatus && (
                <div className="space-y-6">
                  <Card className="border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Network className="h-4 w-4 text-blue-600" />
                            Naukri Resdex Enterprise Integration
                          </CardTitle>
                          <CardDescription>
                            External recruitment candidate discovery gateway adapter
                          </CardDescription>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            naukriStatus.connected
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          {naukriStatus.connected ? "Connected" : "Not Connected"}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-5 text-xs">
                      {/* Security Notice */}
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 leading-relaxed">
                        <p className="font-semibold flex items-center gap-1.5 mb-1">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          Security & Boundary Compliance Architecture:
                        </p>
                        <p className="text-[11px]">
                          Direct credentials and API secrets are strictly managed server-side. The platform never bypasses CAPTCHA, OTP, anti-bot mechanisms, rate limits, or session security. In environments without live enterprise credentials, the platform seamlessly operates in the compliant <b>Sandbox Mock Simulation Mode</b>.
                        </p>
                      </div>

                      {/* Integration Status Table */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">STATUS MESSAGE</span>
                          <span className="font-semibold text-slate-900">{naukriStatus.statusMessage}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">ENVIRONMENT MODE</span>
                          <span className="font-semibold text-blue-700">{naukriStatus.environment}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">LAST SYNC</span>
                          <span className="font-semibold text-slate-900">{formatDateTime(naukriStatus.lastSync)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">DAILY QUOTA / USAGE</span>
                          <span className="font-semibold text-slate-900">
                            {naukriStatus.dailySearchesUsed} / {naukriStatus.dailySearchLimit} Queries Used
                          </span>
                        </div>
                      </div>

                      {/* Connection Test Result */}
                      {testResult && (
                        <div
                          className={`p-3 rounded-lg border text-xs ${
                            testResult.success
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                              : "bg-amber-50 border-amber-200 text-amber-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            {testResult.success ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                            Connection Diagnostic: {testResult.success ? "Healthy" : "Sandbox Fallback Active"}
                          </div>
                          <p className="text-[11px] mt-1">{testResult.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Gateway Latency: {testResult.latencyMs}ms
                          </span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex justify-between pt-4 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleTestNaukri}
                        isLoading={testingConnection}
                        className="gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Run Connection Test
                      </Button>

                      <Button
                        size="sm"
                        variant={naukriStatus.connected ? "outline" : "primary"}
                        onClick={handleToggleNaukri}
                      >
                        {naukriStatus.connected ? "Disconnect Integration" : "Connect Integration"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {/* 3. USER PROFILE SECTION */}
              {activeSection === "profile" && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold">Recruiter Profile</CardTitle>
                    <CardDescription>Personal recruiter credentials and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input defaultValue="Sarah Jenkins" />
                      </div>
                      <div>
                        <Label>Work Email</Label>
                        <Input defaultValue="sarah.jenkins@enterprise-talent.com" />
                      </div>
                      <div>
                        <Label>Role / Title</Label>
                        <Input defaultValue="Lead Technical Recruiter" readOnly className="bg-slate-50" />
                      </div>
                      <div>
                        <Label>Primary Hub</Label>
                        <Input defaultValue="Hyderabad, India" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4 border-t border-slate-100">
                    <Button size="sm" variant="primary" onClick={() => showToast("Profile saved successfully.")}>
                      Update Profile
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* 4. ORGANIZATION SECTION */}
              {activeSection === "organization" && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold">Organization & Enterprise Settings</CardTitle>
                    <CardDescription>Enterprise tenant configurations and recruitment standards</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Organization Name</Label>
                        <Input defaultValue="Enterprise Cloud Global Ltd" />
                      </div>
                      <div>
                        <Label>ATS Webhook URL</Label>
                        <Input defaultValue="https://api.enterprise-talent.com/ats/webhook/v1" />
                      </div>
                      <div>
                        <Label>Default Currency</Label>
                        <Input defaultValue="INR (₹)" />
                      </div>
                      <div>
                        <Label>Data Retention Policy</Label>
                        <Input defaultValue="90 Days Resume Cache" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4 border-t border-slate-100">
                    <Button size="sm" variant="primary" onClick={() => showToast("Organization settings saved.")}>
                      Save Settings
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* 5. SECURITY SECTION */}
              {activeSection === "security" && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold">Security, Secrets & Compliance</CardTitle>
                    <CardDescription>Authentication boundaries and role-based access control</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Lock className="h-4 w-4 text-emerald-600" />
                        Role-Based Access Control (RBAC)
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Users are segmented into <b>Enterprise Recruiter</b> and <b>Enterprise Admin</b> roles. Candidate PII and contact credentials require audited justification before export.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Server Environment Variables Status</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                          <span className="font-mono text-[11px]">NAUKRI_RESDEX_API_KEY</span>
                          <span className="text-slate-500 font-semibold">Server-Side Protected</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                          <span className="font-mono text-[11px]">RESUME_STORAGE_BUCKET</span>
                          <span className="text-emerald-700 font-semibold">Configured</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 6. AUDIT LOGS SECTION */}
              {activeSection === "audit" && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold">Security & Operational Audit Logs</CardTitle>
                    <CardDescription>Immutable record of platform searches, shortlists, and exports</CardDescription>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">User</th>
                          <th className="py-2.5 px-3">Action</th>
                          <th className="py-2.5 px-3">Target</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                              {formatDateTime(log.timestamp)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{log.user}</td>
                            <td className="py-2.5 px-3 text-slate-700">{log.action}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{log.target}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  log.status === "Success"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{log.ipAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
