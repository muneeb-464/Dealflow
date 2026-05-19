import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { Lead, Client } from "@/models";

function escapeCsv(val: unknown): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toRow(cols: unknown[]): string {
  return cols.map(escapeCsv).join(",");
}

// GET /api/workspace/export — download workspace leads + clients as CSV
export const GET = withAuth(async (_req, ctx) => {
  const [leads, clients] = await Promise.all([
    Lead.find({ workspaceId: ctx.workspaceId })
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .lean(),
    Client.find({ workspaceId: ctx.workspaceId })
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .lean(),
  ]);

  const lines: string[] = [];

  // Leads section
  lines.push("=== LEADS ===");
  lines.push(toRow(["Client Name", "Platform", "Service", "Amount", "Currency", "Status", "Sent At", "Replied At", "Converted At", "Assigned To", "Created By", "Notes"]));
  for (const l of leads) {
    const assigned = (l.assignedTo as { name?: string } | null)?.name ?? "";
    const createdBy = (l.createdBy as { name?: string } | null)?.name ?? "";
    lines.push(toRow([
      l.clientName, l.platform, l.serviceOffered,
      l.proposedAmount, l.currency, l.status,
      l.leadSentAt ? new Date(l.leadSentAt).toISOString() : "",
      l.repliedAt ? new Date(l.repliedAt).toISOString() : "",
      l.convertedAt ? new Date(l.convertedAt).toISOString() : "",
      assigned, createdBy, l.notes ?? "",
    ]));
  }

  lines.push("");

  // Clients section
  lines.push("=== CLIENTS ===");
  lines.push(toRow(["Name", "Email", "Phone", "Company", "Platform", "Status", "Total Revenue", "Currency", "Assigned To", "Created By", "Notes", "Created At"]));
  for (const c of clients) {
    const assigned = (c.assignedTo as { name?: string } | null)?.name ?? "";
    const createdBy = (c.createdBy as { name?: string } | null)?.name ?? "";
    lines.push(toRow([
      c.name, c.email, c.phone ?? "", c.company ?? "",
      c.platform, c.status, c.totalRevenue, c.currency,
      assigned, createdBy, c.notes ?? "",
      new Date(c.createdAt).toISOString(),
    ]));
  }

  const csv = lines.join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="dealflow-export-${date}.csv"`,
    },
  });
});
