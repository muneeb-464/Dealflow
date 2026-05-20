"use client";
import LeadStatusBadge, { LeadStatus } from "./LeadStatusBadge";
import { getPlatformCls } from "./platformColors";

export interface Lead {
  id: string;
  clientName: string;
  platform: string;
  amount: string;
  currency: string;
  status: LeadStatus;
  service: string;
  notes: string;
  sentAt: string;
  updatedAt?: string;
  assignedTo?: string;
  createdBy?: string;
  createdByName?: string;
}

interface Props {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  canEdit?: (lead: Lead) => boolean;
}

export default function LeadTable({ leads, onEdit, onDelete, canEdit }: Props) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-light flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <p className="font-display font-bold text-primary text-sm">No leads yet</p>
        <p className="text-neutral text-xs">Click "+ Add Lead" to track your first proposal</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral/8 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral/8 bg-neutral-light/50">
              {["Client", "Service", "Platform", "Amount", "Status", "Date", ""].map((h, i) => (
                <th key={i} className="text-left text-[11px] font-semibold text-neutral uppercase tracking-wide px-4 py-3 whitespace-nowrap last:w-16">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-neutral/5 last:border-0 hover:bg-neutral-light/30 transition-colors group">
                <td className="px-4 py-3.5">
                  <p className="text-primary text-xs font-semibold">{lead.clientName}</p>
                  {lead.notes && <p className="text-neutral text-[11px] mt-0.5 truncate max-w-[140px]">{lead.notes}</p>}
                  {lead.createdByName && (
                    <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
                      {lead.createdByName}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-neutral text-xs truncate max-w-[120px]">{lead.service}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${getPlatformCls(lead.platform)}`}>{lead.platform}</span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-primary text-xs font-bold font-display whitespace-nowrap">{lead.currency} {Number(lead.amount).toLocaleString()}</p>
                </td>
                <td className="px-4 py-3.5">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-neutral text-xs whitespace-nowrap">{new Date(lead.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </td>
                <td className="px-4 py-3.5">
                  {(!canEdit || canEdit(lead)) && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(lead)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary/10 text-neutral hover:text-secondary transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-tertiary/10 text-neutral hover:text-tertiary transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
