import { NextResponse } from "next/server";
import { RequirementParser } from "@/lib/ai/requirement-parser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body.text || "";

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "No text or document provided for parsing" },
        { status: 400 }
      );
    }

    const parsed = RequirementParser.parse(text, {
      title: body.title,
      department: body.department,
      location: body.location,
    });

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to parse requirement text" },
      { status: 500 }
    );
  }
}
