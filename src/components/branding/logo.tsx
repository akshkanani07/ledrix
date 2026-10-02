import { cn } from "@/lib/utils";

interface LedrixLogoProps {
  className?: string;
  variant?: "default" | "monochrome" | "inverted";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const SIZES = {
  xs: { icon: "size-6", text: "text-sm", gap: "gap-1.5" },
  sm: { icon: "size-8", text: "text-base", gap: "gap-2" },
  md: { icon: "size-9", text: "text-lg", gap: "gap-2.5" },
  lg: { icon: "size-10", text: "text-xl", gap: "gap-2.5" },
  xl: { icon: "size-14", text: "text-2xl", gap: "gap-3" },
} as const;

export function LedrixLogo({
  className,
  variant = "default",
  size = "md",
  showText = true,
}: LedrixLogoProps) {
  const s = SIZES[size];

  const iconBg =
    variant === "monochrome"
      ? "bg-zinc-900"
      : variant === "inverted"
      ? "bg-white"
      : "bg-zinc-950";

  const iconColor =
    variant === "monochrome"
      ? "text-white"
      : variant === "inverted"
      ? "text-zinc-950"
      : "text-white";

  const textColor =
    variant === "inverted" ? "text-white" : "text-foreground";

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <LedrixMark size={s.icon} bg={iconBg} color={iconColor} />
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            s.text,
            textColor
          )}
        >
          Ledrix
        </span>
      )}
    </div>
  );
}

interface LedrixMarkProps {
  size?: string;
  bg?: string;
  color?: string;
  className?: string;
}

/**
 * Ledrix brand mark.
 * Stylized "L" with 3 ledger lines (representing records).
 */
export function LedrixMark({
  size = "size-9",
  bg = "bg-zinc-950",
  color = "text-white",
  className,
}: LedrixMarkProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-lg shadow-sm",
        bg,
        size,
        className
      )}
      aria-hidden="true"
    >
      {/* Stylized L + ledger lines */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn("size-[60%]", color)}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vertical stroke of L */}
        <path
          d="M7 5V17C7 17.5523 7.44772 18 8 18H13"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ledger lines */}
        <path
          d="M13 5H17"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M13 9H15.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M13 13H17"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Emerald accent dot */}
      <div className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-500 ring-2 ring-background" />
    </div>
  );
}

/**
 * Wordmark only (no icon).
 */
export function LedrixWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-semibold tracking-tight text-foreground",
        className
      )}
    >
      Ledrix
    </span>
  );
}