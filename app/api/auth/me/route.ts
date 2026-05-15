import { NextResponse } from "next/server";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { getUserById } from "@/services/auth.service";

export async function GET() {
  const authUser = await getCurrentUserFromCookies();

  if (!authUser) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getUserById(authUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ data: user }, { status: 200 });
}
