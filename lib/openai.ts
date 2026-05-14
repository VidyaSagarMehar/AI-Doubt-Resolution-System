import OpenAI from "openai";

export const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
export const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}
