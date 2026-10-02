import { NextResponse } from "next/server";
import { store } from "@/services/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const req = store.getRequirement(id);
    if (!req) {
      return NextResponse.json({ success: false, error: "Requirement not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: req });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch requirement" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = store.updateRequirement(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Requirement not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update requirement" }, { status: 500 });
  }
}
