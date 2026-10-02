"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/config/nav.config";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { LedrixMark } from "@/components/branding/logo";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-300">
      {/* ─── Brand ──────────────────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-5">
        <Link
          href={ROUTES.dashboard}
          className="group flex items-center gap-2.5"
        >
          <LedrixMark
            size="size-9"
            bg="bg-gradient-to-br from-white to-zinc-200"
            color="text-zinc-950"
            className="shadow-lg transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            Ledrix
          </span>
        </Link>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* ─── Nav sections ────────────────────────────────── */}
      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== ROUTES.dashboard &&
                    pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-emerald-400" />
                      )}
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive
                            ? "text-emerald-400"
                            : "text-zinc-500 group-hover:text-white"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ─── Footer ──────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 text-[10px] font-bold text-white">
            v1
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              Ledrix v0.1.0
            </p>
            <p className="truncate text-[10px] text-zinc-500">
              Workforce Ledger
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}