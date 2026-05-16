import Content from "@/models/Content";
import { connectToDatabase } from "@/lib/mongodb";
import { getOpenAIClient, OPENAI_EMBEDDING_MODEL } from "@/lib/openai";
import { upsertContentPoint } from "@/lib/qdrant";
import crypto from "crypto";

export async function ingestContent(input: {
  title: string;
  content: string;
  url?: string;
  type?: "text" | "video" | "article" | "documentation";
  tags?: string[];
}) {
  await connectToDatabase();

  const openai = getOpenAIClient();

  // 1. Generate Embedding
  const embeddingResponse = await openai.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: `${input.title}\n\n${input.content}`,
  });

  const vector = embeddingResponse.data[0]?.embedding;
  if (!vector) {
    throw new Error("Failed to generate embedding");
  }

  // 2. Create a unique ID for the point
  const embeddingId = crypto.randomUUID();

  // 3. Save to MongoDB (Metadata)
  const newContent = await Content.create({
    title: input.title,
    content: input.content,
    url: input.url,
    type: input.type,
    tags: input.tags || [],
    embeddingId,
  });

  // 4. Upsert to Qdrant (Vector)
  await upsertContentPoint({
    id: embeddingId,
    vector,
    title: input.title,
    content: input.content,
    url: input.url,
    type: input.type,
    tags: input.tags || [],
    embeddingId,
  });

  return newContent;
}
