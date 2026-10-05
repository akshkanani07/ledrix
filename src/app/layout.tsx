import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "@/components/providers/app-providers";
import { Analytics } from "@vercel/analytics/react"; // ✅ Vercel Analytics import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: {
    default: "Ledrix — Smart Workforce Ledger Platform",
    template: "%s | Ledrix",
  },
  description:
    "Multi-tenant SaaS platform for factories, workshops, and labour-based businesses to manage worker ledgers, payments, advances, and reports.",
  applicationName: "Ledrix",
  authors: [{ name: "Ledrix" }],
  keywords: [
    "Ledrix",
    "Workforce Ledger",
    "Factory SaaS",
    "Karigar Ledger",
    "Labour Management",
  ],

  // ✅ PWA manifest
  manifest: "/manifest.json",

  // ✅ iOS PWA support
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ledrix",
  },

  // ✅ Format detection off (avoid auto-linking numbers)
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // ✅ Icons
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/icons/favicon-32.png",
    other: [
      {
        rel: "mask-icon",
        url: "/icon.svg",
        color: "#10b981",
      },
    ],
  },

  // ✅ Additional meta
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#09090b",
    "msapplication-config": "/browserconfig.xml",
  },
};

// ═══════════════════════════════════════════════════════════
// VIEWPORT
// ═══════════════════════════════════════════════════════════

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// ═══════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* ✅ iOS splash screen links (auto-generated later) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppProviders>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AppProviders>
        {/* ✅ Vercel Analytics — પેજ વ્યૂસ અને વિઝિટર ટ્રેક કરવા */}
        <Analytics />
      </body>
    </html>
  );
}