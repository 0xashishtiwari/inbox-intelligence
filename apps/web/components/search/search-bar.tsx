"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search your email..."
          className="h-11 bg-card pl-10"
        />
      </div>

      <Button variant="outline" size="icon" className="size-11">
        <SlidersHorizontal className="size-4" />
      </Button>
    </div>
  );
}