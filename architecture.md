                         FRONTEND
┌──────────────────────────────────────────────────┐
│ Next.js + TypeScript + Tailwind + shadcn/ui     │
│                                                  │
│ Dashboard | Requirements | Candidates | Reports │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
                  API / Server Layer
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
 Requirement       Candidate          Report
  Service           Service           Service
        │               │
        ▼               ▼
    AI Parser       Search Connector
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        Mock Connector       Authorized
                             Naukri/API
                                  │
                                  ▼
                           Candidate Data
                                  │
                                  ▼
                           Resume Retriever
                                  │
                                  ▼
                            Resume Parser
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                       Text            Structured
                                       Profile
                         │
                         ▼
                    Match Engine
                         │
                         ▼
                  Ranking / Top 10
                         │
                         ▼
                   Recruiter Review
