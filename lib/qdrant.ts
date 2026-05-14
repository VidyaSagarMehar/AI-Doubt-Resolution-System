import { QdrantClient } from "@qdrant/js-client-rest";

export const QDRANT_COLLECTION =
  process.env.QDRANT_COLLECTION ?? "learning-content";
export const EMBEDDING_VECTOR_SIZE = 1536;

let collectionReadyPromise: Promise<void> | null = null;

let qdrantClient: QdrantClient | null = null;

export function getQdrantClient() {
  const qdrantUrl = process.env.QDRANT_URL;

  if (!qdrantUrl) {
    throw new Error("Missing QDRANT_URL environment variable.");
  }

  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: qdrantUrl,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  return qdrantClient;
}

export async function ensureQdrantCollection() {
  if (!collectionReadyPromise) {
    collectionReadyPromise = (async () => {
      const client = getQdrantClient();
      const collections = await client.getCollections();
      const exists = collections.collections.some(
        (collection) => collection.name === QDRANT_COLLECTION,
      );

      if (!exists) {
        await client.createCollection(QDRANT_COLLECTION, {
          vectors: {
            size: EMBEDDING_VECTOR_SIZE,
            distance: "Cosine",
          },
        });
      }
    })();
  }

  await collectionReadyPromise;
}

export async function upsertContentPoint(input: {
  id: string;
  vector: number[];
  title: string;
  content: string;
  tags: string[];
  embeddingId: string;
}) {
  await ensureQdrantCollection();

  const client = getQdrantClient();

  await client.upsert(QDRANT_COLLECTION, {
    wait: true,
    points: [
      {
        id: input.id,
        vector: input.vector,
        payload: {
          title: input.title,
          content: input.content,
          tags: input.tags,
          embeddingId: input.embeddingId,
        },
      },
    ],
  });
}
