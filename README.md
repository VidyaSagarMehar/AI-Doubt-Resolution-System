# House of EdTech - AI RAG Platform

## 👨‍💻 Demo Credentials
**Explore the platform instantly using these built-in accounts:**

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `demostudent@gmail.com` | `Demo@12345` |
| **Mentor / Admin** | `demomentor@gmail.com` | `Demo@12345` |

---

## 🌟 Project Overview
**House of EdTech** is a production-grade, AI-powered Educational RAG (Retrieval-Augmented Generation) Platform designed to eradicate the "doubt-resolution bottleneck" in modern learning environments. 

By leveraging **Retrieval-Augmented Generation**, this platform instantly resolves student doubts by performing semantic searches across course materials—including YouTube lecture transcripts, PDF notes, and documentation.

### Why Educational RAG?
Traditional LMS systems force students to wait hours or days for human replies. This platform understands your specific course context, allowing students to get context-aware answers in seconds, deep-linked directly to the relevant lecture moment.

### Core Capabilities
*   **Timestamp-Aware Video Retrieval:** Deep-link students directly to the exact second a concept is taught.
*   **Intelligent Auto-Ingestion:** Automated pipelines to clean transcripts and group content by educational concepts.
*   **Human-in-the-Loop Escalation:** High-confidence AI answers with seamless fallback to human mentors.
*   **Proactive Knowledge Gap Detection:** Dashboard tracking for frequently escalated topics.

---

## 🏗️ Architecture & Design

### High-Level Design (HLD)
![System Architecture](./public/assets/diagrams/hld.png)

```mermaid
flowchart TD
    Student["Student"]
    Mentor["Mentor / Admin"]

    subgraph Frontend_Layer ["Frontend Layer"]
        Dashboard["Student Dashboard UI"]
        MentorDash["Mentor Escalation UI"]
        IngestUI["Ingestion Portal UI"]
    end

    subgraph Backend_API_Layer ["Backend API Layer"]
        AuthMiddleware["Role-Based Auth Middleware"]
        RAGService["RAG Orchestration Service"]
        IngestService["Auto-Ingestion Service"]
    end

    subgraph Storage_Databases ["Storage & Databases"]
        Mongo[("MongoDB Atlas")]
        Qdrant[("Qdrant Vector DB")]
    end

    subgraph External_Integrations ["External Integrations"]
        OpenAI["OpenAI API"]
        YouTube["YouTube API"]
    end

    Student --> Dashboard
    Mentor --> MentorDash
    Mentor --> IngestUI

    Dashboard --> AuthMiddleware
    MentorDash --> AuthMiddleware
    IngestUI --> AuthMiddleware

    AuthMiddleware --> RAGService
    AuthMiddleware --> IngestService

    RAGService --> Mongo
    RAGService --> Qdrant
    RAGService --> OpenAI

    IngestService --> YouTube
    IngestService --> OpenAI
    IngestService --> Qdrant
    IngestService --> Mongo
```

### RAG Retrieval Pipeline (LLD)
![RAG Pipeline](./public/assets/diagrams/rag.png)

```mermaid
sequenceDiagram
    participant UI as Student UI
    participant API as Next.js API
    participant Mongo as MongoDB
    participant Embed as OpenAI Embeddings
    participant Qdrant as Qdrant Vector DB
    participant LLM as OpenAI GPT

    UI->>API: POST /api/ai
    API->>Mongo: Fetch doubt details
    Mongo-->>API: History context
    API->>LLM: Rewrite query
    LLM-->>API: Optimized Search Query
    API->>Embed: Generate Vector Embedding
    Embed-->>API: Vector Array
    API->>Qdrant: Search Vector
    Qdrant-->>API: Semantic Chunks
    API->>LLM: Stream prompt
    LLM-->>API: Final Answer
    API->>Mongo: Save AIResponse
    API-->>UI: Return Answer
```

### Automated Ingestion Workflow
![Ingestion Workflow](./public/assets/diagrams/ingestion.png)

```mermaid
sequenceDiagram
    participant UI as Mentor UI
    participant API as Next.js API
    participant YT as YouTube Services
    participant Mongo as MongoDB
    participant LLM as OpenAI Chunking
    participant Embed as OpenAI Embeddings
    participant Qdrant as Qdrant Vector DB

    UI->>API: POST YouTube URL
    API->>YT: Fetch Metadata
    API->>YT: Fetch Transcript
    YT-->>API: Raw Transcript
    API->>LLM: Clean and Chunk
    LLM-->>API: JSON Chunks
    API-->>UI: Return preview
    
    UI->>API: POST Approve
    API->>Mongo: Check duplicate
    API->>Embed: Batch embed
    Embed-->>API: Array of Vectors
    API->>Qdrant: Bulk Upsert
    API->>Mongo: Save metadata
    API-->>UI: Success Toast
```

---

## 📊 Database Schema (ERD)
```mermaid
erDiagram
    USER ||--o{ DOUBT : asks
    DOUBT ||--o| AI_RESPONSE : receives
    AI_RESPONSE ||--o{ RECOMMENDED_RESOURCE : contains
    CONTENT ||--o{ CHUNK : splits_into
    
    USER {
        string name
        string email
        string role
    }

    DOUBT {
        string title
        string description
        string status
    }

    AI_RESPONSE {
        string answer
        float confidenceScore
    }

    RECOMMENDED_RESOURCE {
        string title
        string url
    }

    CONTENT {
        string title
        string url
        string type
    }
```

---

## 🛠️ Technical Implementation

### Folder Structure
```text
/app
  /(dashboard)     # Protected routes (Student/Mentor)
  /api             # Backend REST endpoints
/components        # Reusable React UI (ChatUI, RecommendationList, Footer)
/lib               # Core singletons (mongodb.ts, qdrant.ts, openai.ts)
/services          # Business logic (rag.service.ts, ingestion.service.ts)
/models            # Mongoose schemas (Doubt, AIResponse, Content)
/types             # Global TypeScript definitions
```

### Chunk Schema (Qdrant Payload)
```typescript
{
  title: string;           // Resource title
  content: string;         // Semantic text chunk
  url?: string;            // Deep-link URL
  type: ResourceType;      // "video" | "article" | "pdf_notes"
  startTime?: string;      // Video offset (e.g., "1:24")
  endTime?: string;        // End offset
  videoId?: string;        // YouTube ID
  thumbnailUrl?: string;   // Visual asset
}
```

---

## 🚀 Quick Start & Installation

### 1. Clone & Install
```bash
git clone https://github.com/vidyaSagarMehar/house-of-edtech.git
cd house-of-edtech
npm install
```

### 2. Environment Variables (.env.local)
```env
JWT_SECRET=your_secret_key
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🛡️ Security & Performance
*   **JWT HTTP-Only Cookies:** Mitigates XSS attacks.
*   **RBAC Middleware:** Protects admin/mentor routes.
*   **Batch Embeddings:** Optimized OpenAI API usage during ingestion.
*   **Semantic Query Rewriting:** Enhances retrieval accuracy by contextualizing queries with chat history.

---

## 🛣️ Future Roadmap
1.  **Multilingual Ingestion:** Translating transcripts into English for universal search.
2.  **Adaptive Learning:** Adjusting AI vocabulary based on student level.
3.  **Reranking Layer:** Implementing Cohere rerankers for ultra-precise retrieval.
4.  **Audio Search:** Whisper integration for voice-based doubts.

---

Created by **Vidya Sagar Mehar**
[GitHub](https://github.com/vidyaSagarMehar/) | [LinkedIn](https://www.linkedin.com/in/vidyasagarmehar/)
