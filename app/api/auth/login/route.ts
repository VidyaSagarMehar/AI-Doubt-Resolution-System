import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { loginUser } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const user = await loginUser(input);
    const token = await signAuthToken(user);

    const response = NextResponse.json({ data: user }, { status: 200 });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid login data.", details: error.flatten() },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Login failed.";
    const status = message === "Invalid email or password." ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
