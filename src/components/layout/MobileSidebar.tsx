"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { label: "Leads", href: "/leads", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { label: "Clients", href: "/clients", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { label: "Reminders", href: "/reminders", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" },
  { label: "Revenue", href: "/revenue", icon: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", roles: ["owner", "manager"] },
  { label: "Analytics", href: "/analytics", icon: "M18 20V10 M12 20V4 M6 20v-6", roles: ["owner", "manager"] },
  { label: "Workspace", href: "/workspace", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", roles: ["owner", "manager"] },
  { label: "Team", href: "/team", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", roles: ["owner", "manager"] },
  { label: "Settings", href: "/settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z", roles: ["owner"] },
];

export default function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "employee";

  const visibleNav = navItems.filter(item => !item.roles || item.roles.includes(role));

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 h-full w-[260px] bg-primary z-40 lg:hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between flex-shrink-0">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="font-display font-bold text-base tracking-tight text-white">DEAL<span className="text-secondary">FLOW</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="w-full h-px bg-white/5 flex-shrink-0" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 group ${active ? "bg-white/8" : "hover:bg-white/5"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${active ? "bg-secondary text-primary" : "text-white/40 group-hover:text-white"}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
                    <path d={item.icon} />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>
                  {item.label}
                </span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />}
              </Link>
            );
          })}
        </nav>

        <div className="w-full h-px bg-white/5 flex-shrink-0" />

        {/* User */}
        <div className="px-3 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold font-display">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "MA"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name ?? "Muneeb Ahmed"}</p>
              <p className="text-white/35 text-[10px] capitalize">{role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
