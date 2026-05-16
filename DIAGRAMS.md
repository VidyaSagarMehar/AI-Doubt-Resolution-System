# System Architecture Diagrams

This document contains the visual representations of the High-Level Design (HLD) and Low-Level Design (LLD) of the House of EdTech RAG Platform.

## 1. High-Level Design (HLD)

This diagram outlines the macro-level architecture of the platform, detailing how the primary actors interact with the core systems and external integrations.

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

---

## 2. Low-Level Design (LLD) - RAG Retrieval Pipeline

This sequence diagram explains the exact chronological flow of how a student's doubt is processed, contextualized, and resolved using the RAG pipeline.

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

---

## 3. Low-Level Design (LLD) - Auto-Ingestion Pipeline

This flow illustrates the automated process of converting a raw YouTube lecture into highly optimized, timestamp-aware vector points.

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

## 4. Entity Relationship Diagram (ERD) - Database Schema

This diagram shows the relationship between the core collections in MongoDB and how they map to the Vector Database.

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

## 5. Security & Authentication Flow

This diagram outlines how the Edge Middleware protects the backend API routes and how JWT HTTP-Only cookies are processed.

```mermaid
flowchart LR
    User["Client Browser"] --> AuthAPI["/api/auth/login"]
    AuthAPI --> DB[("MongoDB")]
    AuthAPI --> User
    
    User --> EdgeMiddleware["Next.js Edge Middleware"]
    
    EdgeMiddleware --> Error401["401 Unauthorized"]
    EdgeMiddleware --> Route1["/api/doubts"]
    EdgeMiddleware --> Route2["/api/admin/ingest"]
    
    Route1 --> Success1["Process RAG"]
    Route2 --> Success2["Process Ingestion"]
```
