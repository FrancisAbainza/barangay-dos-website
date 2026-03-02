import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar variant="staff" />
      <SidebarInset className="flex flex-1 flex-col overflow-y-auto">
        <DashboardHeader />
        <main className="pt-16">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
