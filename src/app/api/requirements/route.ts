import { NextResponse } from "next/server";
import { store } from "@/services/store";

export async function GET() {
  try {
    const requirements = store.getRequirements();
    return NextResponse.json({ success: true, data: requirements });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.title || !body.department || !body.location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, department, location)" },
        { status: 400 }
      );
    }

    const created = store.createRequirement({
      title: body.title,
      department: body.department,
      location: body.location,
      minExperience: Number(body.minExperience) || 3,
      maxExperience: Number(body.maxExperience) || 7,
      mandatorySkills: Array.isArray(body.mandatorySkills) ? body.mandatorySkills : ["Python"],
      preferredSkills: Array.isArray(body.preferredSkills) ? body.preferredSkills : [],
      education: body.education || "Bachelor's Degree in Engineering / Computer Science",
      domain: body.domain || "Enterprise Software",
      noticePeriod: body.noticePeriod || "30 Days or less",
      description: body.description || "",
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create requirement" },
      { status: 500 }
    );
  }
}
