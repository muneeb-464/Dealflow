export type LeadStatus = "Sent" | "Pending" | "Follow-up" | "Replied" | "Converted" | "Rejected";

const config: Record<LeadStatus, { label: string; className: string }> = {
  Sent:       { label: "Sent",       className: "bg-neutral/10 text-neutral" },
  Pending:    { label: "Pending",    className: "bg-secondary/10 text-secondary" },
  "Follow-up":{ label: "Follow-up", className: "bg-tertiary/10 text-tertiary" },
  Replied:    { label: "Replied",    className: "bg-secondary/20 text-secondary" },
  Converted:  { label: "Converted", className: "bg-secondary text-primary" },
  Rejected:   { label: "Rejected",  className: "bg-tertiary/15 text-tertiary" },
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = config[status] ?? config.Sent;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${className}`}>{label}</span>
  );
}
