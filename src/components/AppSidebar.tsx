import { LayoutDashboard, UserCircle, Handshake, Settings2, SearchCheck, Clock, CheckCircle2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  { title: "Dashboard", url: "/", icon: LayoutDashboard, tooltip: "Painel geral com KPIs, gráficos e atividade recente" },
];

const stageItems = [
  { title: "Clientes em Potencial", url: "/stage/potential", icon: UserCircle, tooltip: "Leads captados que ainda não iniciaram negociação" },
  { title: "Em Negociação", url: "/stage/negotiation", icon: Handshake, tooltip: "Clientes com propostas em andamento" },
  { title: "Parametrização", url: "/stage/parametrization", icon: Settings2, tooltip: "Clientes em fase de configuração do sistema" },
  { title: "Período de Análise", url: "/stage/analysis", icon: SearchCheck, tooltip: "Clientes testando e avaliando a solução" },
  { title: "Aguardando Pagamento", url: "/stage/payment", icon: Clock, tooltip: "Contratos fechados aguardando confirmação de pagamento" },
  { title: "Finalizado", url: "/stage/finalized", icon: CheckCircle2, tooltip: "Contratos concluídos com pagamento confirmado" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderItem = (item: typeof mainItems[0], end?: boolean) => (
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
        <div className={`px-4 py-5 ${collapsed ? "px-2" : ""}`}>
          {!collapsed ? (
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">Iveco Seu - CRM</h1>
          ) : (
            <h1 className="text-lg font-bold text-sidebar-foreground text-center">C</h1>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => renderItem(item, true))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">Pipeline</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {stageItems.map((item) => renderItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
