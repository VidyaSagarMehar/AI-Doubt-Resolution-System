import { NextRequest, NextResponse } from "next/server";
import { generateAIResponseForDoubt } from "@/services/rag.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await generateAIResponseForDoubt(body.doubtId);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI response.",
      },
      { status: 400 },
    );
  }
}
