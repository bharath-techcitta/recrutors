import { NextResponse } from "next/server";
import { store } from "@/services/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const run = store.getSearchRun(id);
    if (!run) {
      return NextResponse.json({ success: false, error: "Search run not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: run });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch search run" }, { status: 500 });
  }
}
