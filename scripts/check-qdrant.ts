import { getQdrantClient, QDRANT_COLLECTION } from "../lib/qdrant";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyQdrant() {
  console.log("🔍 Checking Qdrant Collection:", QDRANT_COLLECTION);
  
  const client = getQdrantClient();
  
  try {
    const collectionInfo = await client.getCollection(QDRANT_COLLECTION);
    console.log("\n✅ Collection found!");
    console.log("-----------------------------------------");
    console.log("Points Count:", collectionInfo.points_count);
    console.log("Indexed Vectors:", collectionInfo.indexed_vectors_count);
    console.log("Status:", collectionInfo.status);
    console.log("-----------------------------------------");

    if (collectionInfo.points_count === 0) {
      console.log("\n⚠️ Warning: The collection is empty. Make sure your ingestion process is running correctly.");
    } else {
      console.log("\n🚀 Your data is successfully synced to Qdrant!");
      
      // Fetch a sample point
      const points = await client.scroll(QDRANT_COLLECTION, {
        limit: 1,
        with_payload: true,
      });
      
      if (points.points.length > 0) {
        console.log("\nSample Point Metadata:");
        console.log(JSON.stringify(points.points[0].payload, null, 2));
      }
    }
  } catch (error) {
    console.error("\n❌ Error accessing Qdrant:", error instanceof Error ? error.message : error);
  }
}

verifyQdrant();
