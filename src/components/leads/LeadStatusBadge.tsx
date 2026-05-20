export type LeadStatus = "Sent" | "Pending" | "Follow-up" | "Replied" | "Converted" | "Rejected";

const config: Record<LeadStatus, { label: string; className: string }> = {
  Sent:        { label: "Sent",       className: "bg-slate-100 text-slate-600 border border-slate-200" },
  Pending:     { label: "Pending",    className: "bg-amber-100 text-amber-700 border border-amber-200" },
  "Follow-up": { label: "Follow-up", className: "bg-orange-100 text-orange-700 border border-orange-200" },
  Replied:     { label: "Replied",   className: "bg-blue-100 text-blue-700 border border-blue-200" },
  Converted:   { label: "Converted", className: "bg-green-100 text-green-800 border border-green-200" },
  Rejected:    { label: "Rejected",  className: "bg-red-100 text-red-600 border border-red-200" },
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = config[status] ?? config.Sent;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${className}`}>{label}</span>
  );
}
