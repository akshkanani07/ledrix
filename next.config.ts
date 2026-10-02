import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "exceljs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // ✅ Silence Turbopack webpack-config warning
  turbopack: {},
};

export default withPWA(nextConfig);