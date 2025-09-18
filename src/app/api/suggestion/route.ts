import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDatabase } from "@/lib/connect";
import { AIResolutionProposal } from "@/lib/models";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get("_id");

    if (!_id) {
      return NextResponse.json({ error: "Incident _id is required" }, { status: 400 });
    }

    await connectDatabase();

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid incident ID format" }, { status: 400 });
    }

    // Find the AI suggestion by incident_id
    const proposal = await AIResolutionProposal.findOne({ incident_id: _id })
      .populate("incident_id")
      .populate("admin_id")
      .lean();

    if (!proposal) {
      return NextResponse.json(
        { success: false, message: "No AI suggestion found for this incident" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "AI suggestion retrieved successfully",
      data: proposal,
    });
  } catch (error) {
    console.error("Error fetching AI suggestion:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch AI suggestion" },
      { status: 500 }
    );
  }
}
