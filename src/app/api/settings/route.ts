import { NextResponse } from "next/server";
import { store } from "@/services/store";
import { getCandidateSearchConnector } from "@/lib/integrations/candidate-search-connector";

export async function GET() {
  try {
    const weights = store.getWeights();
    const naukriStatus = store.getNaukriStatus();
    const auditLogs = store.getAuditLogs();

    return NextResponse.json({
      success: true,
      data: {
        weights,
        naukriStatus,
        auditLogs,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "updateWeights" && body.weights) {
      const updated = store.updateWeights(body.weights);
      return NextResponse.json({ success: true, data: { weights: updated } });
    }

    if (body.action === "testNaukri") {
      const connector = getCandidateSearchConnector(true);
      const testResult = await connector.testConnection();
      return NextResponse.json({ success: true, data: testResult });
    }

    if (body.action === "toggleNaukri") {
      const updated = store.setNaukriConnected(Boolean(body.connected));
      return NextResponse.json({ success: true, data: { naukriStatus: updated } });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
