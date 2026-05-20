import type { Lead } from "./LeadTable";
import LeadStatusBadge from "./LeadStatusBadge";

interface Props {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export default function LeadCard({ lead, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral/8 group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-primary text-sm truncate">{lead.clientName}</p>
          <p className="text-neutral text-[11px] mt-0.5 truncate">{lead.service}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(lead)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-secondary/10 text-neutral hover:text-secondary transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => onDelete(lead.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-tertiary/10 text-neutral hover:text-tertiary transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <LeadStatusBadge status={lead.status} />
        <span className="text-[11px] text-primary bg-neutral/8 px-2 py-0.5 rounded-lg font-medium">{lead.platform}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral/8 flex items-center justify-between">
        <p className="font-display font-bold text-primary text-sm">{lead.currency} {Number(lead.amount).toLocaleString()}</p>
        <p className="text-neutral text-[11px]">{new Date(lead.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
      </div>
    </div>
  );
}
