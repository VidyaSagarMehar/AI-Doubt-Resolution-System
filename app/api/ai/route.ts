import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getUserFromRequest } from "@/lib/auth";
import { aiSchema } from "@/lib/validations";
import { canAccessDoubt } from "@/services/doubt.service";
import { generateAIResponseForDoubt } from "@/services/rag.service";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const input = aiSchema.parse(body);
    const hasAccess = await canAccessDoubt(input.doubtId, user.id, user.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const result = await generateAIResponseForDoubt(input.doubtId);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid AI request.", details: error.flatten() },
        { status: 400 },
      );
    }

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
