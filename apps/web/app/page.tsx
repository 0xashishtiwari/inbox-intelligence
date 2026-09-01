import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clock3,
  FileText,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const suggestions = [
  {
    title: "Interview",
    description: "Find interview discussions and dates.",
    icon: Clock3,
    query: "What did the recruiter tell me about my interview?",
  },
  {
    title: "Applications",
    description: "Find recent job applications.",
    icon: Briefcase,
    query: "Find all job applications from the last three months.",
  },
  {
    title: "Commitments",
    description: "Find things you promised in email.",
    icon: FileText,
    query: "What commitments did I make in my emails?",
  },
];

const recentSearches = [
  "recruiter interview",
  "job applications",
  "emails from HR",
];

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-8 py-14">
            {/* Hero */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-5 flex size-10 items-center justify-center rounded-xl border bg-muted/40">
                <Sparkles className="size-5" />
              </div>

              <h1 className="text-4xl font-semibold tracking-tight">
                Ask anything about your inbox.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                Search your email history using natural language and get
                answers grounded in the messages that support them.
              </p>

              {/* Main search */}
              <div className="relative mx-auto mt-8 max-w-2xl">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  className="h-14 rounded-xl border-border bg-card pl-12 pr-14 text-sm shadow-sm"
                  placeholder="Ask a question about your email..."
                />

                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 size-10 -translate-y-1/2 rounded-lg"
                >
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Suggestions */}
            <section className="mt-16">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium">
                    Suggested questions
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Start with something you already want to know.
                  </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <Link href="/chat">
                    Open AI Chat
                    <ArrowRight className="ml-2 size-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;

                  return (
                    <button
                      key={suggestion.title}
                      className="group rounded-xl border bg-card p-5 text-left transition-colors hover:bg-muted/40"
                    >
                      <div className="mb-5 flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                        <Icon className="size-4" />
                      </div>

                      <h3 className="text-sm font-medium">
                        {suggestion.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {suggestion.description}
                      </p>

                      <p className="mt-4 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        Ask this question →
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent */}
            <section className="mt-14">
              <div className="mb-4">
                <h2 className="text-sm font-medium">
                  Recent searches
                </h2>
              </div>

              <div className="rounded-xl border bg-card">
                {recentSearches.map((search, index) => (
                  <div key={search}>
                    <Link
                      href={`/search?q=${encodeURIComponent(search)}`}
                      className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                    >
                      <Search className="size-4 text-muted-foreground" />

                      <span className="flex-1 text-sm">
                        {search}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {index === 0
                          ? "2m ago"
                          : index === 1
                            ? "1h ago"
                            : "yesterday"}
                      </span>
                    </Link>

                    {index !== recentSearches.length - 1 && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* System status */}
            <section className="mt-14">
              <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <MessageSquare className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Gmail connected
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Your mailbox is ready for search.
                    </p>
                  </div>

                  <span className="ml-auto text-xs text-emerald-500">
                    Connected
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}