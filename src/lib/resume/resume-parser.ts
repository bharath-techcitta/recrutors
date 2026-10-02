export interface ParsedResume {
  candidateId: string;
  summary: string;
  extractedSkills: string[];
  totalYearsExperience: number;
  educationLevel: string;
  companiesDetected: string[];
  sections: {
    title: string;
    content: string;
  }[];
  parsingConfidence: number;
}

export interface ResumeParser {
  parse(rawText: string, candidateId: string): Promise<ParsedResume>;
}

export class DefaultResumeParser implements ResumeParser {
  async parse(rawText: string, candidateId: string): Promise<ParsedResume> {
    // Simulate parsing processing time
    await new Promise((resolve) => setTimeout(resolve, 80));

    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
    const sections: { title: string; content: string }[] = [];
    let currentTitle = "General";
    let currentContent: string[] = [];

    const sectionHeaders = [
      "PROFESSIONAL SUMMARY",
      "CORE TECHNICAL SKILLS",
      "PROFESSIONAL EXPERIENCE",
      "EXPERIENCE",
      "WORK HISTORY",
      "EDUCATION",
      "PROJECTS",
      "CERTIFICATIONS",
    ];

    for (const line of lines) {
      const matchedHeader = sectionHeaders.find((h) => line.toUpperCase().startsWith(h));
      if (matchedHeader) {
        if (currentContent.length > 0) {
          sections.push({ title: currentTitle, content: currentContent.join("\n") });
        }
        currentTitle = matchedHeader;
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections.push({ title: currentTitle, content: currentContent.join("\n") });
    }

    // Extract skills with dictionary
    const knownSkills = [
      "Python", "FastAPI", "Django", "React", "TypeScript", "JavaScript",
      "Next.js", "Node.js", "AWS", "Docker", "Kubernetes", "PostgreSQL",
      "MongoDB", "Redis", "Kafka", "GraphQL", "PyTorch", "TensorFlow",
      "Apache Spark", "Airflow", "CI/CD", "Microservices", "RESTful APIs",
      "Terraform", "GCP", "Azure", "Elasticsearch", "Java", "Spring Boot"
    ];

    const extractedSkills: string[] = [];
    for (const skill of knownSkills) {
      if (new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i").test(rawText)) {
        extractedSkills.push(skill);
      }
    }

    // Extract experience years
    let totalYears = 5;
    const expMatch = rawText.match(/(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
    if (expMatch && expMatch[1]) {
      totalYears = parseInt(expMatch[1], 10);
    }

    return {
      candidateId,
      summary: sections.find((s) => s.title.includes("SUMMARY"))?.content || "Experienced technology specialist.",
      extractedSkills,
      totalYearsExperience: totalYears,
      educationLevel: "Bachelor's / Master's in Computer Science",
      companiesDetected: ["Current Employer", "Previous Enterprise"],
      sections,
      parsingConfidence: 0.96,
    };
  }
}
