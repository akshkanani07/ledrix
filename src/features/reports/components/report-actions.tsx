"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { getWhatsAppShareURL } from "../actions/report.actions";

interface ReportActionsProps {
  workerId: string;
  workerName: string;
  workerMobile: string | null;
}

export function ReportActions({
  workerId,
  workerName,
}: ReportActionsProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);

  function handleDownloadPDF() {
    setDownloadingPdf(true);

    // ✅ Create hidden iframe for silent download
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `/api/reports/worker-ledger/${workerId}/pdf`;
    document.body.appendChild(iframe);

    toast.success("Downloading PDF…");

    // Cleanup after 60 sec
    setTimeout(() => {
      document.body.removeChild(iframe);
      setDownloadingPdf(false);
    }, 60000);

    // Reset button after 5 sec
    setTimeout(() => setDownloadingPdf(false), 5000);
  }

  function handleDownloadExcel() {
    setDownloadingExcel(true);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `/api/reports/worker-ledger/${workerId}/excel`;
    document.body.appendChild(iframe);

    toast.success("Downloading Excel…");

    setTimeout(() => {
      document.body.removeChild(iframe);
      setDownloadingExcel(false);
    }, 60000);

    setTimeout(() => setDownloadingExcel(false), 5000);
  }

  async function handleWhatsApp() {
    setLoadingWhatsapp(true);
    try {
      const result = await getWhatsAppShareURL(workerId);
      if (!result.success || !result.url) {
        toast.error(result.message ?? "Failed to generate share link");
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to open WhatsApp");
    } finally {
      setLoadingWhatsapp(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleDownloadPDF}
        disabled={downloadingPdf || downloadingExcel || loadingWhatsapp}
      >
        {downloadingPdf ? (
          <Loader2 className="mr-1.5 size-4 animate-spin" />
        ) : (
          <FileDown className="mr-1.5 size-4" />
        )}
        PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleDownloadExcel}
        disabled={downloadingPdf || downloadingExcel || loadingWhatsapp}
      >
        {downloadingExcel ? (
          <Loader2 className="mr-1.5 size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="mr-1.5 size-4" />
        )}
        Excel
      </Button>

      <Button
        size="sm"
        className="h-9 bg-emerald-600 text-white hover:bg-emerald-700"
        onClick={handleWhatsApp}
        disabled={downloadingPdf || downloadingExcel || loadingWhatsapp}
      >
        {loadingWhatsapp ? (
          <Loader2 className="mr-1.5 size-4 animate-spin" />
        ) : (
          <Share2 className="mr-1.5 size-4" />
        )}
        WhatsApp
      </Button>
    </div>
  );
}