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

const RAG_CONFIDENCE_THRESHOLD = 0.45;

export async function generateAIResponseForDoubt(doubtId: string) {
  await connectToDatabase();
  await ensureQdrantCollection();

  const openai = getOpenAIClient();

  const doubt = await Doubt.findById(doubtId).lean();

  if (!doubt) {
    throw new Error("Doubt not found.");
  }

  const queryText = `${doubt.title}\n\n${doubt.description}`;

  // =========================================================
  // Create Query Embedding
  // =========================================================

  const queryEmbedding = await createEmbedding(queryText);

  // =========================================================
  // Retrieve Similar Documents
  // =========================================================

  const similarDocuments = await searchSimilarContent(queryEmbedding);

  const confidenceScore = similarDocuments[0]?.score ?? 0;

  const hasStrongContext =
    similarDocuments.length > 0 &&
    confidenceScore >= RAG_CONFIDENCE_THRESHOLD;

  // =========================================================
  // Build Context Blocks
  // =========================================================

  const contextBlocks = similarDocuments
    .map(
      (document, index) =>
        `Source ${index + 1}: ${document.title}
Tags: ${document.tags.join(", ") || "none"}
Content: ${document.content}`,
    )
    .join("\n\n");

  // =========================================================
  // Dynamic Prompting
  // =========================================================

  const answerSource: "rag" | "fallback" = hasStrongContext
    ? "rag"
    : "fallback";

  const systemPrompt = hasStrongContext
    ? `
You are an expert AI tutor.

Use the retrieved study material to answer the student's question accurately.

Rules:
- Prioritize retrieved study content
- Keep answers educational and concise
- If context contains the answer, do not hallucinate
- Explain concepts clearly
`
    : `
You are an expert AI tutor.

No strong study material was found.

Answer using your general technical knowledge in a clear and educational way.

Rules:
- Be accurate
- Explain concepts simply
- Mention that the answer is based on general AI knowledge
`;

  const userPrompt = hasStrongContext
    ? `
Retrieved Study Material:

${contextBlocks}

Student Question:
${queryText}
`
    : `
Student Question:
${queryText}
`;

  // =========================================================
  // Generate AI Response
  // =========================================================

  const completion = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    temperature: hasStrongContext ? 0.2 : 0.4,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const generatedAnswer =
    completion.choices[0]?.message?.content?.trim() ??
    "I couldn't generate a helpful response.";

  // =========================================================
  // Final Answer Formatting
  // =========================================================

  const answer = hasStrongContext
    ? generatedAnswer
    : `No exact course material was found for this topic.

Here is a general explanation:

${generatedAnswer}`;

  // =========================================================
  // Recommended Resources
  // =========================================================

  const recommendedResources = similarDocuments.slice(0, 3);

  // =========================================================
  // Store Response
  // =========================================================

  const storedResponse = await AIResponse.findOneAndUpdate(
    { doubtId: doubt._id },
    {
      doubtId: doubt._id,
      answer,
      answerSource,
      sources: similarDocuments,
      confidenceScore: Number((confidenceScore * 100).toFixed(2)),
      recommendedResources,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  // =========================================================
  // Update Doubt Status
  // =========================================================

  if (
    generatedAnswer &&
    confidenceScore >= 0.25 &&
    doubt.status !== "escalated"
  ) {
    await Doubt.findByIdAndUpdate(doubt._id, {
      status: "resolved",
    });
  }

  return serializeDocument(storedResponse);
}

// =========================================================
// Generate Doubt Title
// =========================================================

export async function generateDoubtTitle(description: string): Promise<string> {
  const openai = getOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at summarizing educational doubts. Create a very concise, professional, and clear title (max 60 characters) for the following doubt description. Return ONLY the title text.",
        },
        {
          role: "user",
          content: description,
        },
      ],
    });

    const title = completion.choices[0]?.message?.content?.trim() ?? "";
    // Clean up quotes if AI included them
    return title.replace(/^["']|["']$/g, "").slice(0, 100);
  } catch (error) {
    console.error("Failed to generate title:", error);
    // Fallback: first 50 chars of description
    return description.slice(0, 50).trim() + (description.length > 50 ? "..." : "");
  }
}

// =========================================================
// Create Embedding
// =========================================================

async function createEmbedding(input: string) {
  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input,
  });

  return response.data[0]?.embedding ?? [];
}

// =========================================================
// Semantic Search in Qdrant
// =========================================================

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

  // =========================================================
  // Fallback MongoDB Content
  // =========================================================

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

// =========================================================
// Serialize Mongo Documents
// =========================================================

function serializeDocument<
  T extends {
    _id?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
  },
>(document: T | null) {
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