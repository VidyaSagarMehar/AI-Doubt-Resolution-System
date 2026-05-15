import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getUserFromRequest } from "@/lib/auth";
import { escalateSchema } from "@/lib/validations";
import { canAccessDoubt, escalateDoubt } from "@/services/doubt.service";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const input = escalateSchema.parse(body);
    const hasAccess = await canAccessDoubt(input.doubtId, user.id, user.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const doubt = await escalateDoubt(input.doubtId);
    return NextResponse.json({ data: doubt }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid escalation data.", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to escalate doubt.",
      },
      { status: 400 },
    );
  }
}
