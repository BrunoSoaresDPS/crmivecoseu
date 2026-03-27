import { LayoutDashboard, BarChart3, LogOut, Wrench } from "lucide-react";
import logoIveco from "@/assets/logo-iveco.png";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const dashboardItems = [
  { title: "Dashboard Geral", url: "/", icon: LayoutDashboard, tooltip: "Painel geral com KPIs, gráficos e atividade recente" },
  { title: "Dashboard Pós-Vendas", url: "/pos-vendas/dashboard", icon: BarChart3, tooltip: "Insights e métricas dos contratos finalizados" },
];

const toolItems = [
  { title: "Relatório Automático", url: "/ferramentas", icon: Wrench, tooltip: "Geração automática de relatórios" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, user, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  const renderItem = (item: typeof dashboardItems[0], end?: boolean) => (
    <SidebarMenuItem key={item.title}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton asChild>
            <NavLink to={item.url} end={end} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[220px]">
          <p className="text-xs">{item.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`px-4 py-5 flex items-center justify-center ${collapsed ? "px-2 py-3" : ""}`}>
          <img src={logoIveco} alt="Iveco Seu 360" className={`${collapsed ? "h-20 w-auto" : "h-40 w-auto"} dark:invert-0 invert brightness-0 dark:brightness-100`} />
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">Dashboard</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => renderItem(item, item.url === "/"))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">Ferramentas</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => renderItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-accent/30 p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || user?.email || "Usuário"}
              </p>
              {profile?.cargo && (
                <p className="text-xs text-sidebar-foreground/60 truncate">{profile.cargo}</p>
              )}
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className={`text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors ${collapsed ? "mt-2" : ""}`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Sair</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
