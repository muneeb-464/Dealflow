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
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
  canEdit?: boolean;
}

export default function ClientCard({ client, onEdit, onDelete, onClick, canEdit = true }: Props) {
  const platformLabel = PLATFORMS.find((p) => p.value === client.platform)?.label ?? client.platform;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral/8 group hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>

      {/* Header: avatar + name + actions */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold font-display text-xs leading-none">
              {getInitials(client.name)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-primary text-sm truncate">{client.name}</p>
            {client.company && (
              <p className="text-neutral text-[11px] mt-0.5 truncate">{client.company}</p>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(client); }}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-secondary/10 text-neutral hover:text-secondary transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(client._id); }}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-tertiary/10 text-neutral hover:text-tertiary transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Status + Platform */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[client.status]}`}>
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </span>
        <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${getPlatformCls(platformLabel)}`}>
          {platformLabel}
        </span>
      </div>

      {/* Email + creator */}
      <p className="text-neutral text-[11px] truncate">{client.email}</p>
      {client.createdByName && (
        <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
          {client.createdByName}
        </span>
      )}

      {/* Revenue + meta */}
      <div className="mt-3 pt-3 border-t border-neutral/8 flex items-center justify-between">
        <p className="font-display font-bold text-primary text-sm">
          {formatCurrency(client.totalRevenue, client.currency)}
        </p>
        <div className="text-right">
          <p className="text-neutral text-[11px]">{client.projectsCount} project{client.projectsCount !== 1 ? "s" : ""}</p>
          <p className="text-neutral text-[11px]">{formatDate(client.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
