interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm" style={{ border: "1px solid #f3f4f6" }}>
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-7" />
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-20 h-3" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #f3f4f6" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="w-36 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
        <Skeleton className="w-20 h-6 rounded-lg" />
      </div>
      <div className="flex items-center gap-1 mb-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-16 h-7 rounded-lg" />)}
      </div>
      {/* Fake chart bars */}
      <div className="flex items-end gap-2 h-[200px] pt-4">
        {[40, 65, 50, 80, 60, 90, 70, 85, 55, 95, 75, 100].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Skeleton className="w-full rounded-t-sm" style={{ height: `${h}%`, opacity: 0.5 + i * 0.04 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonActivity() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #f3f4f6" }}>
      <div className="space-y-2 mb-4">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-44 h-3" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < 4 ? "1px solid #f9fafb" : "none" }}>
          <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="w-3/4 h-3" />
            <Skeleton className="w-1/2 h-2.5" />
          </div>
          <Skeleton className="w-8 h-2.5 rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPipeline() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #f3f4f6" }}>
      <div className="space-y-2 mb-4">
        <Skeleton className="w-28 h-4" />
        <Skeleton className="w-20 h-3" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="mb-3">
          <div className="flex justify-between mb-1.5">
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-4 h-3" />
          </div>
          <Skeleton className="w-full h-1.5 rounded-full" style={{ opacity: 0.6 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #f3f4f6" }}>
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="w-28 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <div className="flex gap-4 pb-2.5 mb-1" style={{ borderBottom: "1px solid #f3f4f6" }}>
        {["w-24", "w-16", "w-16", "w-14"].map((w, i) => (
          <Skeleton key={i} className={`${w} h-3`} />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 py-3" style={{ borderBottom: i < 4 ? "1px solid #f9fafb" : "none" }}>
          <div className="w-24 space-y-1.5">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-3/4 h-2.5" />
          </div>
          <Skeleton className="w-16 h-3 self-center" />
          <Skeleton className="w-16 h-3 self-center" />
          <Skeleton className="w-14 h-5 rounded-full self-center" />
        </div>
      ))}
    </div>
  );
}
