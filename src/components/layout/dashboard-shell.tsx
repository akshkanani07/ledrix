"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface DashboardShellProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden animate-in slide-in-from-left duration-200">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar user={user} onMenuClick={() => setMobileOpen(true)} />
                <main className="min-w-0 flex-1">
          <div className="w-full p-4 sm:p-5 lg:px-6 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}