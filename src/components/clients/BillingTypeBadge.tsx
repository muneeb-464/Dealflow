import type { ClientBillingType } from "@/types/client";

const CONFIG: Record<ClientBillingType, { label: string; className: string }> = {
  recurring: { label: "Recurring", className: "bg-secondary/15 text-primary border border-secondary/30" },
  one_time:  { label: "One-time",  className: "bg-neutral/10 text-neutral border border-neutral/15" },
};

export default function BillingTypeBadge({ type }: { type: ClientBillingType }) {
  const { label, className } = CONFIG[type] ?? CONFIG.one_time;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}>{label}</span>;
}
