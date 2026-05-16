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

const RAG_CONFIDENCE_THRESHOLD = 0.40;

export async function generateAIResponseForDoubt(doubtId: string) {
  await connectToDatabase();
  await ensureQdrantCollection();

  const openai = getOpenAIClient();

  const doubt = await Doubt.findById(doubtId).lean();
  if (!doubt) throw new Error("Doubt not found.");

  // =========================================================
  // Fetch Conversation History
  // =========================================================

  const historyDoubts = await Doubt.find({
    userId: doubt.userId,
    _id: { $ne: doubtId },
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const historyIds = historyDoubts.map((d) => d._id);
  const historyResponses = await AIResponse.find({
    doubtId: { $in: historyIds },
  }).lean();

  // Map history for prompt context
  const conversationHistory = historyDoubts
    .reverse()
    .map((d) => {
      const resp = historyResponses.find(
        (r) => r.doubtId.toString() === d._id.toString(),
      );
      return `Student: ${d.description}\nAI: ${resp?.answer || "(No response)"}`;
    })
    .join("\n\n");

  // =========================================================
  // Query Rewriting (Contextualization)
  // =========================================================

  let searchSourceText = `${doubt.title}\n\n${doubt.description}`;

  if (conversationHistory) {
    try {
      const rewriteCompletion = await openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are a search query optimizer. Given a conversation history and a new student doubt, rewrite the doubt to be a self-contained, descriptive search query for vector search. Return ONLY the rewritten text.",
          },
          {
            role: "user",
            content: `History:\n${conversationHistory}\n\nNew Doubt: ${searchSourceText}`,
          },
        ],
      });
      searchSourceText = rewriteCompletion.choices[0]?.message?.content?.trim() || searchSourceText;
    } catch (error) {
      console.error("Query rewrite failed:", error);
    }
  }

  // =========================================================
  // Create Query Embedding
  // =========================================================

  const queryEmbedding = await createEmbedding(searchSourceText);

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

  const systemPrompt = `
You are a helpful, brief, and concise AI tutor. 

${
  hasStrongContext
    ? "Use the retrieved study material (including video lectures) to answer accurately. Favor brevity over length."
    : "No exact material found. Answer briefly using general knowledge."
}

Rules:
- Keep answers short (max 2-3 paragraphs).
- Use bullet points for readability.
- If a relevant video lecture is found in the sources, briefly mention it.
- Explain concepts simply for students.
`;

  const userPrompt = `
${
  conversationHistory
    ? `Recent Conversation History:\n${conversationHistory}\n\n`
    : ""
}
${
  hasStrongContext
    ? `Retrieved Study Material:\n${contextBlocks}\n\n`
    : ""
}
Student Question:
${doubt.description}
`;

  // =========================================================
  // Generate AI Response
  // =========================================================

  const completion = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    temperature: hasStrongContext ? 0.2 : 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
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
    : conversationHistory
    ? generatedAnswer // If we have history, don't show the "No material found" warning as it might be a simple follow-up
    : `No exact course material was found for this topic.\n\nHere is a general explanation:\n\n${generatedAnswer}`;

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
      url?: string;
      type?: string;
      embeddingId?: string;
    };

    return {
      title: payload.title ?? "Untitled resource",
      content: payload.content ?? "",
      url: payload.url,
      type: payload.type as any,
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
    url: item.url,
    type: item.type as any,
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