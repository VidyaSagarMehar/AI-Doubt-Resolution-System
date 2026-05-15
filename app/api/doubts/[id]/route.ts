import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getUserFromRequest } from "@/lib/auth";
import { doubtSchema } from "@/lib/validations";
import {
  canAccessDoubt,
  deleteDoubtById,
  getDoubtById,
  updateDoubtById,
} from "@/services/doubt.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = getUserFromRequest(_request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await context.params;
    const hasAccess = await canAccessDoubt(id, user.id, user.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

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
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await context.params;
    const hasAccess = await canAccessDoubt(id, user.id, user.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const input = doubtSchema.partial().parse(body);
    const doubt = await updateDoubtById(id, input);

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found." }, { status: 404 });
    }

    return NextResponse.json({ data: doubt }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid doubt data.", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update doubt." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = getUserFromRequest(_request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await context.params;
    const hasAccess = await canAccessDoubt(id, user.id, user.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

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
