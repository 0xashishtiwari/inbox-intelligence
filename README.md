# Inbox Intelligence

Inbox Intelligence is an AI-powered email intelligence system that helps users search, retrieve, and understand their Gmail inbox using traditional search, semantic retrieval, and AI.

The project connects to Gmail through Google OAuth, ingests and normalizes email data, stores it in PostgreSQL, and processes long-running operations asynchronously using Redis and BullMQ.

The long-term goal is to build a complete retrieval-augmented generation (RAG) system capable of answering natural-language questions about a user's email while providing references to the source emails.

---

## Tech Stack

- Next.js
- TypeScript
- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- Redis
- BullMQ
- pgvector
- Gmail API
- Google OAuth
- LLMs
- Embeddings
- Turborepo
- pnpm

---

## Architecture

Inbox Intelligence follows a monorepo architecture using Turborepo and pnpm workspaces.

```text
inbox-intelligence/

├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # Express backend API
│
├── workers/
│   ├── ingestion/            # Gmail ingestion worker
│   ├── sync/                 # Incremental synchronization worker
│   └── ai/                   # AI and embedding worker
│
├── packages/
│   ├── db/                   # PostgreSQL + Drizzle ORM
│   ├── config/               # Shared configuration
│   ├── validation/           # Validation schemas
│   ├── retrieval/            # Search and retrieval logic
│   ├── embeddings/           # Embedding generation
│   ├── llm/                  # LLM integrations
│   ├── gmail/                # Gmail API integration
│   ├── queue/                # BullMQ queues and Redis connection
│   ├── shared/               # Shared utilities and types
│   └── evaluation/           # Retrieval and RAG evaluation
│
├── tests/
├── infra/
├── docs/
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
````

---

## System Flow

The current ingestion and search architecture works like this:

```text
                    Google Gmail
                         │
                         ▼
                  Gmail API
                         │
                         ▼
                  Ingestion API
                         │
                         ▼
                  Redis / BullMQ
                         │
                         ▼
              Ingestion Worker
                         │
                         ▼
                  PostgreSQL
                         │
                         ▼
                 Lexical Search
```

The planned retrieval architecture extends this flow:

```text
                         PostgreSQL
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Lexical Search      Semantic Search
                    │                   │
                    │                pgvector
                    │                   │
                    └─────────┬─────────┘
                              ▼
                       Hybrid Retrieval
                              │
                              ▼
                         Reranking
                              │
                              ▼
                            RAG
                              │
                              ▼
                       LLM Generated Answer
                              │
                              ▼
                     Email References
```

---

# Background Processing

Long-running operations are handled asynchronously using Redis and BullMQ.

The API does not perform Gmail ingestion directly.

Instead:

```text
HTTP Request
     │
     ▼
Sync Controller
     │
     ▼
BullMQ Queue
     │
     ▼
Redis
     │
     ▼
Ingestion Worker
     │
     ▼
Gmail API
     │
     ▼
PostgreSQL
```

This keeps the API responsive and allows ingestion jobs to run independently from HTTP requests.

The ingestion worker supports:

* Background Gmail ingestion
* Job processing
* Job progress updates
* Job completion handling
* Job failure handling
* Retry configuration
* Concurrent worker configuration

---

# Mailbox Synchronization

Mailbox synchronization is exposed through:

```http
POST /mailboxes/:id/sync
```

The endpoint:

1. Authenticates the user.
2. Verifies that the requested mailbox belongs to the authenticated user.
3. Creates a BullMQ ingestion job.
4. Returns immediately with a job ID.
5. Lets the ingestion worker perform the actual Gmail synchronization.

Example response:

```json
{
  "message": "Mailbox sync queued successfully",
  "jobId": "123",
  "mailboxId": "..."
}
```

The API returns:

```text
202 Accepted
```

for successfully queued synchronization jobs.

Mailbox ownership is verified before the job is created, preventing an authenticated user from synchronizing another user's mailbox.

---

# Gmail Ingestion

The ingestion service currently:

* Retrieves the mailbox from PostgreSQL.
* Retrieves the associated OAuth account.
* Decrypts OAuth credentials.
* Creates a Gmail API client.
* Fetches Gmail message IDs in batches.
* Checks which messages already exist.
* Downloads new messages.
* Normalizes Gmail message data.
* Creates or finds email threads.
* Inserts new messages.
* Updates existing messages.
* Stores normalized email data in PostgreSQL.

The ingestion process is designed to be idempotent so that existing messages are not unnecessarily duplicated.

---

# Database

Inbox Intelligence uses PostgreSQL with Drizzle ORM.

The current data model includes entities such as:

```text
User
 │
 └── Mailbox
       │
       ├── OAuth Account
       │
       ├── Threads
       │     │
       │     └── Messages
       │
       └── Sync State
```

Messages are associated with both a mailbox and a thread.

Message uniqueness is enforced using the mailbox and provider message ID:

```text
(mailbox_id, provider_message_id)
```

This allows ingestion to safely perform insert-or-update operations.

---

# Search

## Lexical Search

Lexical search is currently implemented.

It provides traditional keyword-based retrieval over indexed email content.

The current search architecture is:

```text
Search Query
     │
     ▼
Express API
     │
     ▼
PostgreSQL
     │
     ▼
Lexical Search
     │
     ▼
Relevant Messages
```

---

## Semantic Search

Semantic search is the next major retrieval feature.

The planned pipeline is:

```text
Email
  │
  ▼
Chunking
  │
  ▼
Embedding Generation
  │
  ▼
pgvector
  │
  ▼
Vector Similarity Search
```

This will allow users to search by meaning rather than exact keywords.

For example:

```text
"emails about my interview schedule"
```

could retrieve emails containing concepts related to interviews even when the exact words are different.

---

# Hybrid Retrieval

After semantic search is implemented, lexical and semantic results will be combined.

```text
                 Search Query
                      │
             ┌────────┴────────┐
             ▼                 ▼
      Lexical Search    Semantic Search
             │                 │
             └────────┬────────┘
                      ▼
               Hybrid Ranking
                      │
                      ▼
                Top Results
```

The goal is to combine the strengths of both approaches:

* Lexical search for exact terms, names, IDs, and phrases.
* Semantic search for concepts and natural-language queries.

---

# RAG Pipeline

The final system will use Retrieval-Augmented Generation (RAG).

The planned flow is:

```text
User Question
      │
      ▼
Query Processing
      │
      ▼
Hybrid Retrieval
      │
      ▼
Reranking
      │
      ▼
Relevant Email Chunks
      │
      ▼
LLM
      │
      ▼
Answer
      │
      ▼
Email References
```

The generated answer should be grounded in retrieved email data rather than relying solely on the model's internal knowledge.

---

# Security

Security is an important part of the architecture.

Mailbox operations are scoped to the authenticated user.

For example:

```text
User A
  │
  ├── Mailbox A → allowed
  │
  └── Mailbox B owned by User B → rejected
```

The sync API verifies:

```text
mailbox.userId === authenticatedUser.userId
```

before creating an ingestion job.

OAuth credentials are stored securely and encrypted before persistence.

---

# Running Locally

## Prerequisites

Make sure you have:

* Node.js >= 24
* pnpm
* PostgreSQL
* Redis
* Google OAuth credentials

---

## Install Dependencies

```bash
pnpm install
```

---

## Start Infrastructure

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

Verify that Redis is available on:

```text
localhost:6379
```

---

## Environment Variables

Create the required environment configuration.

Example:

```env
DATABASE_URL=postgresql://inbox:inbox@localhost:5432/inbox_intelligence

REDIS_HOST=localhost
REDIS_PORT=6379
```

Additional variables are required for Gmail OAuth and AI integrations.

---

## Database Migrations

Generate migrations:

```bash
pnpm --filter @repo/db exec drizzle-kit generate
```

Apply migrations:

```bash
pnpm --filter @repo/db exec drizzle-kit migrate
```

---

## Start Development

Start the complete development environment:

```bash
pnpm dev
```

Turborepo starts the applications and workers that define a `dev` script.

The current development environment includes:

```text
Next.js
Express API
Ingestion Worker
Redis
PostgreSQL
```

---

# Project Status

The project is actively under development.

## Completed

* [x] Turborepo monorepo setup
* [x] pnpm workspace setup
* [x] Next.js application
* [x] Express API
* [x] PostgreSQL setup
* [x] Drizzle ORM setup
* [x] Redis setup
* [x] Database schema
* [x] Gmail API integration
* [x] Google OAuth integration
* [x] Gmail message ingestion
* [x] Email normalization
* [x] Thread creation
* [x] Message upsert
* [x] Redis + BullMQ integration
* [x] Background ingestion worker
* [x] Mailbox sync API
* [x] Mailbox ownership authorization
* [x] Lexical search

## In Progress / Next

* [ ] Incremental Gmail synchronization
* [ ] Chunking pipeline
* [ ] Embedding generation
* [ ] pgvector integration
* [ ] Semantic search
* [ ] Hybrid retrieval
* [ ] Reranking
* [ ] RAG pipeline
* [ ] LLM integration
* [ ] Source citations
* [ ] Frontend search interface
* [ ] Evaluation and retrieval benchmarks
* [ ] Production deployment

---

# Why This Project?

Inbox Intelligence is designed as more than a simple Gmail API wrapper or chatbot.

The project explores real-world backend and AI system design concepts including:

* OAuth authentication
* Authorization and multi-user data isolation
* API design
* PostgreSQL data modeling
* Drizzle ORM
* Gmail API integration
* Asynchronous job processing
* Redis
* BullMQ
* Idempotent ingestion
* Full-text search
* Vector search
* Embeddings
* Hybrid information retrieval
* Reranking
* Retrieval-Augmented Generation
* LLM integration
* Evaluation of retrieval quality

The project is intended to demonstrate how a production-oriented AI application can combine conventional backend engineering with modern retrieval and LLM techniques.

---

# Development Philosophy

The system is being built incrementally.

The current priority is to establish reliable data ingestion and retrieval before adding generative AI.

```text
Reliable Data
     ↓
Reliable Search
     ↓
Semantic Retrieval
     ↓
Hybrid Retrieval
     ↓
Reranking
     ↓
RAG
     ↓
AI Assistant
```

This approach makes each layer independently testable and keeps the final AI system grounded in a reliable retrieval pipeline.

---

## License

This project is currently under development.

```
