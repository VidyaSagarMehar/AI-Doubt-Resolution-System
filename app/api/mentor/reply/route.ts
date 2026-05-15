import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getUserFromRequest } from "@/lib/auth";
import { mentorReplySchema } from "@/lib/validations";
import { addMentorReply, canAccessDoubt } from "@/services/doubt.service";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (user.role !== "mentor") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const input = mentorReplySchema.parse(body);
    const hasAccess = await canAccessDoubt(input.doubtId, user.id, user.role);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const doubt = await addMentorReply({
      ...input,
      mentorId: user.id,
      mentorName: user.name,
    });

    return NextResponse.json({ data: doubt }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid mentor reply.", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send mentor reply." },
      { status: 400 },
    );
  }
}
