import { NextRequest, NextResponse } from "next/server";
import Doubt from "@/models/Doubt";
import AIResponse from "@/models/AIResponse";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // Find AI responses with confidence below 35%
    // These indicate gaps in the knowledge base.
    const lowConfidenceResponses = await AIResponse.find({
      confidenceScore: { $lt: 35 },
    })
    .sort({ confidenceScore: 1 })
    .limit(5)
    .lean();

    const doubtIds = lowConfidenceResponses.map(r => r.doubtId);
    
    // Fetch the corresponding doubts
    const gaps = await Doubt.find({
      _id: { $in: doubtIds },
      status: { $ne: "escalated" } // If already escalated, the mentor is already looking at it
    }).lean();

    // Combine them
    const data = gaps.map(doubt => {
      const resp = lowConfidenceResponses.find(r => r.doubtId.toString() === doubt._id.toString());
      return {
        ...doubt,
        confidence: resp?.confidenceScore
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch knowledge gaps" },
      { status: 500 }
    );
  }
}
