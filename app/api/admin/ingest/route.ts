import { NextRequest, NextResponse } from "next/server";
import { ingestContent } from "@/services/ingestion.service";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req as any);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Forbidden. Mentors only." }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, tags, url, type, preChunkedData, youtubeMetadata } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const result = await ingestContent({ 
      title, 
      content, 
      tags, 
      url, 
      type,
      preChunkedData,
      youtubeMetadata
    });

    return NextResponse.json({
      success: true,
      message: "Content ingested successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
