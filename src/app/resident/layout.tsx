import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar variant="resident" />
      <SidebarInset className="flex flex-1 flex-col overflow-y-auto">
        <DashboardHeader />
        <main className="pt-16">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
