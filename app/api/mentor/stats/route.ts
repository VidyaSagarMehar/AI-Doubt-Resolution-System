import { NextRequest, NextResponse } from "next/server";
import Doubt from "@/models/Doubt";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // 1. Basic Counts
    const totalDoubts = await Doubt.countDocuments();
    const resolvedByAI = await Doubt.countDocuments({ status: "resolved" });
    const escalated = await Doubt.countDocuments({ status: "escalated" });
    const mentorReplied = await Doubt.countDocuments({ status: "mentor_replied" });

    // 2. AI Success Rate
    const aiSuccessRate = totalDoubts > 0 
      ? ((resolvedByAI / totalDoubts) * 100).toFixed(1) 
      : "0";

    // 3. Status Breakdown for Charting
    const stats = {
      total: totalDoubts,
      resolvedByAI,
      escalated,
      mentorReplied,
      aiSuccessRate: parseFloat(aiSuccessRate),
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch mentor stats" },
      { status: 500 }
    );
  }
}
