import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import SyncUser from "@/components/layout/SyncUser";
import SyncGuestUser from "@/components/layout/SyncGuestUser";
import RoleGuard from "@/components/layout/RoleGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-light overflow-hidden">
      <SyncUser />
      <SyncGuestUser />
      <RoleGuard />
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
