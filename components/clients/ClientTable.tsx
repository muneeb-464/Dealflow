"use client";
import { Client } from "@/types/client";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { getPlatformCls } from "@/components/leads/platformColors";
import { PLATFORMS } from "@/constants/platforms";

const STATUS_CLS: Record<Client["status"], string> = {
  active:   "bg-secondary/10 text-secondary",
  inactive: "bg-neutral/10 text-neutral",
  churned:  "bg-tertiary/15 text-tertiary",
};

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onRowClick?: (id: string) => void;
  canEdit?: (client: Client) => boolean;
}

export default function ClientTable({ clients, onEdit, onDelete, onRowClick, canEdit }: Props) {
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-light flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p className="font-display font-bold text-primary text-sm">No clients yet</p>
        <p className="text-neutral text-xs">Add your first client to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral/8 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral/8 bg-neutral-light/50">
              {["Client", "Platform", "Status", "Revenue", "Projects", "Added", ""].map((h, i) => (
                <th key={i} className="text-left text-[11px] font-semibold text-neutral uppercase tracking-wide px-4 py-3 whitespace-nowrap last:w-16">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const platformLabel = PLATFORMS.find((p) => p.value === client.platform)?.label ?? client.platform;
              return (
                <tr key={client._id} className="border-b border-neutral/5 last:border-0 hover:bg-neutral-light/30 transition-colors group cursor-pointer" onClick={() => onRowClick?.(client._id)}>

                  {/* Client */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold font-display text-[11px] leading-none">
                          {getInitials(client.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-primary text-xs font-semibold font-display truncate max-w-[150px]">{client.name}</p>
                        {client.company && (
                          <p className="text-neutral text-[11px] mt-0.5 truncate max-w-[150px]">{client.company}</p>
                        )}
                        <p className="text-neutral text-[11px] truncate max-w-[150px]">{client.email}</p>
                        {client.createdByName && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
                            {client.createdByName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${getPlatformCls(platformLabel)}`}>
                      {platformLabel}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[client.status]}`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </td>

                  {/* Revenue */}
                  <td className="px-4 py-3.5">
                    <p className="text-primary text-xs font-bold font-display whitespace-nowrap">
                      {formatCurrency(client.totalRevenue, client.currency)}
                    </p>
                  </td>

                  {/* Projects */}
                  <td className="px-4 py-3.5">
                    <span className="text-primary text-xs font-semibold">{client.projectsCount}</span>
                  </td>

                  {/* Added */}
                  <td className="px-4 py-3.5">
                    <p className="text-neutral text-xs whitespace-nowrap">{formatDate(client.createdAt)}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    {(!canEdit || canEdit(client)) && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(client); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary/10 text-neutral hover:text-secondary transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(client._id); }}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
