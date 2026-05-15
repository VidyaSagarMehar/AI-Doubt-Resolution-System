import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";
import { signupUser } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = signupSchema.parse(body);
    const user = await signupUser(input);
    const token = await signAuthToken(user);

    const response = NextResponse.json({ data: user }, { status: 201 });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid signup data.", details: error.flatten() },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    const status = message.includes("already exists") ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
