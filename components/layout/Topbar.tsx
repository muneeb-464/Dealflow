"use client";
import { useState } from "react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { useUiStore } from "@/store/uiStore";
import { useReminderStore } from "@/store/reminderStore";
import { usePathname, useRouter } from "next/navigation";

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
  const { user: clerkUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  async function handleSignOut() {
    setProfileOpen(false);
    await signOut();
    router.push("/login");
  }
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

  const accountType = (clerkUser?.unsafeMetadata?.accountType as string) ?? "freelancer";
  const fullName = clerkUser?.fullName ?? clerkUser?.firstName ?? "";
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? "";
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email[0]?.toUpperCase() ?? "U";

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
          <div onMouseDown={e => e.preventDefault()} className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral/10 overflow-hidden z-50">
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
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {clerkUser?.imageUrl ? (
              <img src={clerkUser.imageUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary text-xs font-bold font-display">{initials}</span>
            )}
          </div>
          <span className="hidden lg:block text-sm font-medium text-primary">{fullName.split(" ")[0] || "User"}</span>
          <svg viewBox="0 0 24 24" fill="none" className="hidden lg:block w-3 h-3 text-neutral" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {profileOpen && (
          <div onMouseDown={e => e.preventDefault()} className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-neutral/10 overflow-hidden z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-neutral/10">
              <p className="text-primary text-sm font-semibold">{fullName || "User"}</p>
              <p className="text-neutral text-xs mt-0.5 truncate">{email}</p>
            </div>

            {/* Quick nav */}
            <div className="py-1.5">
              <p className="px-4 py-1 text-[10px] font-bold text-neutral/40 uppercase tracking-wider">Navigate</p>
              {[
                { label: "Dashboard",  href: "/dashboard",  icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
                { label: "Leads",      href: "/leads",      icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
                { label: "Clients",    href: "/clients",    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
                { label: "Reminders",  href: "/reminders",  icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" },
                { label: "Revenue",    href: "/revenue",    icon: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
                { label: "Analytics",  href: "/analytics",  icon: "M18 20V10 M12 20V4 M6 20v-6" },
                { label: "Team",       href: "/team",       icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", agencyOnly: true },
              ].filter((item) => !item.agencyOnly || accountType === "agency").map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setProfileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors hover:bg-neutral-light group ${pathname === item.href || pathname.startsWith(item.href + "/") ? "text-secondary bg-secondary/5" : "text-neutral hover:text-primary"}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                  {(pathname === item.href || pathname.startsWith(item.href + "/")) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>

            {/* Account */}
            <div className="border-t border-neutral/10 py-1.5">
              <p className="px-4 py-1 text-[10px] font-bold text-neutral/40 uppercase tracking-wider">Account</p>
              <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-neutral hover:text-primary hover:bg-neutral-light transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </Link>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-tertiary hover:bg-tertiary/5 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
