import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SearchResultProps {
  messageId: string;
  threadId: string;
  subject: string;
  sender: string;
  timestamp: string;
  snippet: string;
  score: number;
}

export function SearchResult({
  messageId,
  threadId,
  subject,
  sender,
  timestamp,
  snippet,
  score,
}: SearchResultProps) {
  return (
    <Link
      href={`/threads/${threadId}`}
      className="group block px-5 py-5 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
          <Mail className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium">
                {subject}
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                {sender}
              </p>
            </div>

            <span className="shrink-0 text-xs text-muted-foreground">
              {timestamp}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {snippet}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="font-mono text-[10px]"
            >
              score {score.toFixed(2)}
            </Badge>

            <span className="text-[11px] text-muted-foreground">
              message {messageId}
            </span>

            <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </div>

      <Separator className="mt-5" />
    </Link>
  );
}