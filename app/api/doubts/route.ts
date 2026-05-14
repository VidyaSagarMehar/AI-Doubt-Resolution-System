import { NextRequest, NextResponse } from "next/server";
import {
  createDoubt,
  listDoubts,
} from "@/services/doubt.service";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const userEmail = request.nextUrl.searchParams.get("userEmail") ?? undefined;

    const doubts = await listDoubts({ status, userEmail });
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
    const body = await request.json();
    const doubt = await createDoubt(body);
    return NextResponse.json({ data: doubt }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create doubt." },
      { status: 400 },
    );
  }
}
