import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

import { LedrixMark } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline",
  description: "You are offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <LedrixMark size="size-14" />

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <WifiOff className="size-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Offline
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          You&apos;re offline
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ledrix works offline for cached pages. Reconnect to sync your
          latest data.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/dashboard">
            <RefreshCw className="mr-1.5 size-4" />
            Try again
          </Link>
        </Button>
      </div>
    </div>
  );
}