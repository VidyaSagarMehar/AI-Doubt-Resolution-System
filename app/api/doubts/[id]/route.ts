import { NextRequest, NextResponse } from "next/server";
import {
  deleteDoubtById,
  getDoubtById,
  updateDoubtById,
} from "@/services/doubt.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const doubt = await getDoubtById(id);

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found." }, { status: 404 });
    }

    return NextResponse.json({ data: doubt }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch doubt." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const doubt = await updateDoubtById(id, body);

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found." }, { status: 404 });
    }

    return NextResponse.json({ data: doubt }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update doubt." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteDoubtById(id);

    if (!deleted) {
      return NextResponse.json({ error: "Doubt not found." }, { status: 404 });
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete doubt." },
      { status: 500 },
    );
  }
}
