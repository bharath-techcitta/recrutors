import { NextResponse } from "next/server";
import { store } from "@/services/store";
import { ReportGenerator } from "@/lib/reporting/report-generator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requirementId = searchParams.get("requirementId");
    const format = searchParams.get("format");

    const reqs = store.getRequirements();
    const targetReq = (requirementId ? store.getRequirement(requirementId) : null) || reqs[0];

    if (!targetReq) {
      return NextResponse.json({ success: false, error: "No requirement available" }, { status: 404 });
    }

    const candidates = store.getCandidates(targetReq.id);
    const report = ReportGenerator.generate(targetReq, candidates);

    if (format === "csv") {
      const csv = ReportGenerator.toCSV(report);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="recruitment_report_${targetReq.id}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
