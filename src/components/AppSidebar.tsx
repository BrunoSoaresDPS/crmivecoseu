import { LayoutDashboard, UserCircle, Handshake, Settings2, SearchCheck, Clock, CheckCircle2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

const stageItems = [
  { title: "Clientes em Potencial", url: "/stage/potential", icon: UserCircle },
  { title: "Em Negociação", url: "/stage/negotiation", icon: Handshake },
  { title: "Parametrização", url: "/stage/parametrization", icon: Settings2 },
  { title: "Período de Análise", url: "/stage/analysis", icon: SearchCheck },
  { title: "Aguardando Pagamento", url: "/stage/payment", icon: Clock },
  { title: "Finalizado", url: "/stage/finalized", icon: CheckCircle2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`px-4 py-5 ${collapsed ? "px-2" : ""}`}>
          {!collapsed ? (
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">ContractCRM</h1>
          ) : (
            <h1 className="text-lg font-bold text-sidebar-foreground text-center">C</h1>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">Pipeline</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {stageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
