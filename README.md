Build a complete production-style internal web application called **AI Recruitment Matching Platform** for enterprise recruiters.

The application helps recruiters convert hiring requirements into structured criteria, search an authorized external recruitment source such as Naukri Resdex, retrieve candidate profiles/resumes through an approved integration, process resumes, compare candidates against the hiring requirement, calculate a transparent match percentage, and present the top candidates for recruiter review.

IMPORTANT:

* Build the application as a complete working project in one generation, not as a partial mockup.
* Do not create unnecessary features.
* Do not change the product scope.
* Keep the architecture modular so the external recruitment connector can be replaced later.
* Never bypass CAPTCHA, OTP, anti-bot systems, rate limits, IP restrictions, session security, or other security controls.
* Treat Naukri automation as an integration boundary. Create a clean connector/service interface and a realistic mock implementation so the application works immediately even without live Naukri credentials or API access.
* Do not expose external service credentials in the browser.
* Use mock/sample data where live services are unavailable.
* All pages, buttons, tables, filters, drawers, dialogs, tabs, navigation, pagination, loading states, empty states, errors, and forms must work.

TECH STACK:

* Next.js with App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide icons
* React Hook Form
* Zod validation
* Recharts for analytics
* Server-side API/service layer
* PostgreSQL-ready data model
* Clean reusable components
* Strong TypeScript typing
* No giant monolithic components
* No duplicated UI code

PROJECT STRUCTURE:

src/
app/
dashboard/
requirements/
requirements/[id]/
candidates/
candidates/[id]/
search-runs/
reports/
settings/
api/
components/
layout/
dashboard/
requirements/
candidates/
search/
reports/
settings/
ui/
lib/
ai/
matching/
integrations/
resume/
validation/
utils/
types/
data/
services/

Create reusable services/interfaces for:

* RequirementParser
* CandidateSearchConnector
* ResumeRetriever
* ResumeParser
* CandidateMatcher
* ReportGenerator

DATA FLOW:

1. Recruiter creates a hiring requirement by:

   * entering a job description manually
   * pasting a job description
   * uploading an Excel file
   * uploading a JD document

2. Requirement parsing converts the requirement into structured data:

   * job title
   * department
   * location
   * minimum experience
   * maximum experience
   * mandatory skills
   * preferred skills
   * education
   * domain/industry
   * notice period
   * other requirements

3. Generate structured recruiter search criteria.

4. Send those criteria to CandidateSearchConnector.

5. CandidateSearchConnector must have:

   * interface definition
   * mock implementation
   * clearly separated external/Naukri implementation placeholder

6. Return candidate search results.

7. For candidates selected for detailed evaluation:

   * retrieve the resume using ResumeRetriever
   * process the PDF
   * extract text
   * structure the candidate profile
   * store processing status

8. CandidateMatcher evaluates the candidate against the job requirement.

9. Matching must be deterministic and explainable.

DEFAULT MATCHING MODEL:

* mandatory skills: 40%
* experience: 20%
* education: 10%
* location: 10%
* preferred skills: 10%
* domain experience: 10%

Make weights configurable.

Never generate a fake score only from an LLM.
Use structured matching rules first and optional semantic similarity/reranking as a separate signal.

Each candidate result must contain:

* overall match percentage
* matched requirements
* missing requirements
* partial matches
* evidence from resume
* score breakdown
* processing status

Example:

Candidate:
Arjun Rao

Match:
92%

Matched:
Python
FastAPI
AWS
PostgreSQL
6+ years experience
Hyderabad

Partial:
Kubernetes

Missing:
Pharma domain experience

Score Breakdown:
Skills: 100%
Experience: 95%
Education: 100%
Location: 100%
Preferred Skills: 75%
Domain: 80%

DASHBOARD UI:

Use a modern enterprise SaaS dashboard layout.

Desktop:

* fixed left sidebar
* top header
* responsive content area
* generous spacing
* max-width content container
* clean table/card layouts

Mobile:

* collapsible sidebar
* mobile navigation
* horizontally scrollable data tables where necessary
* cards stack vertically
* no broken layouts

SIDEBAR:

Logo:
"TalentMatch AI"

Navigation:

* Dashboard
* Requirements
* Candidates
* Search Runs
* Reports
* Settings

Bottom:

* Help
* User profile
* Sign out

HEADER:

* Breadcrumbs
* Global search
* Notifications
* User avatar/menu

DASHBOARD PAGE:

Heading:
"Recruitment Overview"

Subheading:
"AI-assisted candidate discovery and requirement matching."

KPI cards:

* Active Requirements
* Candidates Found
* Resumes Processed
* Top Matches

Each KPI should show:

* primary number
* small trend/change indicator
* supporting label
* subtle icon

Sections:

1. Recent Hiring Requirements table
2. AI Matching Activity chart
3. Top Candidates list
4. Recent Search Runs

REQUIREMENTS PAGE:

Header:
"Hiring Requirements"

Actions:

* New Requirement
* Upload Excel
* Upload JD

Search and filters:

* search
* department
* location
* status
* created date

Table columns:

* Requirement
* Department
* Location
* Candidates
* Top Match
* Status
* Created
* Actions

Statuses:
Draft
Ready
Searching
Processing
Completed
Failed

NEW REQUIREMENT PAGE:

Create a simple multi-section form:

Section 1:
Job Title
Department
Location

Section 2:
Job Description

Section 3:
Experience
Minimum
Maximum

Section 4:
Mandatory Skills

Section 5:
Preferred Skills

Section 6:
Education

Section 7:
Domain / Industry

Section 8:
Notice Period

Button:
"Analyze Requirement"

After analysis, show an AI-generated structured requirement summary before starting candidate search.

REQUIREMENT DETAIL PAGE:

Show:

* job summary
* structured requirements
* mandatory skills
* preferred skills
* experience
* education
* location
* domain
* search criteria

Actions:

* Edit Requirement
* Start Candidate Search
* View Candidates
* Export Report

CANDIDATES PAGE:

Heading:
"Candidates"

Use a professional searchable/filterable data table.

Filters:

* search
* minimum match %
* experience
* location
* skill
* status

Columns:

* Candidate
* Current Role
* Experience
* Location
* Key Skills
* Match %
* Status
* Actions

Match badge behavior:

* high match: positive semantic styling
* medium match: warning semantic styling
* low match: neutral/error semantic styling

Do not use excessive colors.

Candidate row actions:

* View Profile
* View Resume
* View Match Analysis
* Download Resume
* Add to Shortlist

CANDIDATE DETAIL PAGE:

Header:
candidate name
designation
location
experience
match percentage

Use tabs:

Overview
Resume
Experience
Skills
Education
Match Analysis
Activity

Match Analysis should contain:

* overall score
* score breakdown
* matched requirements
* partial requirements
* missing requirements
* evidence

Use progress bars and compact cards.

RESUME TAB:

* resume file name
* file type
* processing status
* parsed text preview
* download button
* source information

SEARCH RUNS PAGE:

Show all search operations.

Columns:

* Run ID
* Requirement
* Start Time
* Candidates Found
* Resumes Processed
* Top Match
* Status

Clicking a run opens a detail drawer/page showing the entire pipeline:

Requirement
→ Search Criteria
→ Search Results
→ Resume Retrieval
→ Resume Processing
→ Matching
→ Ranking
→ Top Candidates

Use statuses:
Queued
Running
Completed
Failed

REPORTS PAGE:

Create a recruitment report interface.

Include:

* requirement summary
* number of candidates found
* number processed
* number shortlisted
* average match
* top 10 candidates
* score breakdown chart
* skills coverage chart
* missing skill analysis

Buttons:

* Export CSV
* Export PDF

SETTINGS PAGE:

Sections:
Profile
Organization
Matching Rules
Integrations
Security
Audit Logs

Integration screen must show:

Naukri Resdex
Status: Not Connected / Connected

Use an integration adapter, not direct browser-side credentials.

Also show:

* connection test
* integration status
* last sync
* permission/status message

Do not claim that live Naukri integration works unless actual credentials/API are configured.

DESIGN SYSTEM:

Use shadcn/ui components throughout.

Palette:

* background: #F8FAFC
* card: #FFFFFF
* primary: #2563EB
* primary hover: #1D4ED8
* text: #0F172A
* secondary text: #64748B
* border: #E2E8F0
* success: #16A34A
* warning: #D97706
* error: #DC2626

Visual style:

* minimal
* enterprise
* professional
* clean
* calm
* white/slate surfaces
* blue primary action color
* subtle borders
* subtle shadows
* medium corner radius
* clear typography hierarchy
* strong whitespace
* compact but readable tables

Avoid:

* neon gradients
* excessive glassmorphism
* huge typography
* excessive rounded cards
* cartoon illustrations
* unnecessary animations
* distracting backgrounds
* excessive icons
* fake AI effects

Use Lucide icons consistently.

Use accessible contrast and keyboard-friendly controls.

FUNCTIONAL UX:

Implement:

* working navigation
* working sidebar collapse
* mobile menu
* search
* filtering
* sorting
* pagination
* tabs
* dropdowns
* dialogs
* drawers
* forms
* validation
* loading skeletons
* empty states
* error states
* toast notifications
* confirmation dialogs
* sample data
* realistic processing states

Create realistic mock data for:

* 5 hiring requirements
* 20 candidates
* 8 search runs
* candidate skills
* resumes
* match scores
* activity history

Do not use lorem ipsum.

Use realistic recruitment-related sample content.

ERROR HANDLING:

Handle:

* invalid forms
* empty search results
* failed resume processing
* unavailable external integration
* API errors
* file upload errors
* missing candidate data
* failed search runs

Show useful user-friendly messages.

SECURITY:

* Keep secrets server-side only.
* Never expose Naukri/API credentials in client code.
* Use role-based access structure for Admin and Recruiter.
* Include audit-log data structures.
* Keep integration credentials in environment variables/secrets.
* Do not bypass external authentication or security controls.

SCALABILITY:

Keep the architecture ready for:

* PostgreSQL
* vector search
* embeddings
* semantic candidate matching
* external recruitment connectors
* SharePoint
* Excel ingestion
* ATS integrations
* background job processing

Create service interfaces so these can be added without rewriting the UI.

IMPORTANT FILE/DATA DESIGN:

Requirement:
id
title
department
location
minExperience
maxExperience
mandatorySkills
preferredSkills
education
domain
noticePeriod
description
status
createdAt

Candidate:
id
name
currentRole
company
experience
location
skills
education
resumeUrl
resumeStatus
source
createdAt

MatchResult:
candidateId
requirementId
overallScore
skillScore
experienceScore
educationScore
locationScore
preferredSkillScore
domainScore
matchedRequirements
partialRequirements
missingRequirements
evidence
createdAt

SearchRun:
id
requirementId
status
startedAt
completedAt
candidateCount
processedResumeCount
topMatchScore
error

COMPONENT QUALITY:

Break the application into reusable components.

Examples:
AppSidebar
TopHeader
PageHeader
MetricCard
StatusBadge
MatchScoreBadge
RequirementCard
RequirementTable
CandidateTable
CandidateSummary
MatchBreakdown
SkillBadge
SearchRunTable
SearchPipeline
ResumeViewer
FilterBar
EmptyState
ErrorState
LoadingSkeleton
ConfirmDialog
ExportButtons

Keep business logic outside presentation components.

Keep constants/types/services separate.

No duplicated code.

No unnecessary dependencies.

Make TypeScript compile cleanly.

Make the application visually polished on first render.

Make all pages internally consistent.

Use realistic sample data so the application looks complete immediately.

FINAL REQUIREMENT:

Generate the complete application now as a single coherent project.

The most important user journey must work end-to-end using mock data:

Dashboard
→ New Requirement
→ Analyze Requirement
→ Start Search
→ Search Run
→ Candidate Results
→ Candidate Detail
→ Match Analysis
→ Top 10 Candidates
→ Report

The external Naukri connector must be isolated behind an interface so it can later be connected to an approved API/integration/browser automation service without changing the UI or matching engine.

Do not leave pages as empty placeholders.
Do not create unfinished TODO sections.
Do not add unrelated modules.
Do not change the product name.
Do not redesign the requested workflow.
Prioritize clean, readable, maintainable production-style code and a simple recruiter-friendly experience.

