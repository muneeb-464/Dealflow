// Shown instantly on sidebar navigation while the next page loads.
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
