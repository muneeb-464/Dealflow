"use client";
import { useState, useRef, useEffect } from "react";
import type { Lead } from "./LeadTable";
import { LeadStatus } from "./LeadStatusBadge";
import { getPlatformCls } from "./platformColors";

interface ColConfig {
  status: LeadStatus;
  label: string;
  headerStyle: React.CSSProperties;
  dotColor: string;
  emptyBorder: string;
}

const COLUMNS: ColConfig[] = [
  {
    status: "Sent",
    label: "Sent",
    headerStyle: { background: "#e8e8e8" },
    dotColor: "#9ca3af",
    emptyBorder: "#d1d5db",
  },
  {
    status: "Pending",
    label: "Pending",
    headerStyle: { background: "#dcfce7" },
    dotColor: "#4ADE80",
    emptyBorder: "#bbf7d0",
  },
  {
    status: "Follow-up",
    label: "Follow-up",
    headerStyle: { background: "#ffedd5" },
    dotColor: "#F97316",
    emptyBorder: "#fed7aa",
  },
  {
    status: "Replied",
    label: "Replied",
    headerStyle: { background: "#d1fae5" },
    dotColor: "#10b981",
    emptyBorder: "#a7f3d0",
  },
  {
    status: "Converted",
    label: "Converted",
    headerStyle: { background: "#4ADE80", color: "#0A2A22" },
    dotColor: "#0A2A22",
    emptyBorder: "#4ADE80",
  },
  {
    status: "Rejected",
    label: "Rejected",
    headerStyle: { background: "#ffe4cc" },
    dotColor: "#F97316",
    emptyBorder: "#fdba74",
  },
];

const NEXT_STATUS: Partial<Record<LeadStatus, LeadStatus>> = {
  Sent: "Pending",
  Pending: "Replied",
  "Follow-up": "Replied",
  Replied: "Converted",
};

interface Props {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

export default function LeadKanban({ leads, onEdit, onDelete, onStatusChange }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3" style={{ marginLeft: "-4px", paddingLeft: "4px" }}>
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);
        return (
          <div key={col.status} className="flex-shrink-0 flex flex-col gap-2" style={{ width: "240px" }}>

            {/* Column header */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={col.headerStyle}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: col.dotColor }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: col.headerStyle.color ?? "#0A2A22" }}
                >
                  {col.label}
                </span>
              </div>
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  color: "#0A2A22",
                }}
              >
                {colLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2" style={{ minHeight: "80px" }}>
              {colLeads.length === 0 && (
                <div
                  className="rounded-xl flex items-center justify-center"
                  style={{
                    height: "64px",
                    border: `2px dashed ${col.emptyBorder}`,
                  }}
                >
                  <p className="text-xs" style={{ color: "#9ca3af" }}>Empty</p>
                </div>
              )}
              {colLeads.map((lead) => (
                <KanbanCard
                  key={lead.id}
                  lead={lead}
                  nextStatus={NEXT_STATUS[lead.status]}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ALL_STATUSES: LeadStatus[] = ["Sent", "Pending", "Follow-up", "Replied", "Converted", "Rejected"];

const STATUS_DOT: Record<LeadStatus, string> = {
  Sent:        "#9ca3af",
  Pending:     "#4ADE80",
  "Follow-up": "#F97316",
  Replied:     "#10b981",
  Converted:   "#4ADE80",
  Rejected:    "#F97316",
};

function KanbanCard({ lead, nextStatus, onEdit, onDelete, onStatusChange }: {
  lead: Lead;
  nextStatus?: LeadStatus;
  onEdit: (l: Lead) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuW = 172;
    const menuH = 320;
    let left = r.right - menuW;
    let top = r.bottom + 6;
    if (left < 8) left = 8;
    if (left + menuW > window.innerWidth - 8) left = window.innerWidth - menuW - 8;
    if (top + menuH > window.innerHeight - 8) top = r.top - menuH - 6;
    setMenuPos({ top, left });
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <div
      className="bg-white rounded-xl p-3.5 group relative"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-1.5 mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-primary text-xs leading-snug truncate">{lead.clientName}</p>
          <p className="text-neutral text-[11px] mt-0.5 truncate">{lead.service}</p>
        </div>

        {/* 3-dot menu */}
        <div className="flex-shrink-0 relative">
          <button
            ref={btnRef}
            onClick={() => menuOpen ? setMenuOpen(false) : openMenu()}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-neutral-light transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: "#9ca3af" }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="bg-white rounded-xl py-1.5"
              style={{
                position: "fixed",
                top: menuPos.top,
                left: menuPos.left,
                width: "172px",
                zIndex: 9999,
                boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Edit */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => { setMenuOpen(false); onEdit(lead); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral hover:text-primary hover:bg-neutral-light transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Details
              </button>

              {/* Move to */}
              <div style={{ borderTop: "1px solid #f3f4f6", marginTop: "4px", paddingTop: "4px" }}>
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Move to</p>
                {ALL_STATUSES.filter((s) => s !== lead.status).map((s) => (
                  <button
                    key={s}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => { setMenuOpen(false); onStatusChange(lead.id, s); }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-neutral hover:text-primary hover:bg-neutral-light transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[s] }} />
                    {s}
                  </button>
                ))}
              </div>

              {/* Delete */}
              <div style={{ borderTop: "1px solid #f3f4f6", marginTop: "4px", paddingTop: "4px" }}>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => { setMenuOpen(false); onDelete(lead.id); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-red-50 transition-colors"
                  style={{ color: "#F97316" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                  </svg>
                  Delete Lead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform + amount */}
      <div className="flex items-center justify-between">
        <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${getPlatformCls(lead.platform)}`}>
          {lead.platform}
        </span>
        <span className="font-display font-bold text-primary text-xs">
          {lead.currency} {Number(lead.amount).toLocaleString()}
        </span>
      </div>

      {/* Quick advance */}
      {nextStatus && (
        <button
          onClick={() => onStatusChange(lead.id, nextStatus)}
          className="mt-2.5 w-full text-[11px] font-semibold rounded-lg py-1.5 flex items-center justify-center gap-1 transition-colors"
          style={{
            color: "#4ADE80",
            border: "1px solid rgba(74,222,128,0.3)",
            background: "rgba(74,222,128,0.06)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,222,128,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(74,222,128,0.06)")}
        >
          Move to {nextStatus}
          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      <p className="text-[10px] mt-2.5" style={{ color: "#9ca3af" }}>
        {new Date(lead.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
    </div>
  );
}
