import { useCRM } from "@/contexts/CRMContext";
import { STAGES, Stage } from "@/types/crm";
import { timeAgo } from "@/lib/dateUtils";
import { StageBadge } from "@/components/StageBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Users, Handshake, CheckCircle, AlertTriangle, MessageSquare, TrendingUp, Clock, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LabelList } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const STAGE_COLORS: Record<Stage, string> = {
  potential: "#3B82F6",
  negotiation: "#1D4ED8",
  parametrization: "#60A5FA",
  analysis: "#93C5FD",
  payment: "#2563EB",
  finalized: "#1E40AF",
};

const PRIORITY_COLORS = { high: "#1E3A8A", medium: "#3B82F6", low: "#BFDBFE" };

const renderPieLabel = ({ name, value, percent }: { name: string; value: number; percent: number }) => {
  if (percent < 0.05) return null;
  return `${value}`;
};

export default function Dashboard() {
  const { clients, setSelectedClientId } = useCRM();
  const navigate = useNavigate();

  const totalLeads = clients.length;
  const inNegotiation = clients.filter((c) => c.stage === "negotiation").length;
  const finalized = clients.filter((c) => c.stage === "finalized").length;
  const highPriority = clients.filter((c) => c.priority === "high").length;
  const totalComments = clients.reduce((sum, c) => sum + c.comments.length, 0);
  const conversionRate = totalLeads > 0 ? ((finalized / totalLeads) * 100).toFixed(1) : "0";
  const avgComments = totalLeads > 0 ? (totalComments / totalLeads).toFixed(1) : "0";

  const stageDistribution = STAGES.map((s) => ({
    name: s.label,
    value: clients.filter((c) => c.stage === s.key).length,
    color: STAGE_COLORS[s.key],
  })).filter((d) => d.value > 0);

  const priorityData = [
    { name: "Alta", value: clients.filter((c) => c.priority === "high").length, fill: PRIORITY_COLORS.high },
    { name: "Média", value: clients.filter((c) => c.priority === "medium").length, fill: PRIORITY_COLORS.medium },
    { name: "Baixa", value: clients.filter((c) => c.priority === "low").length, fill: PRIORITY_COLORS.low },
  ];

  const funnelData = STAGES.map((s) => ({
    name: s.label,
    clientes: clients.filter((c) => c.stage === s.key).length,
    fill: STAGE_COLORS[s.key],
  }));

  const recentClients = [...clients].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const urgentClients = clients.filter((c) => c.priority === "high" && c.stage !== "finalized");

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Visão geral completa dos seus leads e contratos</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard icon={<Users className="h-4 w-4 text-primary" />} label="Total Leads" value={totalLeads} tooltip="Número total de clientes cadastrados em todas as etapas" onClick={() => navigate("/stage/potential")} />
        <KPICard icon={<Handshake className="h-4 w-4 text-status-negotiation" />} label="Em Negociação" value={inNegotiation} tooltip="Clientes que estão em processo de negociação ativa" onClick={() => navigate("/stage/negotiation")} />
        <KPICard icon={<CheckCircle className="h-4 w-4 text-status-finalized" />} label="Finalizados" value={finalized} tooltip="Contratos concluídos com pagamento confirmado" onClick={() => navigate("/pos-vendas")} />
        <KPICard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="Alta Prioridade" value={highPriority} tooltip="Clientes marcados com prioridade alta que precisam de atenção" />
        <KPICard icon={<TrendingUp className="h-4 w-4 text-status-finalized" />} label="Taxa Conversão" value={`${conversionRate}%`} tooltip="Percentual de leads que chegaram à etapa finalizada" />
        <KPICard icon={<MessageSquare className="h-4 w-4 text-primary" />} label="Média Coment." value={avgComments} tooltip="Média de comentários por cliente, indica engajamento da equipe" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 lg:col-span-2 cursor-default">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" /> Funil de Vendas
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                  />
                  <Bar dataKey="clientes" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="clientes" position="right" fill="hsl(var(--muted-foreground))" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Quantidade de clientes em cada etapa do pipeline</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
              <h3 className="font-semibold text-sm mb-4">Distribuição por Etapa</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    {stageDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Proporção de clientes em cada etapa do funil</p></TooltipContent>
        </Tooltip>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
              <h3 className="font-semibold text-sm mb-4">Distribuição por Prioridade</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="top" fill="hsl(var(--muted-foreground))" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Quantos clientes estão em cada nível de prioridade</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Clientes Urgentes
              </h3>
              {urgentClients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum cliente urgente no momento.</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {urgentClients.map((c) => (
                    <div key={c.id} onClick={() => setSelectedClientId(c.id)} className="flex items-center justify-between gap-2 border rounded-md p-2.5 sm:p-3 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.company}</p>
                      </div>
                      <StageBadge stage={c.stage} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Clientes com prioridade alta que ainda não foram finalizados</p></TooltipContent>
        </Tooltip>
      </div>

      {/* Recent activity */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Atividade Recente
            </h3>
            {/* Mobile: card layout, Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Empresa</th>
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Prioridade</th>
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Atualizado</th>
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Coment.</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClients.map((client) => (
                    <tr key={client.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5 font-medium truncate max-w-[120px]">{client.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[100px]">{client.company}</td>
                      <td className="px-3 py-2.5"><StageBadge stage={client.stage} /></td>
                      <td className="px-3 py-2.5 hidden md:table-cell"><PriorityBadge priority={client.priority} /></td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{timeAgo(client.updatedAt)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{client.comments.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {recentClients.map((client) => (
                <div key={client.id} className="border rounded-md p-3 bg-muted/10">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{client.name}</span>
                    <PriorityBadge priority={client.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{client.company}</p>
                  <div className="flex items-center justify-between gap-2">
                    <StageBadge stage={client.stage} />
                    <span className="text-xs text-muted-foreground">{timeAgo(client.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent><p className="text-xs">Os 5 clientes com atualização mais recente</p></TooltipContent>
      </Tooltip>
    </div>
  );
}

function KPICard({ icon, label, value, tooltip }: { icon: React.ReactNode; label: string; value: number | string; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="border rounded-lg bg-card p-3 sm:p-4 cursor-default">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">{icon}<span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{label}</span></div>
          <p className="text-lg sm:text-xl font-bold">{value}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">{tooltip}</p></TooltipContent>
    </Tooltip>
  );
}
