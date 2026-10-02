"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  Briefcase,
  Layers,
  GraduationCap,
  Clock,
  MapPin,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/empty-state";

export default function NewRequirementPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={8} />}>
      <NewRequirementContent />
    </Suspense>
  );
}

function NewRequirementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form State
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Hyderabad");
  const [description, setDescription] = useState("");
  const [minExp, setMinExp] = useState(4);
  const [maxExp, setMaxExp] = useState(8);
  const [mandatorySkillsInput, setMandatorySkillsInput] = useState("Python, FastAPI, PostgreSQL, AWS");
  const [preferredSkillsInput, setPreferredSkillsInput] = useState("Docker, Kubernetes, Redis");
  const [education, setEducation] = useState("B.Tech / B.E. in Computer Science or equivalent");
  const [domain, setDomain] = useState("Enterprise SaaS");
  const [noticePeriod, setNoticePeriod] = useState("30 Days or less");

  // Analysis & Submissions
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzedSummary, setAnalyzedSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if loaded from JD Parser modal
  useEffect(() => {
    if (searchParams.get("fromParsed") === "true") {
      const draft = sessionStorage.getItem("draft_requirement");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setTitle(parsed.title || "");
          setDepartment(parsed.department || "Engineering");
          setLocation(parsed.location || "Hyderabad");
          setMinExp(parsed.minExperience || 4);
          setMaxExp(parsed.maxExperience || 8);
          setMandatorySkillsInput(parsed.mandatorySkills?.join(", ") || "");
          setPreferredSkillsInput(parsed.preferredSkills?.join(", ") || "");
          setEducation(parsed.education || "");
          setDomain(parsed.domain || "");
          setNoticePeriod(parsed.noticePeriod || "30 Days or less");
          setAnalyzedSummary(parsed);
          sessionStorage.removeItem("draft_requirement");
        } catch (e) {}
      }
    }
  }, [searchParams]);

  const loadSample = () => {
    setTitle("Senior Cloud Platform Engineer");
    setDepartment("Cloud Infrastructure");
    setLocation("Hyderabad / Remote");
    setDescription(
      "Looking for a Senior Cloud Platform Engineer to architect distributed microservices on AWS using Terraform and Docker. You will manage high-availability PostgreSQL and Redis data stores and automate CI/CD release pipelines."
    );
    setMinExp(5);
    setMaxExp(9);
    setMandatorySkillsInput("AWS, Terraform, Docker, Python, PostgreSQL");
    setPreferredSkillsInput("Kubernetes, Redis, Prometheus");
    setEducation("B.Tech / B.E. in Computer Science or relevant engineering field");
    setDomain("Enterprise SaaS");
    setNoticePeriod("30 Days or less");
  };

  const handleAnalyze = async () => {
    if (!title.trim() && !description.trim()) {
      setErrorMsg("Please provide at least a Job Title or Job Description to analyze.");
      return;
    }
    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const fullText = `${title}\n${description}\nMandatory: ${mandatorySkillsInput}\nLocation: ${location}`;
      const res = await fetch("/api/requirements/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          title,
          department,
          location,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalyzedSummary(data.data);
      }
    } catch (err) {
      setErrorMsg("Failed to analyze requirement.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndSearch = async (startSearchImmediately = false) => {
    if (!title.trim()) {
      setErrorMsg("Job Title is required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const mandatorySkills = mandatorySkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const preferredSkills = preferredSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department,
          location,
          description,
          minExperience: Number(minExp),
          maxExperience: Number(maxExp),
          mandatorySkills,
          preferredSkills,
          education,
          domain,
          noticePeriod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const createdReq = data.data;

        if (startSearchImmediately) {
          // Trigger search pipeline immediately
          await fetch("/api/search-runs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requirementId: createdReq.id }),
          });
          router.push(`/search-runs?runId=SR-801`);
        } else {
          router.push(`/requirements/${createdReq.id}`);
        }
      } else {
        setErrorMsg(data.error || "Failed to save requirement.");
      }
    } catch (err) {
      setErrorMsg("Network error saving requirement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/requirements"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Link>

        <button
          type="button"
          onClick={loadSample}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200"
        >
          Autofill Sample Requirement
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Hiring Requirement</h1>
        <p className="text-xs text-slate-500 mt-1">
          Define position criteria, experience ranges, and core competencies for deterministic candidate matching.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* 8-Section Structured Form */}
      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
              Position & Department Information
            </CardTitle>
            <CardDescription>Primary role identification and departmental allocation</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Label required>Job Title</Label>
              <Input
                placeholder="e.g. Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label required>Department</Label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs focus:ring-1 focus:ring-blue-600"
              >
                <option value="Engineering">Engineering</option>
                <option value="AI & Innovation">AI & Innovation</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="Product Management">Product Management</option>
                <option value="Data & Analytics">Data & Analytics</option>
              </select>
            </div>
            <div>
              <Label required>Location</Label>
              <Input
                placeholder="e.g. Hyderabad / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Job Description */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
              Job Description
            </CardTitle>
            <CardDescription>Comprehensive overview of responsibilities, day-to-day work, and objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              placeholder="Describe key responsibilities, deliverables, and team context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Section 3: Experience */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
              Experience Range
            </CardTitle>
            <CardDescription>Target industry tenure in years (used in 20% experience scoring)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Minimum Experience (Years)</Label>
              <Input
                type="number"
                min={0}
                max={30}
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
              />
            </div>
            <div>
              <Label required>Maximum Experience (Years)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={maxExp}
                onChange={(e) => setMaxExp(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4 & 5: Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">4</span>
                Mandatory Skills (40% Weight)
              </CardTitle>
              <CardDescription>Comma-separated non-negotiable core competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. Python, FastAPI, React, PostgreSQL, AWS"
                value={mandatorySkillsInput}
                onChange={(e) => setMandatorySkillsInput(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Evaluated deterministically against verified candidate resume text.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">5</span>
                Preferred Skills (10% Weight)
              </CardTitle>
              <CardDescription>Bonus capabilities and adjacent proficiencies</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. Kubernetes, Redis, Docker, TypeScript"
                value={preferredSkillsInput}
                onChange={(e) => setPreferredSkillsInput(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Grants additional bonus scoring without disqualifying candidates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section 6, 7 & 8: Education, Domain, Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">6</span>
                Education (10%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech / M.Tech in CS"
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">7</span>
                Domain / Industry (10%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Enterprise SaaS / Fintech"
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">8</span>
                Notice Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Immediate to 15 Days">Immediate to 15 Days</option>
                <option value="30 Days or less">30 Days or less</option>
                <option value="30 to 60 Days">30 to 60 Days</option>
                <option value="60 to 90 Days">60 to 90 Days</option>
              </select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Button: "Analyze Requirement" */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          className="w-full sm:w-auto text-xs gap-1.5 border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100"
        >
          <Sparkles className="h-4 w-4 text-blue-600" />
          Analyze Requirement with AI
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSaveAndSearch(false)}
            isLoading={isSaving}
            className="w-full sm:w-auto text-xs"
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSaveAndSearch(true)}
            isLoading={isSaving}
            className="w-full sm:w-auto text-xs gap-1.5 shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Save & Start Candidate Search
          </Button>
        </div>
      </div>

      {/* AI-Generated Structured Requirement Summary Card */}
      {analyzedSummary && (
        <Card className="border-blue-200 bg-blue-50/30 animate-fade-in">
          <CardHeader className="pb-3 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-blue-950 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                AI-Generated Structured Requirement Summary
              </CardTitle>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Confidence: {Math.round((analyzedSummary.confidenceScore || 0.95) * 100)}%
              </span>
            </div>
            <CardDescription className="text-blue-900/80">
              Verified criteria breakdown ready for search connector and deterministic scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-blue-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">JOB TITLE</span>
                <span className="font-bold text-slate-900">{analyzedSummary.title || title}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">DEPARTMENT</span>
                <span className="font-semibold text-slate-800">{analyzedSummary.department || department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">EXPERIENCE</span>
                <span className="font-semibold text-slate-800">{minExp} - {maxExp} Years</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">LOCATION</span>
                <span className="font-semibold text-slate-800">{location}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Mandatory Extracted Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(analyzedSummary.mandatorySkills || mandatorySkillsInput.split(",")).map((s: string) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded text-[11px] border border-blue-200"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSaveAndSearch(true)}
                isLoading={isSaving}
                className="gap-1.5 text-xs shadow-xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Proceed with this Criteria & Start Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
