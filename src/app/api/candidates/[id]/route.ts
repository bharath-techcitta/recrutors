import { NextResponse } from "next/server";
import { store } from "@/services/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requirementId = searchParams.get("requirementId") || undefined;

    const candidate = store.getCandidate(id, requirementId);
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch candidate details" },
      { status: 500 }
    );
  }
}
