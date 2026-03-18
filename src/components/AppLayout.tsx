import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ClientDrawer } from "@/components/ClientDrawer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card px-2 shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
        <ClientDrawer />
      </div>
    </SidebarProvider>
  );
}
