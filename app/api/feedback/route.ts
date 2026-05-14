import { NextRequest, NextResponse } from "next/server";
import { submitFeedback } from "@/services/doubt.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const feedback = await submitFeedback(body);
    return NextResponse.json({ data: feedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to store feedback.",
      },
      { status: 400 },
    );
  }
}
