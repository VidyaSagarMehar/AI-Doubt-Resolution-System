import Content from "@/models/Content";
import { connectToDatabase } from "@/lib/mongodb";
import { getOpenAIClient, OPENAI_EMBEDDING_MODEL } from "@/lib/openai";
import { upsertContentPoints } from "@/lib/qdrant";
import crypto from "crypto";
import { cleanAndChunkContent } from "./chunking.service";
import type { ResourceType } from "@/types";

export async function ingestContent(input: {
  title: string;
  content: string;
  url?: string;
  type?: ResourceType;
  tags?: string[];
}) {
  await connectToDatabase();

  const openai = getOpenAIClient();

  // 1. Clean and Semantic Chunking via LLM
  const rawChunks = await cleanAndChunkContent(input.content, input.type || "text");

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
  });

  // 5. Bulk Upsert to Qdrant
  if (qdrantPoints.length > 0) {
    await upsertContentPoints(qdrantPoints);
  }

  return newContent;
}
