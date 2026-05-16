import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getUserFromRequest } from "@/lib/auth";
import { doubtSchema } from "@/lib/validations";
import {
  createDoubt,
  listDoubts,
} from "@/services/doubt.service";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const userEmail = request.nextUrl.searchParams.get("userEmail") ?? undefined;
    const allStudents = request.nextUrl.searchParams.get("allStudents") === "true";

    // Mentors can optionally pass ?allStudents=true to view all student doubts
    // (used in the mentor workspace). Otherwise everyone sees their own doubts only.
    const userId = allStudents && user.role === "mentor" ? undefined : user.id;

    const doubts = await listDoubts({
      status,
      userEmail,
      userId,
    });
    return NextResponse.json({ data: doubts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch doubts." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const input = doubtSchema.parse(body);
    const doubt = await createDoubt({ ...input, userId: user.id });
    return NextResponse.json({ data: doubt }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid doubt data.", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create doubt." },
      { status: 400 },
    );
  }
}
