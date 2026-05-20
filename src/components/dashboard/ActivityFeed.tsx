"use client";
import { useLeadStore } from "@/store/leadStore";
import type { Lead } from "@/components/leads/LeadTable";
import type { LeadStatus } from "@/components/leads/LeadStatusBadge";

const ICON: Record<string, string> = {
  lead:      "M22 12h-4l-3 9L9 3l-3 9H2",
  converted: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  followup:  "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  rejected:  "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
};

const DOT: Partial<Record<LeadStatus, string>> = {
  Converted:   "bg-secondary",
  "Follow-up": "bg-tertiary",
  Rejected:    "bg-tertiary/60",
  Replied:     "bg-secondary/60",
  Pending:     "bg-secondary/40",
  Sent:        "bg-neutral/40",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function by(l: Lead) {
  return l.createdByName ? ` · ${l.createdByName}` : "";
}

function leadToActivity(l: Lead) {
  const amount = `${l.currency} ${Number(l.amount).toLocaleString()}`;
  if (l.status === "Converted")
    return { icon: "converted", dot: DOT.Converted!, title: "Lead converted",     desc: `${l.clientName} · ${amount}${by(l)}` };
  if (l.status === "Follow-up")
    return { icon: "followup",  dot: DOT["Follow-up"]!, title: "Follow-up needed", desc: `${l.clientName} · ${l.service}${by(l)}` };
  if (l.status === "Rejected")
    return { icon: "rejected",  dot: DOT.Rejected!, title: "Lead rejected",       desc: `${l.clientName} · ${l.service}${by(l)}` };
  if (l.status === "Replied")
    return { icon: "lead",      dot: DOT.Replied!, title: "Lead replied",          desc: `${l.clientName} · ${amount}${by(l)}` };
  return { icon: "lead",        dot: DOT.Sent!, title: "New lead added",           desc: `${l.clientName} via ${l.platform}${by(l)}` };
}

export default function ActivityFeed() {
  const leads = useLeadStore((s) => s.leads);

  const activities = [...leads]
    .sort((a, b) => new Date(b.updatedAt ?? b.sentAt).getTime() - new Date(a.updatedAt ?? a.sentAt).getTime())
    .slice(0, 6)
    .map((l) => ({
      ...leadToActivity(l),
      time: timeAgo(l.updatedAt ?? l.sentAt),
    }));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-display font-bold text-primary text-sm">Recent Activity</p>
          <p className="text-neutral text-xs mt-0.5">Live updates from your workspace</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-9 h-9 rounded-xl bg-neutral-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d={ICON.lead} />
            </svg>
          </div>
          <p className="text-neutral/50 text-xs text-center">Activity will appear here<br/>as you add leads</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-neutral/5 last:border-0">
              <div className="w-8 h-8 rounded-xl bg-neutral-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICON[a.icon]} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`} />
                  <p className="text-primary text-xs font-semibold truncate">{a.title}</p>
                </div>
                <p className="text-neutral text-[11px] mt-0.5 truncate pl-3.5">{a.desc}</p>
              </div>
              <span className="text-neutral/50 text-[10px] flex-shrink-0 mt-0.5">{a.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
