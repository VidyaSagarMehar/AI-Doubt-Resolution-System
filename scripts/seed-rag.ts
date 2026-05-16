/**
 * RAG Seeding Script
 * 
 * This script allows you to bulk ingest data into your RAG system.
 * Usage: npx tsx scripts/seed-rag.ts
 */

import { ingestContent } from "../services/ingestion.service";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const sampleData = [
  {
    title: "Binary Search Algorithm",
    content: "Binary search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
    tags: ["algorithms", "computer science", "search"],
    type: "video" as const,
    url: "https://www.youtube.com/watch?v=MFhxShGxHWc"
  },
  {
    title: "React Hooks Overview",
    content: "Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class. Examples include useState for state management and useEffect for side effects.",
    tags: ["react", "frontend", "hooks"],
    type: "article" as const,
    url: "https://react.dev/reference/react"
  },
  {
    title: "Mongoose Middleware",
    content: "Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions. Mongoose has 4 types of middleware: document middleware, model middleware, aggregate middleware, and query middleware.",
    tags: ["mongodb", "mongoose", "backend"],
    type: "documentation" as const,
    url: "https://mongoosejs.com/docs/middleware.html"
  }
];

async function seed() {
  console.log("🚀 Starting RAG seeding...");

  for (const item of sampleData) {
    try {
      console.log(`\n📄 Ingesting: ${item.title}`);
      await ingestContent(item);
      console.log(`✅ Success`);
    } catch (error) {
      console.error(`❌ Failed: ${item.title}`, error);
    }
  }

  console.log("\n✨ Seeding completed!");
  process.exit(0);
}

seed();
