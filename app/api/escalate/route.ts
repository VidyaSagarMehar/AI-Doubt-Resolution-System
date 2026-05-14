import { NextRequest, NextResponse } from "next/server";
import { escalateDoubt } from "@/services/doubt.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const doubt = await escalateDoubt(body.doubtId);
    return NextResponse.json({ data: doubt }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to escalate doubt.",
      },
      { status: 400 },
    );
  }
}
