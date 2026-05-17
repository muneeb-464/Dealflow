"use client";
import { useState } from "react";
import Link from "next/link";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useReminderStore } from "@/store/reminderStore";
import { usePathname } from "next/navigation";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/clients": "Clients",
  "/reminders": "Reminders",
  "/revenue": "Revenue",
  "/analytics": "Analytics",
  "/team": "Team",
  "/workspace": "Workspace",
  "/settings": "Settings",
};

export default function Topbar() {
  const { toggleSidebar } = useUiStore();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const reminders = useReminderStore((s) => s.reminders);
  const now = Date.now();
  const notifications = reminders
    .filter((r) => r.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const overdueCount = notifications.filter((r) => new Date(r.nextReminderAt).getTime() <= now).length;

  const pageTitle = Object.entries(pageTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "Dashboard";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "MA";

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-neutral/10 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20">

      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-neutral-light transition-colors flex-shrink-0"
        >
          <span className="h-0.5 bg-primary rounded-full" style={{ width: "18px" }} />
          <span className="h-0.5 bg-primary rounded-full" style={{ width: "14px" }} />
          <span className="h-0.5 bg-primary rounded-full" style={{ width: "18px" }} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-primary">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>
      </div>

      {/* Desktop: page title + date */}
      <div className="hidden lg:block flex-shrink-0">
        <h1 className="font-display font-bold text-primary text-lg leading-none">{pageTitle}</h1>
        <p className="text-neutral text-xs mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex-1" />

      {/* Search — desktop */}
      <div className="hidden lg:flex items-center gap-2 bg-neutral-light rounded-xl px-3 w-52">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-neutral flex-shrink-0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-primary placeholder:text-neutral/50 focus:outline-none py-2.5 w-full"
        />
      </div>

      {/* Quick action button */}
      <button className="hidden lg:flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          onBlur={() => setTimeout(() => setNotifOpen(false), 150)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-light transition-colors relative flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }} className="text-neutral">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tertiary rounded-full border-2 border-white" />
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral/10 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-neutral/10 flex items-center justify-between">
              <p className="font-display font-bold text-primary text-sm">Notifications</p>
              {overdueCount > 0 && (
                <span className="text-[10px] text-tertiary font-semibold bg-tertiary/10 px-2 py-0.5 rounded-full">{overdueCount} due</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-neutral text-xs text-center py-6">No active reminders</p>
            ) : (
              notifications.map((r) => {
                const overdue = new Date(r.nextReminderAt).getTime() <= now;
                return (
                  <div key={r._id} className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-light transition-colors cursor-pointer border-b border-neutral/5 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${overdue ? "bg-tertiary" : "bg-secondary"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-xs font-semibold truncate">{r.title}</p>
                      {r.linkedName && <p className="text-neutral text-[11px] mt-0.5 truncate">{r.linkedName}</p>}
                    </div>
                    <span className="text-neutral/50 text-[10px] flex-shrink-0">{timeAgo(r.createdAt)}</span>
                  </div>
                );
              })
            )}
            <div className="px-4 py-2.5 text-center">
              <Link href="/reminders" onClick={() => setNotifOpen(false)} className="text-xs text-secondary font-semibold hover:text-secondary/80 transition-colors">View all</Link>
            </div>
          </div>
        )}
      </div>

      {/* Profile dropdown */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-neutral-light transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
            <span className="text-primary text-xs font-bold font-display">{initials}</span>
          </div>
          <span className="hidden lg:block text-sm font-medium text-primary">{user?.name?.split(" ")[0] ?? "Muneeb"}</span>
          <svg viewBox="0 0 24 24" fill="none" className="hidden lg:block w-3 h-3 text-neutral" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-neutral/10 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-neutral/10">
              <p className="text-primary text-sm font-semibold">{user?.name ?? "Muneeb Ahmed"}</p>
              <p className="text-neutral text-xs mt-0.5 truncate">{user?.email ?? "muneeb@dealflow.com"}</p>
            </div>
            {[
              { label: "Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
              { label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
            ].map((item) => (
              <button key={item.label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral hover:text-primary hover:bg-neutral-light transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
            <div className="border-t border-neutral/10">
              <Link href="/" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tertiary hover:bg-tertiary/5 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
                </svg>
                Sign out
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
