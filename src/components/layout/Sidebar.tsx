"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useIsAgency } from "@/hooks/useIsAgency";
import WorkspaceSwitcher from "@/components/layout/WorkspaceSwitcher";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  },
  {
    label: "Leads",
    href: "/leads",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    label: "Clients",
    href: "/clients",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    roles: ["owner", "manager", "employee"],
  },
  {
    label: "Reminders",
    href: "/reminders",
    icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  },
  {
    label: "Revenue",
    href: "/revenue",
    icon: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    roles: ["owner", "manager"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "M18 20V10 M12 20V4 M6 20v-6",
    roles: ["owner", "manager"],
  },
  {
    label: "Workspace",
    href: "/workspace",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    roles: ["owner", "manager"],
  },
  {
    label: "Team",
    href: "/team",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    roles: ["owner", "manager"],
  },
];

const bottomItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
    roles: ["owner"],
  },
];

function NavIcon({ path, active }: { path: string; active: boolean }) {
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${active ? "bg-secondary text-primary" : "text-white/40 hover:text-white hover:bg-white/8"}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
        <path d={path} />
      </svg>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "employee";
  const isAgency = useIsAgency();

  const visibleNav = navItems.filter(item => {
    if (!item.roles || item.roles.includes(role)) {
      if ((item.href === "/team" || item.href === "/workspace") && !isAgency) return false;
      return true;
    }
    return false;
  });
  const visibleBottom = bottomItems.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 bg-primary h-screen sticky top-0 overflow-hidden">

      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>
      </div>

      <div className="w-full h-px bg-white/5 flex-shrink-0" />

      <WorkspaceSwitcher />

      <div className="w-full h-px bg-white/5 flex-shrink-0" />

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200 group ${active ? "bg-white/8" : "hover:bg-white/5"}`}
            >
              <NavIcon path={item.icon} active={active} />
              <span className={`text-sm font-medium transition-colors ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>
                {item.label}
              </span>
              {active && <div className="ml-auto w-1 h-1 rounded-full bg-secondary" />}
            </Link>
          );
        })}
      </nav>

      <div className="w-full h-px bg-white/5 flex-shrink-0" />

      {/* Bottom: settings + user */}
      <div className="px-3 py-3 space-y-0.5 flex-shrink-0">
        {visibleBottom.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200 group ${active ? "bg-white/8" : "hover:bg-white/5"}`}
            >
              <NavIcon path={item.icon} active={active} />
              <span className={`text-sm font-medium transition-colors ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* User profile */}
        <div className="flex items-center gap-3 px-2 py-2.5 mt-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name ?? ""} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary text-xs font-bold font-display">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : <span className="w-3 h-1.5 bg-primary/30 rounded animate-pulse inline-block" />}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {user?.name ? (
              <>
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-white/35 text-[10px] truncate capitalize">{role}</p>
              </>
            ) : (
              <>
                <div className="h-2.5 w-20 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-2 w-12 bg-white/10 rounded animate-pulse" />
              </>
            )}
          </div>
          {/* <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white/30 flex-shrink-0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg> */}
        </div>
      </div>
    </aside>
  );
}
