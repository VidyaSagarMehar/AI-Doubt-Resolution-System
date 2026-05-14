import AIResponse from "@/models/AIResponse";
import Content from "@/models/Content";
import Doubt from "@/models/Doubt";
import { connectToDatabase } from "@/lib/mongodb";
import {
  OPENAI_CHAT_MODEL,
  OPENAI_EMBEDDING_MODEL,
  getOpenAIClient,
} from "@/lib/openai";
import {
  ensureQdrantCollection,
  getQdrantClient,
  QDRANT_COLLECTION,
} from "@/lib/qdrant";
import type { RecommendedResource } from "@/types";

export async function generateAIResponseForDoubt(doubtId: string) {
  await connectToDatabase();
  await ensureQdrantCollection();
  const openai = getOpenAIClient();

  const doubt = await Doubt.findById(doubtId).lean();

  if (!doubt) {
    throw new Error("Doubt not found.");
  }

  const queryText = `${doubt.title}\n\n${doubt.description}`;
  const queryEmbedding = await createEmbedding(queryText);
  const similarDocuments = await searchSimilarContent(queryEmbedding);
  const contextBlocks = similarDocuments
    .map(
      (document, index) =>
        `Source ${index + 1}: ${document.title}\nTags: ${document.tags.join(", ") || "none"}\nContent: ${document.content}`,
    )
    .join("\n\n");

  const prompt = [
    "You are an expert tutor. Use ONLY the below context to answer.",
    "If unsure, say you don't know.",
    "",
    "Context:",
    contextBlocks || "No relevant context was found.",
    "",
    `Question: ${queryText}`,
  ].join("\n");

  const completion = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are an expert tutor that answers only from retrieved study content.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const answer =
    completion.choices[0]?.message?.content?.trim() ??
    "I don't know based on the available context.";
  const confidenceScore = similarDocuments[0]?.score ?? 0;
  const recommendedResources = similarDocuments.slice(0, 3);

  const storedResponse = await AIResponse.findOneAndUpdate(
    { doubtId: doubt._id },
    {
      doubtId: doubt._id,
      answer,
      sources: similarDocuments,
      confidenceScore,
      recommendedResources,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  if (answer && confidenceScore >= 0.25 && doubt.status !== "escalated") {
    await Doubt.findByIdAndUpdate(doubt._id, { status: "resolved" });
  }

  return serializeDocument(storedResponse);
}

async function createEmbedding(input: string) {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input,
  });

  return response.data[0]?.embedding ?? [];
}

async function searchSimilarContent(embedding: number[]) {
  const qdrantClient = getQdrantClient();
  const results = await qdrantClient.search(QDRANT_COLLECTION, {
    vector: embedding,
    limit: 5,
    with_payload: true,
  });

  const mapped = results.map((item) => {
    const payload = item.payload as {
      title?: string;
      content?: string;
      tags?: string[];
      embeddingId?: string;
    };

    return {
      title: payload.title ?? "Untitled resource",
      content: payload.content ?? "",
      tags: payload.tags ?? [],
      embeddingId:
        payload.embeddingId ?? String(item.id ?? crypto.randomUUID()),
      score: item.score ?? 0,
    } satisfies RecommendedResource;
  });

  if (mapped.length > 0) {
    return mapped;
  }

  const fallbackContent = await Content.find().limit(5).lean();
  return fallbackContent.map((item) => ({
    title: item.title,
    content: item.content,
    tags: item.tags,
    embeddingId: item.embeddingId,
    score: 0,
  }));
}

function serializeDocument<T extends { _id?: unknown; createdAt?: unknown; updatedAt?: unknown }>(
  document: T | null,
) {
  if (!document) {
    return null;
  }

  const typedDocument = document as T & {
    doubtId?: unknown;
  };

  return {
    ...document,
    _id: document._id?.toString?.() ?? document._id,
    doubtId: typedDocument.doubtId?.toString?.() ?? typedDocument.doubtId,
    createdAt:
      document.createdAt instanceof Date
        ? document.createdAt.toISOString()
        : document.createdAt,
    updatedAt:
      document.updatedAt instanceof Date
        ? document.updatedAt.toISOString()
        : document.updatedAt,
  };
}
