import ExcelJS from "exceljs";
import type { WorkerLedgerReport } from "../types/report.types";

/**
 * Ledrix — Excel Generator.
 */

export async function generateWorkerLedgerExcel(
  report: WorkerLedgerReport
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Ledrix";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Ledger", {
    properties: { defaultColWidth: 15 },
  });

  const currency = report.workspace.currency === "INR" ? "₹" : "$";

  // ─── Header rows ─────────────────────────────────────
  sheet.mergeCells("A1:F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = report.workspace.name;
  titleCell.font = { size: 16, bold: true, color: { argb: "FF18181B" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 26;

  sheet.mergeCells("A2:F2");
  const subCell = sheet.getCell("A2");
  subCell.value = `Ledger Report — ${report.worker.name}`;
  subCell.font = { size: 11, color: { argb: "FF71717A" } };
  sheet.getRow(2).height = 20;

  sheet.mergeCells("A3:F3");
  const infoCell = sheet.getCell("A3");
  const infoLines = [
    report.worker.mobile ? `Mobile: ${report.worker.mobile}` : "",
    report.worker.address ? `Address: ${report.worker.address}` : "",
    `Generated: ${new Date(report.generatedAt).toLocaleDateString("en-IN")}`,
  ].filter(Boolean);
  infoCell.value = infoLines.join("  ·  ");
  infoCell.font = { size: 9, color: { argb: "FFA1A1AA" } };

  // ─── Table header ────────────────────────────────────
  const headerRow = sheet.getRow(5);
  headerRow.values = [
    "Date",
    "Type",
    "Details",
    "Credit",
    "Debit",
    "Balance",
  ];
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF18181B" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF18181B" } },
    };
  });
  headerRow.height = 22;

  // ─── Opening row ─────────────────────────────────────
  const openRow = sheet.addRow([
    new Date(report.period.from),
    "Opening",
    "Opening balance",
    "",
    "",
    Number(report.worker.openingBalance),
  ]);
  openRow.font = { italic: true, color: { argb: "FF52525B" }, size: 9 };
  openRow.getCell(6).numFmt = `"${currency}"#,##0.00`;

  // ─── Data rows ───────────────────────────────────────
  for (const entry of report.entries) {
    const row = sheet.addRow([
      new Date(entry.date),
      entry.type.charAt(0) + entry.type.slice(1).toLowerCase(),
      entry.workName ?? entry.reason,
      Number(entry.credit) || "",
      Number(entry.debit) || "",
      Number(entry.balance),
    ]);

    row.font = { size: 9 };
    row.getCell(1).numFmt = "dd mmm yyyy";
    row.getCell(4).numFmt = `"${currency}"#,##0.00`;
    row.getCell(5).numFmt = `"${currency}"#,##0.00`;
    row.getCell(6).numFmt = `"${currency}"#,##0.00`;

    if (Number(entry.credit) > 0) {
      row.getCell(4).font = { size: 9, color: { argb: "FF059669" }, bold: true };
    }
    if (Number(entry.debit) > 0) {
      row.getCell(5).font = { size: 9, color: { argb: "FF2563EB" }, bold: true };
    }
    row.getCell(6).font = { size: 9, bold: true };
  }

  // ─── Totals row ──────────────────────────────────────
  const totalsRow = sheet.addRow([
    "",
    "",
    "TOTALS",
    report.totals.credit,
    report.totals.debit,
    report.totals.finalBalance,
  ]);
  totalsRow.font = { bold: true, size: 10 };
  totalsRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "FF18181B" } },
    };
  });
  totalsRow.getCell(4).numFmt = `"${currency}"#,##0.00`;
  totalsRow.getCell(5).numFmt = `"${currency}"#,##0.00`;
  totalsRow.getCell(6).numFmt = `"${currency}"#,##0.00`;
  totalsRow.getCell(4).font = {
    bold: true,
    color: { argb: "FF059669" },
  };
  totalsRow.getCell(5).font = {
    bold: true,
    color: { argb: "FF2563EB" },
  };

  // ─── Column widths ───────────────────────────────────
  sheet.columns = [
    { width: 14 },
    { width: 12 },
    { width: 35 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}