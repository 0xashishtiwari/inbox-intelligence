import { Search, Command } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b px-6">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search your email..."
          className="h-9 border-border bg-muted/40 pl-9 pr-16"
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <Command className="size-3" />
          K
        </div>
      </div>

      <div className="ml-auto">
        <Button variant="ghost" size="sm">
          Connected
        </Button>
      </div>
    </header>
  );
}