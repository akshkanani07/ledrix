import type { WorkerLedgerReport } from "../types/report.types";

/**
 * Ledrix — WhatsApp Premium Message Builder.
 * Ultra-professional, visually rich ledger summary.
 */

export function buildWhatsAppMessage(report: WorkerLedgerReport): string {
  const currency = report.workspace.currency === "INR" ? "₹" : "$";

  // ─── Formatters ────────────────────────────────────
  function money(n: number | string, showSign = false): string {
    const v = typeof n === "string" ? Number(n) : n;
    const abs = Math.abs(v);
    const formatted = abs.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (showSign && v !== 0) {
      return `${v < 0 ? "-" : "+"}${currency}${formatted}`;
    }
    return `${currency}${formatted}`;
  }

  function shortMoney(n: number | string): string {
    const v = typeof n === "string" ? Number(n) : n;
    const abs = Math.abs(v);
    if (abs >= 10000000) return `${currency}${(abs / 10000000).toFixed(2)}Cr`;
    if (abs >= 100000) return `${currency}${(abs / 100000).toFixed(2)}L`;
    if (abs >= 1000) return `${currency}${(abs / 1000).toFixed(2)}K`;
    return `${currency}${abs.toFixed(2)}`;
  }

  function date(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function time(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function dayOfWeek(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", { weekday: "short" });
  }

  function getTypeBadge(type: string): string {
    switch (type) {
      case "WORK":
        return "🛠️ WORK";
      case "PAYMENT":
        return "💵 PAYMENT";
      case "ADVANCE":
        return "📤 ADVANCE";
      case "DEDUCTION":
        return "📥 DEDUCTION";
      default:
        return "📄";
    }
  }

  // ─── Computation ───────────────────────────────────
  const finalBalance = report.totals.finalBalance;
  const totalEntries = report.entries.length;

  // Last 30 days summary
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEntries = report.entries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo
  );
  const recentCredit = recentEntries
    .filter((e) => e.type === "WORK" || e.type === "DEDUCTION")
    .reduce((s, e) => s + Number(e.credit), 0);
  const recentDebit = recentEntries
    .filter((e) => e.type === "PAYMENT" || e.type === "ADVANCE")
    .reduce((s, e) => s + Number(e.debit), 0);

  // ─── Build Message ─────────────────────────────────
  const L: string[] = [];
  const DIVIDER = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
  const THIN = "─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─";

  // ═══════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════
  L.push(`🏢 *${report.workspace.name.toUpperCase()}*`);
  L.push(`_Workforce Ledger Statement_`);
  L.push(DIVIDER);
  L.push("");

  // ═══════════════════════════════════════════════════
  // WORKER
  // ═══════════════════════════════════════════════════
  L.push(`👤 *WORKER PROFILE*`);
  L.push(`┌─────────────────────────`);
  L.push(`│ *Name:*  ${report.worker.name}`);
  if (report.worker.mobile) {
    L.push(`│ *Mobile:*  ${report.worker.mobile}`);
  }
  if (report.worker.address) {
    const addr = report.worker.address.split("\n")[0].slice(0, 55);
    L.push(`│ *Address:*  ${addr}`);
  }
  L.push(`└─────────────────────────`);
  L.push("");

  // ═══════════════════════════════════════════════════
  // BALANCE HERO
  // ═══════════════════════════════════════════════════
  L.push(`*NET BALANCE*`);
  L.push("");

  if (finalBalance > 0) {
    L.push(`     🟢 *YOU OWE WORKER*`);
    L.push(`     *${money(finalBalance)}*`);
  } else if (finalBalance < 0) {
    L.push(`     🔵 *WORKER OWES YOU*`);
    L.push(`     *${money(finalBalance)}*`);
  } else {
    L.push(`     ⚪ *ALL SETTLED*`);
    L.push(`     *${money(0)}*`);
  }

  L.push("");
  L.push(DIVIDER);
  L.push("");

  // ═══════════════════════════════════════════════════
  // FINANCIAL SUMMARY
  // ═══════════════════════════════════════════════════
  L.push(`💼 *FINANCIAL SUMMARY*`);
  L.push("");
  L.push(`📌 Opening Balance        *${money(report.worker.openingBalance)}*`);
  L.push(`✅ Total Credit           *+${money(report.totals.credit)}*`);
  L.push(`❌ Total Debit            *-${money(report.totals.debit)}*`);
  L.push(THIN);
  L.push(`⚖️  *Final Balance         ${money(finalBalance)}*`);
  L.push("");

  // ═══════════════════════════════════════════════════
  // 30-DAY ACTIVITY
  // ═══════════════════════════════════════════════════
  if (recentEntries.length > 0) {
    L.push(`📊 *LAST 30 DAYS ACTIVITY*`);
    L.push("");
    L.push(`🟢 Earned (Credit)    *+${money(recentCredit)}*`);
    L.push(`🔴 Paid (Debit)       *-${money(recentDebit)}*`);
    L.push(`📝 Transactions       *${recentEntries.length}*`);
    L.push("");
  }

  // ═══════════════════════════════════════════════════
  // RECENT TRANSACTIONS (last 5)
  // ═══════════════════════════════════════════════════
  if (report.entries.length > 0) {
    L.push(DIVIDER);
    L.push(`📋 *RECENT TRANSACTIONS*  (Last 5)`);
    L.push("");

    const recent = [...report.entries].reverse().slice(0, 5);

    recent.forEach((entry, idx) => {
      const isCredit =
        entry.type === "WORK" || entry.type === "DEDUCTION";
      const amt = isCredit ? entry.credit : entry.debit;
      const sign = isCredit ? "+" : "−";
      const emoji = isCredit ? "🟢" : "🔴";
      const detail = (entry.workName ?? entry.reason).slice(0, 45);

      L.push(`*${idx + 1}.* ${emoji} *${date(entry.date)}* _(${dayOfWeek(entry.date)})_`);
      L.push(`   ├ ${getTypeBadge(entry.type)}`);
      L.push(`   ├ ${detail}`);
      L.push(`   ├ Amount:  *${sign}${money(amt)}*`);
      L.push(`   └ Balance: *${money(entry.balance)}*`);
      L.push("");
    });

    if (report.entries.length > 5) {
      L.push(`_⬇️  +${report.entries.length - 5} more entries in PDF report_`);
      L.push("");
    }
  }

  // ═══════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════
  L.push(DIVIDER);
  L.push(`📈 *STATISTICS*`);
  L.push("");
  L.push(`📅 Period     *${date(report.period.from)} — ${date(report.period.to)}*`);
  L.push(`📝 Total      *${totalEntries} transaction${totalEntries === 1 ? "" : "s"}*`);

  // Average per transaction
  if (totalEntries > 0) {
    const avgTxn =
      (report.totals.credit + report.totals.debit) / totalEntries;
    L.push(`💹 Average    *${money(avgTxn)} per entry*`);
  }

  L.push("");

  // ═══════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════
  L.push(DIVIDER);
  L.push("");
  L.push(`📅 *Generated:*  ${date(report.generatedAt)}`);
  L.push(`🕐 *Time:*  ${time(report.generatedAt)}`);
  L.push("");
  L.push(`_📱 Powered by *Ledrix*_`);
  L.push(`_Smart Workforce Ledger Platform_`);
  L.push("");
  L.push(`_This is a system-generated statement._`);

  return L.join("\n");
}

export function buildWhatsAppURL(
  report: WorkerLedgerReport,
  phoneNumber?: string | null
): string {
  const message = buildWhatsAppMessage(report);
  const encoded = encodeURIComponent(message);

  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}