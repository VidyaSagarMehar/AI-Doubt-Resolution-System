import { connectToDatabase } from "../lib/mongodb";
import Content from "../models/Content";

async function run() {
  try {
    await connectToDatabase();
    
    console.log("Connected to MongoDB. Attempting to drop old embeddingId index...");
    
    // We access the raw collection to drop the index
    const collection = Content.collection;
    
    // Check if the index exists first
    const indexes = await collection.indexes();
    const hasEmbeddingIndex = indexes.some((idx: any) => idx.name === "embeddingId_1");
    
    if (hasEmbeddingIndex) {
      await collection.dropIndex("embeddingId_1");
      console.log("✅ Successfully dropped the legacy 'embeddingId_1' index.");
    } else {
      console.log("✅ Index 'embeddingId_1' does not exist or was already dropped.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error dropping index:", error);
    process.exit(1);
  }
}

run();
