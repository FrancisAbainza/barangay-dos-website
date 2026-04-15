import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen className="h-svh overflow-hidden">
      <DashboardSidebar />
      <SidebarInset className="flex flex-1 flex-col overflow-y-auto">
        <DashboardHeader />
        <main className="px-6 py-20 md:py-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
