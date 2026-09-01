"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topBar";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResult } from "@/components/search/search-result";

const results = [
  {
    messageId: "message-182",
    threadId: "thread-41",
    subject: "Technical Interview",
    sender: "recruiter@company.com",
    timestamp: "Sep 12, 2026",
    snippet:
      "Your technical interview has been scheduled for September 18 at 11:00 AM. Please confirm that the time works for you.",
    score: 0.91,
  },
  {
    messageId: "message-196",
    threadId: "thread-44",
    subject: "Interview Process",
    sender: "recruiter@company.com",
    timestamp: "Sep 08, 2026",
    snippet:
      "We'd like to move forward with the technical round. The next step will be a discussion with the engineering team.",
    score: 0.87,
  },
  {
    messageId: "message-201",
    threadId: "thread-47",
    subject: "Re: Technical Interview",
    sender: "hr@company.com",
    timestamp: "Sep 05, 2026",
    snippet:
      "Following up regarding the interview process and the availability you shared earlier.",
    score: 0.82,
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("recruiter interview");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <SearchIcon className="size-5 text-muted-foreground" />

                <h1 className="text-2xl font-semibold tracking-tight">
                  Search
                </h1>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                Search across your email history using lexical and
                semantic retrieval.
              </p>
            </div>

            {/* Search */}
            <SearchBar
              value={query}
              onChange={setQuery}
            />

            <SearchFilters />

            {/* Results header */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {results.length} results
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Ranked using hybrid retrieval
                </p>
              </div>

              <div className="font-mono text-xs text-muted-foreground">
                hybrid · 83ms
              </div>
            </div>

            {/* Results */}
            <div className="overflow-hidden rounded-xl border bg-card">
              {results.map((result) => (
                <SearchResult
                  key={result.messageId}
                  {...result}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}