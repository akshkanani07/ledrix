import PDFDocument from "pdfkit";
import type { WorkerLedgerReport } from "../types/report.types";

/**
 * Ledrix — PDF Generator.
 */

export async function generateWorkerLedgerPDF(
  report: WorkerLedgerReport
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("PDF generation timeout after 30s"));
    }, 30000);

    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Ledger — ${report.worker.name}`,
          Author: report.workspace.name,
          Subject: "Worker Ledger Report",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => {
        clearTimeout(timeout);
        try {
          const range = doc.bufferedPageRange();
          for (let i = 0; i < range.count; i++) {
            doc.switchToPage(range.start + i);
            doc
              .fontSize(7)
              .font("Helvetica")
              .fillColor("#a1a1aa")
              .text(
                `Page ${i + 1} of ${range.count} · Powered by Ledrix`,
                doc.page.margins.left,
                doc.page.height - 25,
                {
                  width:
                    doc.page.width -
                    doc.page.margins.left -
                    doc.page.margins.right,
                  align: "center",
                  lineBreak: false,
                }
              );
          }
        } catch (e) {
          console.warn("[PDF] Footer add failed:", e);
        }
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      const pageWidth = right - left;
      const currency = report.workspace.currency === "INR" ? "Rs." : "$";

      function formatMoney(v: number | string): string {
        const n = typeof v === "string" ? Number(v) : v;
        const sign = n < 0 ? "-" : "";
        return `${sign}${currency} ${Math.abs(n).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      function formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      // ─── Header ────────────────────────────────────────
      doc
        .fillColor("#18181b")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(report.workspace.name, left, 40);

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#71717a")
        .text("Ledrix — Smart Workforce Ledger", left, 66);

      doc
        .fontSize(8)
        .fillColor("#71717a")
        .text(
          `Generated: ${formatDate(report.generatedAt)}`,
          left,
          66,
          { align: "right", width: pageWidth }
        );

      doc
        .moveTo(left, 86)
        .lineTo(right, 86)
        .strokeColor("#e4e4e7")
        .lineWidth(0.5)
        .stroke();

      // ─── Worker info ───────────────────────────────────
      let y = 100;

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#18181b")
        .text(report.worker.name, left, y);

      y += 20;

      doc.fontSize(9).font("Helvetica").fillColor("#52525b");
      if (report.worker.mobile) {
        doc.text(`Mobile: ${report.worker.mobile}`, left, y);
        y += 12;
      }
      if (report.worker.address) {
        const addressLines = report.worker.address.split("\n").slice(0, 2);
        doc.text(`Address: ${addressLines.join(", ")}`, left, y, {
          width: pageWidth,
        });
        y += 12 * addressLines.length;
      }
      y += 8;

      // ─── Summary box ───────────────────────────────────
      const summaryY = y;
      const boxHeight = 52;
      doc
        .rect(left, summaryY, pageWidth, boxHeight)
        .fillAndStroke("#f4f4f5", "#e4e4e7");

      const boxPad = 12;
      const colWidth = (pageWidth - boxPad * 2) / 4;

      const summaryItems = [
        {
          label: "OPENING",
          value: formatMoney(report.worker.openingBalance),
          color: "#18181b",
        },
        {
          label: "TOTAL CREDIT",
          value: formatMoney(report.totals.credit),
          color: "#059669",
        },
        {
          label: "TOTAL DEBIT",
          value: formatMoney(report.totals.debit),
          color: "#2563eb",
        },
        {
          label: "FINAL BALANCE",
          value: formatMoney(report.totals.finalBalance),
          color: "#059669",
        },
      ];

      summaryItems.forEach((item, i) => {
        const x = left + boxPad + i * colWidth;
        doc
          .fontSize(7)
          .font("Helvetica")
          .fillColor("#71717a")
          .text(item.label, x, summaryY + 12, { width: colWidth - 4 });

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(item.color)
          .text(item.value, x, summaryY + 27, { width: colWidth - 4 });
      });

      y = summaryY + boxHeight + 16;

      // ─── Table setup ───────────────────────────────────
      const colWidths = {
        date: 70,
        type: 60,
        details: 200,
        credit: 75,
        debit: 75,
        balance: 80,
      };
      const totalColWidth =
        colWidths.date +
        colWidths.type +
        colWidths.details +
        colWidths.credit +
        colWidths.debit +
        colWidths.balance;

      const scale = pageWidth / totalColWidth;
      const w = {
        date: colWidths.date * scale,
        type: colWidths.type * scale,
        details: colWidths.details * scale,
        credit: colWidths.credit * scale,
        debit: colWidths.debit * scale,
        balance: colWidths.balance * scale,
      };

      const colX = {
        date: left,
        type: left + w.date,
        details: left + w.date + w.type,
        credit: left + w.date + w.type + w.details,
        debit: left + w.date + w.type + w.details + w.credit,
        balance:
          left + w.date + w.type + w.details + w.credit + w.debit,
      };

      // ─── Table header ──────────────────────────────────
      const headerH = 22;
      doc
        .rect(left, y, pageWidth, headerH)
        .fillAndStroke("#18181b", "#18181b");

      doc
        .fontSize(7.5)
        .font("Helvetica-Bold")
        .fillColor("#ffffff");

      const headerY = y + 7;
      doc.text("DATE", colX.date + 6, headerY, { width: w.date - 8 });
      doc.text("TYPE", colX.type + 6, headerY, { width: w.type - 8 });
      doc.text("DETAILS", colX.details + 6, headerY, {
        width: w.details - 8,
      });
      doc.text("CREDIT", colX.credit, headerY, {
        width: w.credit - 6,
        align: "right",
      });
      doc.text("DEBIT", colX.debit, headerY, {
        width: w.debit - 6,
        align: "right",
      });
      doc.text("BALANCE", colX.balance, headerY, {
        width: w.balance - 6,
        align: "right",
      });

      y += headerH;

      // ─── Row renderer ──────────────────────────────────
      function drawRow(
        cells: {
          date: string;
          type: string;
          details: string;
          credit: string;
          debit: string;
          balance: string;
        },
        opts: { isBold?: boolean; bgColor?: string; textColor?: string } = {}
      ) {
        const rowH = 20;

        if (opts.bgColor) {
          doc.rect(left, y, pageWidth, rowH).fill(opts.bgColor);
        }

        const textColor = opts.textColor ?? "#18181b";
        const fontName = opts.isBold ? "Helvetica-Bold" : "Helvetica";
        const textY = y + 6;

        doc.fontSize(8).font(fontName).fillColor(textColor);

        doc.text(cells.date, colX.date + 6, textY, { width: w.date - 8 });
        doc.text(cells.type, colX.type + 6, textY, { width: w.type - 8 });
        doc.text(cells.details, colX.details + 6, textY, {
          width: w.details - 8,
          ellipsis: true,
        });

        doc
          .fillColor(cells.credit === "—" ? "#a1a1aa" : "#059669")
          .font(fontName)
          .text(cells.credit, colX.credit, textY, {
            width: w.credit - 6,
            align: "right",
          });

        doc
          .fillColor(cells.debit === "—" ? "#a1a1aa" : "#2563eb")
          .font(fontName)
          .text(cells.debit, colX.debit, textY, {
            width: w.debit - 6,
            align: "right",
          });

        doc
          .fillColor(textColor)
          .font("Helvetica-Bold")
          .text(cells.balance, colX.balance, textY, {
            width: w.balance - 6,
            align: "right",
          });

        doc
          .moveTo(left, y + rowH)
          .lineTo(right, y + rowH)
          .strokeColor("#f4f4f5")
          .lineWidth(0.5)
          .stroke();

        y += rowH;
      }

      // ─── Opening row ───────────────────────────────────
      drawRow(
        {
          date: formatDate(report.period.from),
          type: "Opening",
          details: "Opening balance",
          credit: "—",
          debit: "—",
          balance: formatMoney(report.worker.openingBalance),
        },
        { bgColor: "#fafafa", textColor: "#52525b" }
      );

      // ─── Data rows ─────────────────────────────────────
      for (const entry of report.entries) {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }

        const typeLabel =
          entry.type.charAt(0) + entry.type.slice(1).toLowerCase();
        const credit =
          Number(entry.credit) > 0 ? formatMoney(entry.credit) : "—";
        const debit =
          Number(entry.debit) > 0 ? formatMoney(entry.debit) : "—";

        drawRow({
          date: formatDate(entry.date),
          type: typeLabel,
          details: entry.workName ?? entry.reason,
          credit,
          debit,
          balance: formatMoney(entry.balance),
        });
      }

      // ─── Totals row ────────────────────────────────────
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }

      doc
        .moveTo(left, y)
        .lineTo(right, y)
        .strokeColor("#18181b")
        .lineWidth(1.2)
        .stroke();

      y += 4;

      drawRow(
        {
          date: "",
          type: "",
          details: "TOTALS",
          credit: formatMoney(report.totals.credit),
          debit: formatMoney(report.totals.debit),
          balance: formatMoney(report.totals.finalBalance),
        },
        { isBold: true, bgColor: "#f4f4f5", textColor: "#18181b" }
      );

      // ✅ End document (triggers "end" event)
      doc.end();
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}