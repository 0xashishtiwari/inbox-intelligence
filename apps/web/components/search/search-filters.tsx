import { CalendarDays, Tag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SearchFilters() {
  return (
    <div className="flex items-center gap-2 py-4">
      <span className="text-xs text-muted-foreground">
        Filters
      </span>

      <Button variant="outline" size="sm" className="h-8 gap-2">
        <CalendarDays className="size-3.5" />
        Date
      </Button>

      <Button variant="outline" size="sm" className="h-8 gap-2">
        <User className="size-3.5" />
        Sender
      </Button>

      <Button variant="outline" size="sm" className="h-8 gap-2">
        <Tag className="size-3.5" />
        Labels
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <span className="text-xs text-muted-foreground">
        Hybrid search
      </span>
    </div>
  );
}