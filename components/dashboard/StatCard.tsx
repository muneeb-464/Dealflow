interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: { value: string; up: boolean };
  icon: string;
  accent?: "secondary" | "tertiary";
}

export default function StatCard({ label, value, sub, trend, icon, accent = "secondary" }: StatCardProps) {
  const accentBg = accent === "secondary" ? "bg-secondary/10" : "bg-tertiary/10";
  const accentText = accent === "secondary" ? "text-secondary" : "text-tertiary";
  const glowColor = accent === "secondary" ? "rgba(74,222,128,0.15)" : "rgba(249,115,22,0.15)";

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm border border-neutral/8">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center flex-shrink-0`}
          style={{ boxShadow: `0 0 16px ${glowColor}` }}>
          <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-5 ${accentText}`} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
        {trend && (
          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${trend.up ? "bg-secondary/10 text-secondary" : "bg-tertiary/10 text-tertiary"}`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d={trend.up ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
            </svg>
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="font-display font-bold text-primary text-2xl leading-none">{value}</p>
        {sub && <p className="text-neutral text-xs mt-1">{sub}</p>}
        <p className="text-neutral text-xs mt-2 font-medium">{label}</p>
      </div>
    </div>
  );
}
