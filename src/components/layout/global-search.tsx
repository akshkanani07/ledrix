"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Receipt, Loader2, ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WorkerResult {
  id: string;
  name: string;
  mobile: string | null;
  photo: string | null;
  type: "worker";
}

interface TransactionResult {
  id: string;
  workerName: string;
  workerId: string;
  reason: string;
  workName: string | null;
  type: "transaction";
}

interface SearchResults {
  workers: WorkerResult[];
  transactions: TransactionResult[];
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    workers: [],
    transactions: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  // ✅ Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ workers: [], transactions: [] });
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // ✅ Click outside closes dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasResults =
    results.workers.length > 0 || results.transactions.length > 0;
  const showDropdown = open && query.length >= 2;

  function handleSelect(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <div ref={containerRef} className="relative hidden max-w-md flex-1 md:flex">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        ref={inputRef}
        type="search"
        placeholder="Search workers, transactions... (⌘K)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="h-9 border-transparent bg-muted/50 pl-9 pr-16 focus-visible:border-border focus-visible:bg-background"
      />

      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:flex">
        <span className="text-xs">⌘</span>K
      </kbd>

      {/* ─── Dropdown results ───────────────────────── */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border bg-popover shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-150">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching...
            </div>
          )}

          {!loading && !hasResults && (
            <div className="p-6 text-center">
              <p className="text-sm font-medium">No results found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching for a worker name or transaction reason
              </p>
            </div>
          )}

          {!loading && hasResults && (
            <div className="py-1.5">
              {results.workers.length > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Workers
                  </p>
                  {results.workers.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() =>
                        handleSelect(`/dashboard/workers/${w.id}`)
                      }
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                        {w.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {w.name}
                        </p>
                        {w.mobile && (
                          <p className="truncate text-xs text-muted-foreground">
                            {w.mobile}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/40" />
                    </button>
                  ))}
                </>
              )}

              {results.transactions.length > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Transactions
                  </p>
                  {results.transactions.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        handleSelect(`/dashboard/workers/${t.workerId}`)
                      }
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Receipt className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {t.workName ?? t.reason}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {t.workerName}
                        </p>
                      </div>
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/40" />
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}