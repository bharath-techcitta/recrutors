import { NextResponse } from "next/server";
import { store } from "@/services/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requirementId = searchParams.get("requirementId") || undefined;
    const query = searchParams.get("search")?.toLowerCase() || "";
    const minMatch = Number(searchParams.get("minMatch")) || 0;
    const location = searchParams.get("location")?.toLowerCase() || "";
    const skill = searchParams.get("skill")?.toLowerCase() || "";
    const shortlistedOnly = searchParams.get("shortlisted") === "true";

    let candidates = store.getCandidates(requirementId);

    if (query) {
      candidates = candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.currentRole.toLowerCase().includes(query) ||
          c.company.toLowerCase().includes(query) ||
          c.skills.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (minMatch > 0) {
      candidates = candidates.filter(
        (c) => (c.matchResult?.overallScore || 0) >= minMatch
      );
    }

    if (location) {
      candidates = candidates.filter((c) =>
        c.location.toLowerCase().includes(location)
      );
    }

    if (skill) {
      candidates = candidates.filter((c) =>
        c.skills.some((s) => s.toLowerCase().includes(skill))
      );
    }

    if (shortlistedOnly) {
      candidates = candidates.filter((c) => c.isShortlisted);
    }

    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const candidateId = body.candidateId;

    if (!candidateId) {
      return NextResponse.json(
        { success: false, error: "Candidate ID required" },
        { status: 400 }
      );
    }

    const updated = store.toggleCandidateShortlist(candidateId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update candidate" },
      { status: 500 }
    );
  }
}
