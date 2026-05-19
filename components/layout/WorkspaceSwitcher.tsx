"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface WorkspaceItem {
  _id: string;
  name: string;
  role: string;
  isActive: boolean;
}

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/workspace/list")
      .then((r) => r.json())
      .then((d) => { if (d.workspaces) setWorkspaces(d.workspaces); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const active = workspaces.find((w) => w.isActive);

  async function switchWorkspace(id: string) {
    if (switching) return;
    setSwitching(true);
    setOpen(false);
    try {
      await fetch("/api/workspace/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      setWorkspaces((prev) => prev.map((w) => ({ ...w, isActive: w._id === id })));
      router.refresh();
    } finally {
      setSwitching(false);
    }
  }

  if (workspaces.length === 0) return null;

  return (
    <div ref={ref} className="relative px-3 py-2 flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/6 hover:bg-white/10 transition-colors group"
      >
        <div className="w-6 h-6 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 font-bold font-display text-[9px] text-secondary">
          {active?.name ? active.name.slice(0, 2).toUpperCase() : "WS"}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-white text-[11px] font-semibold truncate">{active?.name ?? "Select workspace"}</p>
          <p className="text-white/35 text-[10px] capitalize">{active?.role ?? ""}</p>
        </div>
        <svg
          viewBox="0 0 24 24" fill="none" className={`w-3 h-3 text-white/30 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-[#0d3528] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Workspaces</p>
          <div className="max-h-48 overflow-y-auto">
            {workspaces.map((w) => (
              <button
                key={w._id}
                onClick={() => switchWorkspace(w._id)}
                disabled={w.isActive || switching}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${w.isActive ? "opacity-100" : "hover:bg-white/6"}`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.isActive ? "bg-secondary" : "bg-white/15"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-semibold truncate ${w.isActive ? "text-secondary" : "text-white/70"}`}>{w.name}</p>
                  <p className="text-white/30 text-[10px] capitalize">{w.role}</p>
                </div>
                {w.isActive && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-secondary flex-shrink-0" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-white/8 p-2">
            <button
              onClick={() => { setOpen(false); router.push("/workspace?create=1"); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/6 text-white/40 hover:text-white/70 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[11px] font-semibold">New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
