"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { GlobalSearch } from "./global-search";

interface TopbarProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  onMenuClick: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center gap-3 pl-4 pr-2 sm:pl-5 lg:pl-8">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="-ml-1 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        {/* ✅ Global search */}
        <GlobalSearch />

        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="ml-auto flex items-center">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}