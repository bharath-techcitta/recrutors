import { Candidate } from "@/types";

export interface RetrievedResume {
  candidateId: string;
  fileName: string;
  fileType: "pdf" | "docx" | "txt";
  fileSizeBytes: number;
  retrievedAt: string;
  rawText: string;
  source: string;
}

export interface ResumeRetriever {
  retrieve(candidate: Candidate): Promise<RetrievedResume>;
  retrieveBatch(candidates: Candidate[]): Promise<RetrievedResume[]>;
}

export class DefaultResumeRetriever implements ResumeRetriever {
  async retrieve(candidate: Candidate): Promise<RetrievedResume> {
    // Simulate retrieval latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    const cleanName = candidate.name.toLowerCase().replace(/\s+/g, "_");
    const rawText = candidate.rawResumeText || `
CURRICULUM VITAE
Name: ${candidate.name}
Role: ${candidate.currentRole} at ${candidate.company}
Experience: ${candidate.experience} Years | Location: ${candidate.location}
Contact: ${candidate.email} | Phone: ${candidate.phone}

PROFESSIONAL SUMMARY:
${candidate.summary}

CORE TECHNICAL SKILLS:
${candidate.skills.join(", ")}

PROFESSIONAL EXPERIENCE:
${candidate.workHistory?.map((w) => `
${w.role} | ${w.company} (${w.duration})
${w.description}
Highlights:
${w.highlights.map((h) => `• ${h}`).join("\n")}
`).join("\n") || `Senior Engineer at ${candidate.company}`}

EDUCATION:
${candidate.education}
`;

    return {
      candidateId: candidate.id,
      fileName: `${cleanName}_resume_2026.pdf`,
      fileType: "pdf",
      fileSizeBytes: 142000 + Math.floor(Math.random() * 45000),
      retrievedAt: new Date().toISOString(),
      rawText: rawText.trim(),
      source: candidate.source,
    };
  }

  async retrieveBatch(candidates: Candidate[]): Promise<RetrievedResume[]> {
    return Promise.all(candidates.map((c) => this.retrieve(c)));
  }
}
