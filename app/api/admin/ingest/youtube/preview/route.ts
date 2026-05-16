import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { fetchYouTubeMetadata, fetchYouTubeTranscriptText } from "@/services/youtube.service";
import { cleanAndChunkContent } from "@/services/chunking.service";

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req as any);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Forbidden. Mentors only." }, { status: 403 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required." }, { status: 400 });
    }

    // 1. Fetch Metadata
    const metadata = await fetchYouTubeMetadata(url);

    // 2. Fetch Transcript
    const rawTranscript = await fetchYouTubeTranscriptText(url);

    // 3. Clean and Chunk using LLM
    // This takes raw timestamps and maps them semantically
    const chunks = await cleanAndChunkContent(rawTranscript, "video");

    return NextResponse.json({
      success: true,
      data: {
        metadata,
        chunks,
        rawTranscript, // Include raw for mongo backup
      },
    });
  } catch (error) {
    console.error("YouTube Preview Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
