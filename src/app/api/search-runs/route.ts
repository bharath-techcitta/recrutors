import { NextResponse } from "next/server";
import { store } from "@/services/store";

export async function GET() {
  try {
    const runs = store.getSearchRuns();
    return NextResponse.json({ success: true, data: runs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch search runs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requirementId = body.requirementId;

    if (!requirementId) {
      return NextResponse.json(
        { success: false, error: "requirementId is required" },
        { status: 400 }
      );
    }

    const run = await store.triggerSearchRun(requirementId);
    return NextResponse.json({ success: true, data: run });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger search run" },
      { status: 500 }
    );
  }
}
