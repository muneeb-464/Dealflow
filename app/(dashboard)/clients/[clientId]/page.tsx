"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClientStore } from "@/store/clientStore";
import AddClientModal from "@/components/clients/AddClientModal";
import { getPlatformCls } from "@/components/leads/platformColors";
import { PLATFORMS } from "@/constants/platforms";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { CreateClientDto } from "@/types/client";

const STATUS_CLS = {
  active:   "bg-secondary/10 text-secondary",
  inactive: "bg-neutral/10 text-neutral",
  churned:  "bg-tertiary/15 text-tertiary",
};

const MOCK_ACTIVITY = [
  { label: "Client added to workspace", time: "on join", icon: "M12 5v14M5 12l7-7 7 7" },
  { label: "First project completed", time: "recently", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" },
  { label: "Follow-up email sent", time: "2 weeks ago", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
];

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const router = useRouter();
  const { clients, updateClient, deleteClient } = useClientStore();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const client = clients.find((c) => c._id === clientId);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-light flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <p className="font-display font-bold text-primary text-lg">Client not found</p>
        <Link href="/clients" className="text-xs text-secondary font-semibold hover:underline">← Back to Clients</Link>
      </div>
    );
  }

  const platformLabel = PLATFORMS.find((p) => p.value === client.platform)?.label ?? client.platform;

  const handleSave = async (data: CreateClientDto) => {
    updateClient(client._id, data);
  };

  const handleDelete = () => {
    deleteClient(client._id);
    router.push("/clients");
  };

  return (
    <div className="space-y-5">

      {/* Back nav */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-neutral text-xs font-medium hover:text-primary transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Clients
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-secondary font-bold font-display text-lg leading-none">
                {getInitials(client.name)}
              </span>
            </div>
            <div>
              <h1 className="font-display font-bold text-primary text-xl leading-tight">{client.name}</h1>
              {client.company && (
                <p className="text-neutral text-sm mt-0.5">{client.company}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[client.status]}`}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${getPlatformCls(platformLabel)}`}>
                  {platformLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Client
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 border border-neutral/20 text-neutral text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-tertiary/5 hover:text-tertiary hover:border-tertiary/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(client.totalRevenue, client.currency),
            sub: client.currency,
            icon: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
            accent: "secondary" as const,
          },
          {
            label: "Projects",
            value: String(client.projectsCount),
            sub: client.projectsCount === 1 ? "1 project" : `${client.projectsCount} projects total`,
            icon: "M3 3h18v18H3z M8 12h8M12 8v8",
            accent: "secondary" as const,
          },
          {
            label: "Status",
            value: client.status.charAt(0).toUpperCase() + client.status.slice(1),
            sub: client.status === "active" ? "Currently active" : client.status === "churned" ? "Lost client" : "Paused",
            icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
            accent: client.status === "churned" ? "tertiary" as const : "secondary" as const,
          },
          {
            label: "Member Since",
            value: formatDate(client.createdAt),
            sub: `Updated ${formatDate(client.updatedAt)}`,
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
            accent: "secondary" as const,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm border border-neutral/8">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.accent === "secondary" ? "bg-secondary/10" : "bg-tertiary/10"}`}
              style={{ boxShadow: s.accent === "secondary" ? "0 0 16px rgba(74,222,128,0.15)" : "0 0 16px rgba(249,115,22,0.15)" }}>
              <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-5 ${s.accent === "secondary" ? "text-secondary" : "text-tertiary"}`} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d={s.icon} />
              </svg>
            </div>
            <div>
              <p className="font-display font-bold text-primary text-xl leading-none">{s.value}</p>
              {s.sub && <p className="text-neutral text-xs mt-1">{s.sub}</p>}
              <p className="text-neutral text-xs mt-2 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact + Notes + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-4">Contact Info</p>
          <div className="space-y-3">
            <ContactRow
              icon="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
              label="Email"
              value={client.email}
              href={`mailto:${client.email}`}
            />
            {client.phone ? (
              <ContactRow
                icon="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"
                label="Phone"
                value={client.phone}
                href={`tel:${client.phone}`}
              />
            ) : (
              <p className="text-neutral/40 text-xs italic">No phone number</p>
            )}
            {client.company && (
              <ContactRow
                icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"
                label="Company"
                value={client.company}
              />
            )}
            <div className="pt-2 border-t border-neutral/8">
              <p className="text-[10px] font-semibold text-neutral uppercase tracking-wide mb-1">Platform</p>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${getPlatformCls(platformLabel)}`}>
                {platformLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-4">Notes</p>
          {client.notes ? (
            <p className="text-neutral text-sm leading-relaxed">{client.notes}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-neutral/30" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8" />
              </svg>
              <p className="text-neutral/40 text-xs italic">No notes yet</p>
              <button
                onClick={() => setEditOpen(true)}
                className="text-xs text-secondary font-semibold hover:underline"
              >
                Add a note
              </button>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-4">Activity</p>
          <div className="space-y-3">
            {MOCK_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={a.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-xs font-medium leading-snug">{a.label}</p>
                  <p className="text-neutral text-[10px] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <AddClientModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSave}
        initial={client}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-tertiary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <p className="font-display font-bold text-primary text-base">Delete {client.name}?</p>
            <p className="text-neutral text-sm mt-1 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 border border-neutral/20 text-primary text-sm font-semibold rounded-xl hover:bg-neutral-light transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-tertiary text-white text-sm font-semibold rounded-xl hover:bg-tertiary/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-xl bg-neutral-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-neutral uppercase tracking-wide">{label}</p>
        {href ? (
          <a href={href} className="text-primary text-xs font-medium hover:text-secondary transition-colors truncate block mt-0.5">{value}</a>
        ) : (
          <p className="text-primary text-xs font-medium mt-0.5 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
