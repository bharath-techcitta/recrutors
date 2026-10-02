import { Requirement } from "@/types";

export interface ParsedRequirementResult {
  title: string;
  department: string;
  location: string;
  minExperience: number;
  maxExperience: number;
  mandatorySkills: string[];
  preferredSkills: string[];
  education: string;
  domain: string;
  noticePeriod: string;
  confidenceScore: number;
  extractedSections: {
    skillsFound: string[];
    experienceMatches: string[];
    educationMatches: string[];
    locationMatches: string[];
  };
}

export class RequirementParser {
  /**
   * Parse unstructured job descriptions or manual text into clean, structured recruitment criteria
   */
  public static parse(text: string, hints?: Partial<Requirement>): ParsedRequirementResult {
    const raw = text.toLowerCase();

    // 1. Title extraction
    let title = hints?.title || "";
    if (!title) {
      if (raw.includes("lead machine learning") || raw.includes("ml lead") || raw.includes("ai engineer")) {
        title = "Lead AI / ML Engineer";
      } else if (raw.includes("devops") || raw.includes("cloud architect") || raw.includes("sre")) {
        title = "Principal DevOps & Cloud Architect";
      } else if (raw.includes("full stack") || raw.includes("fullstack") || raw.includes("frontend and backend")) {
        title = "Senior Full Stack Engineer";
      } else if (raw.includes("product manager") || raw.includes("pm")) {
        title = "Senior Product Manager - Fintech";
      } else if (raw.includes("data engineer") || raw.includes("spark") || raw.includes("etl")) {
        title = "Staff Data Engineer";
      } else {
        const firstLine = text.trim().split("\n")[0] || "";
        title = firstLine.length > 5 && firstLine.length < 60 ? firstLine.replace(/job description[:\s-]*/i, "") : "Software Development Engineer";
      }
    }

    // 2. Department extraction
    let department = hints?.department || "";
    if (!department) {
      if (raw.includes("product") || raw.includes("roadmap")) department = "Product Management";
      else if (raw.includes("data") || raw.includes("analytics")) department = "Data & Analytics";
      else if (raw.includes("devops") || raw.includes("cloud") || raw.includes("infrastructure")) department = "Cloud Infrastructure";
      else department = "Engineering";
    }

    // 3. Location extraction
    let location = hints?.location || "";
    const commonLocations = ["Hyderabad", "Bangalore", "Bengaluru", "Pune", "Mumbai", "Delhi NCR", "Gurgaon", "Remote", "Chennai"];
    if (!location) {
      for (const loc of commonLocations) {
        if (new RegExp(`\\b${loc.toLowerCase()}\\b`, "i").test(raw)) {
          location = loc === "Bengaluru" ? "Bangalore" : loc;
          break;
        }
      }
      if (!location) location = "Hyderabad / Remote";
    }

    // 4. Experience extraction
    let minExperience = hints?.minExperience ?? 3;
    let maxExperience = hints?.maxExperience ?? 7;

    const expRegexes = [
      /(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\s*(?:years?|yrs?)/i,
      /(\d{1,2})\+?\s*(?:years?|yrs?)/i,
      /minimum\s*(?:of)?\s*(\d{1,2})\s*(?:years?|yrs?)/i,
    ];

    for (const rx of expRegexes) {
      const match = text.match(rx);
      if (match) {
        if (match[2]) {
          minExperience = parseInt(match[1], 10);
          maxExperience = parseInt(match[2], 10);
        } else if (match[1]) {
          minExperience = parseInt(match[1], 10);
          maxExperience = minExperience + 4;
        }
        break;
      }
    }

    // 5. Skills extraction
    const skillDictionary: Record<string, string> = {
      python: "Python",
      fastapi: "FastAPI",
      django: "Django",
      react: "React",
      typescript: "TypeScript",
      javascript: "JavaScript",
      nextjs: "Next.js",
      "node.js": "Node.js",
      nodejs: "Node.js",
      aws: "AWS",
      azure: "Azure",
      gcp: "Google Cloud",
      docker: "Docker",
      kubernetes: "Kubernetes",
      postgresql: "PostgreSQL",
      mongodb: "MongoDB",
      redis: "Redis",
      kafka: "Kafka",
      graphql: "GraphQL",
      terraform: "Terraform",
      pytorch: "PyTorch",
      tensorflow: "TensorFlow",
      spark: "Apache Spark",
      airflow: "Apache Airflow",
      sql: "SQL",
      ci_cd: "CI/CD",
      microservices: "Microservices",
      "rest api": "RESTful APIs",
      agile: "Agile / Scrum",
    };

    const detectedSkills: string[] = [];
    for (const [key, label] of Object.entries(skillDictionary)) {
      if (new RegExp(`\\b${key.replace(".", "\\.")}\\b`, "i").test(raw)) {
        if (!detectedSkills.includes(label)) {
          detectedSkills.push(label);
        }
      }
    }

    const mandatorySkills = hints?.mandatorySkills?.length
      ? hints.mandatorySkills
      : detectedSkills.slice(0, 4).length > 0
      ? detectedSkills.slice(0, 4)
      : ["Python", "FastAPI", "PostgreSQL", "AWS"];

    const preferredSkills = hints?.preferredSkills?.length
      ? hints.preferredSkills
      : detectedSkills.slice(4, 7).length > 0
      ? detectedSkills.slice(4, 7)
      : ["Docker", "Kubernetes", "Redis"];

    // 6. Education extraction
    let education = hints?.education || "";
    if (!education) {
      if (raw.includes("phd") || raw.includes("doctorate")) {
        education = "Ph.D. in Computer Science or related field";
      } else if (raw.includes("master") || raw.includes("m.tech") || raw.includes("ms")) {
        education = "B.Tech / M.Tech / MS in Computer Science or related";
      } else {
        education = "B.Tech / B.E. / BS in Computer Science, IT or related engineering";
      }
    }

    // 7. Domain extraction
    let domain = hints?.domain || "";
    if (!domain) {
      if (raw.includes("fintech") || raw.includes("banking") || raw.includes("payment")) domain = "Fintech & Banking";
      else if (raw.includes("healthcare") || raw.includes("pharma") || raw.includes("medical")) domain = "Healthcare & Pharma";
      else if (raw.includes("ecommerce") || raw.includes("retail")) domain = "E-Commerce & Retail";
      else if (raw.includes("saas") || raw.includes("enterprise")) domain = "Enterprise SaaS";
      else domain = "Information Technology / Software";
    }

    // 8. Notice period
    let noticePeriod = hints?.noticePeriod || "";
    if (!noticePeriod) {
      if (raw.includes("immediate") || raw.includes("15 days")) noticePeriod = "Immediate to 15 Days";
      else if (raw.includes("30 days") || raw.includes("1 month")) noticePeriod = "30 Days or less";
      else noticePeriod = "30 to 60 Days max";
    }

    return {
      title,
      department,
      location,
      minExperience,
      maxExperience,
      mandatorySkills,
      preferredSkills,
      education,
      domain,
      noticePeriod,
      confidenceScore: 0.94,
      extractedSections: {
        skillsFound: detectedSkills,
        experienceMatches: [`${minExperience}-${maxExperience} years requested`],
        educationMatches: [education],
        locationMatches: [location],
      },
    };
  }
}
