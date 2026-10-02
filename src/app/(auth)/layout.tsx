import Link from "next/link";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { ROUTES } from "@/config/routes";

/**
 * Ledrix — Auth Layout (Premium).
 *
 * Split-screen: Brand experience (left) + Form (right).
 * Mobile: Brand panel collapses to top bar.
 */

const STATS = [
  { value: "10k+", label: "Workers", icon: TrendingUp },
  { value: "1M+", label: "Ledger entries", icon: Sparkles },
  { value: "99.9%", label: "Uptime SLA", icon: ShieldCheck },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ═══════════════════════════════════════════════════════
          LEFT — Brand panel (hidden on mobile)
          ═══════════════════════════════════════════════════════ */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-zinc-950 text-white p-12">
        {/* Ambient gradient orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-32 size-[420px] rounded-full bg-indigo-500/10 blur-3xl"
        />
        {/* Subtle grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* ─── Brand ───────────────────────────────────────── */}
        <Link
          href={ROUTES.home}
          className="relative z-10 flex items-center gap-2.5 group w-fit"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-white text-zinc-950 font-bold text-lg shadow-lg transition-transform group-hover:scale-105">
            L
          </div>
          <span className="text-xl font-semibold tracking-tight">Ledrix</span>
        </Link>

        {/* ─── Hero copy ──────────────────────────────────── */}
        <div className="relative z-10 space-y-10 max-w-lg">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Trusted by modern factories
            </div>

            <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight">
              Manage your workers&apos; ledger in{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                seconds
              </span>{" "}
              — not hours.
            </h2>

            <p className="text-base text-zinc-400 leading-relaxed max-w-md">
              Ledrix is the smart workforce ledger platform for factories,
              workshops, and labour-based businesses.
            </p>
          </div>

          {/* ─── Stats ────────────────────────────────────── */}
          <dl className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="space-y-1.5">
                <Icon className="size-4 text-emerald-400" aria-hidden />
                <dd className="text-2xl font-semibold tracking-tight">
                  {value}
                </dd>
                <dt className="text-xs text-zinc-500">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* ─── Footer ─────────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Ledrix. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="hover:text-zinc-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="hover:text-zinc-300 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════
          RIGHT — Form panel
          ═══════════════════════════════════════════════════════ */}
      <main className="relative flex flex-col bg-background">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-5 border-b">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-sm">
              L
            </div>
            <span className="text-base font-semibold tracking-tight">
              Ledrix
            </span>
          </Link>
          <Link
            href="#"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Need help?
          </Link>
        </header>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>

        {/* Mobile footer */}
        <footer className="lg:hidden px-6 py-5 text-center text-xs text-muted-foreground border-t">
          © {new Date().getFullYear()} Ledrix
        </footer>
      </main>
    </div>
  );
}