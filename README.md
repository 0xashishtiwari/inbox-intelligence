# Inbox Intelligence

Inbox Intelligence is an AI-powered system that helps you search and understand your Gmail inbox using natural language.

The project connects to Gmail, syncs emails, stores and indexes them, and uses search and AI techniques to answer questions based on your emails.

## Tech Stack

* Next.js
* TypeScript
* Node.js
* Express
* PostgreSQL
* Drizzle ORM
* Redis
* BullMQ
* pgvector
* Gmail API
* Google OAuth
* LLMs and embeddings

## Project Structure

```text
inbox-intelligence/
├── apps/
│   ├── web/          # Frontend
│   └── api/          # Backend API
│
├── workers/
│   ├── ingestion/    # Gmail data ingestion
│   ├── sync/         # Incremental email synchronization
│   └── ai/           # AI and embedding processing
│
├── packages/
│   ├── db/           # Database and Drizzle
│   ├── config/       # Shared configuration
│   ├── validation/   # Validation schemas
│   ├── retrieval/    # Search and retrieval
│   ├── embeddings/   # Embedding logic
│   ├── llm/          # LLM integrations
│   ├── gmail/        # Gmail integration
│   ├── queue/        # Background jobs
│   ├── shared/       # Shared code
│   └── evaluation/   # Evaluation tools
│
├── tests/
├── infra/
└── docs/
```

## How It Works

The basic flow is:

```text
Gmail
  ↓
Sync
  ↓
PostgreSQL
  ↓
Search / Retrieval
  ↓
AI
  ↓
Answer with email references
```

The system will support both traditional keyword search and semantic search. These results will be combined to retrieve the most relevant emails before generating an answer.

## Running Locally

Install dependencies:

```bash
pnpm install
```

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

Start the development environment:

```bash
pnpm dev
```

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=postgresql://inbox:inbox@localhost:5432/inbox_intelligence
REDIS_URL=redis://localhost:6379
```

Additional environment variables will be added as Gmail OAuth and AI integrations are implemented.

## Database

The project uses PostgreSQL with Drizzle ORM.

Generate migrations:

```bash
pnpm --filter db exec drizzle-kit generate
```

Apply migrations:

```bash
pnpm --filter db exec drizzle-kit migrate
```

## Current Status

The project is currently under development.

Completed:

* Turborepo setup
* pnpm workspace setup
* Next.js application
* Express API
* PostgreSQL setup
* Redis setup
* Drizzle ORM setup

Next:

* Google OAuth
* Gmail integration
* Database schema
* Email synchronization
* Search and retrieval
* Embeddings
* RAG pipeline
* Frontend integration

## Goal

The goal of Inbox Intelligence is to build a practical and scalable system for searching and interacting with email data, while exploring backend architecture, asynchronous processing, information retrieval, and RAG.
