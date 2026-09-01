"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Bot,
  Inbox,
  Search,
  Settings,
  Star,
  RefreshCw,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  {
    label: "Overview",
    href: "/",
    icon: Inbox,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "AI Chat",
    href: "/chat",
    icon: Bot,
  },
];

const mail = [
  {
    label: "Inbox",
    icon: Inbox,
  },
  {
    label: "Starred",
    icon: Star,
  },
  {
    label: "Archive",
    icon: Archive,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Mail className="size-4" />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight">
              Inbox Intelligence
            </p>

            <p className="text-[11px] text-muted-foreground">
              Email reasoning system
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <div className="p-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <Link href={item.href}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mail */}
      <div className="px-3 pt-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mail
        </p>

        <div className="space-y-1">
          {mail.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <Icon className="size-4" />
                {item.label}

                {item.label === "Inbox" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    24
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* System */}
      <div className="px-3 pt-6">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          System
        </p>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
        >
          <RefreshCw className="size-4" />
          Sync Status
        </Button>

        <Button
          variant="ghost"
          className="mt-1 w-full justify-start gap-3"
        >
          <Settings className="size-4" />
          Settings
        </Button>
      </div>

      {/* Account */}
      <div className="mt-auto p-3">
        <Separator className="mb-3" />

        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="relative">
            <Avatar className="size-8">
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>

            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              Gmail connected
            </p>

            <p className="truncate text-[11px] text-muted-foreground">
              Ready to search
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}