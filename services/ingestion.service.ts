import Content from "@/models/Content";
import { connectToDatabase } from "@/lib/mongodb";
import { getOpenAIClient, OPENAI_EMBEDDING_MODEL } from "@/lib/openai";
import { upsertContentPoints } from "@/lib/qdrant";
import crypto from "crypto";
import { cleanAndChunkContent, RawChunk } from "./chunking.service";
import type { ResourceType } from "@/types";

export type YouTubeMetadata = {
  title: string;
  videoId: string;
  channelName: string;
  thumbnailUrl: string;
};

export async function ingestContent(input: {
  title: string;
  content: string;
  url?: string;
  type?: ResourceType;
  tags?: string[];
  preChunkedData?: RawChunk[];
  youtubeMetadata?: YouTubeMetadata;
}) {
  await connectToDatabase();

  // Prevent duplicate ingestion
  if (input.url) {
    const existingUrl = await Content.findOne({ url: input.url }).select("_id").lean();
    if (existingUrl) {
      throw new Error(`Content with URL ${input.url} has already been ingested.`);
    }
  }

  const openai = getOpenAIClient();

  // 1. Clean and Semantic Chunking via LLM (or use pre-chunked from preview)
  const rawChunks = input.preChunkedData && input.preChunkedData.length > 0
    ? input.preChunkedData
    : await cleanAndChunkContent(input.content, input.type || "text");

  if (rawChunks.length === 0) {
    throw new Error("No educational chunks could be extracted from the content.");
  }

  // 2. Batch Generate Embeddings
  const textsToEmbed = rawChunks.map(chunk => `Title: ${input.title}\nTopic: ${chunk.topic}\n\n${chunk.text}`);

  const embeddingResponse = await openai.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: textsToEmbed,
  });

  const embeddings = embeddingResponse.data.sort((a, b) => a.index - b.index);

  // 3. Prepare Metadata & Qdrant Points
  const qdrantPoints = [];
  const mongoChunks = [];

  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];
    const vector = embeddings[i]?.embedding;

    if (!vector) continue;

    const embeddingId = crypto.randomUUID();

    mongoChunks.push({
      text: chunk.text,
      topic: chunk.topic,
      startTime: chunk.startTime,
      endTime: chunk.endTime,
      chunkIndex: i,
      embeddingId,
    });

    qdrantPoints.push({
      id: embeddingId,
      vector,
      payload: {
        title: input.title,
        content: chunk.text,
        url: input.url,
        type: input.type,
        tags: input.tags || [],
        embeddingId,
        topic: chunk.topic,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        chunkIndex: i,
        ...(input.youtubeMetadata && {
          videoId: input.youtubeMetadata.videoId,
          channelName: input.youtubeMetadata.channelName,
          thumbnailUrl: input.youtubeMetadata.thumbnailUrl,
        }),
      },
    });
  }

  // 4. Save to MongoDB (Raw + Chunked Metadata)
  const newContent = await Content.create({
    title: input.title,
    rawContent: input.content,
    chunks: mongoChunks,
    url: input.url,
    type: input.type,
    tags: input.tags || [],
    ...(input.youtubeMetadata && {
      videoId: input.youtubeMetadata.videoId,
      channelName: input.youtubeMetadata.channelName,
      thumbnailUrl: input.youtubeMetadata.thumbnailUrl,
    }),
  });

  // 5. Bulk Upsert to Qdrant
  if (qdrantPoints.length > 0) {
    await upsertContentPoints(qdrantPoints);
  }

  return newContent;
}
