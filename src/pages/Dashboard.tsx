import { useCRM } from "@/contexts/CRMContext";
import { STAGES, Stage } from "@/types/crm";
import { timeAgo, formatDate } from "@/lib/dateUtils";
import { StageBadge } from "@/components/StageBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Users, Handshake, CheckCircle, AlertTriangle, MessageSquare, TrendingUp, Clock, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const STAGE_COLORS: Record<Stage, string> = {
  potential: "#2563EB",
  negotiation: "#8B5CF6",
  parametrization: "#F59E0B",
  analysis: "#F59E0B",
  payment: "#2563EB",
  finalized: "#10B981",
};

const PRIORITY_COLORS = { high: "#EF4444", medium: "#2563EB", low: "#94A3B8" };

export default function Dashboard() {
  const { clients } = useCRM();

  const totalLeads = clients.length;
  const inNegotiation = clients.filter((c) => c.stage === "negotiation").length;
  const finalized = clients.filter((c) => c.stage === "finalized").length;
  const highPriority = clients.filter((c) => c.priority === "high").length;
  const totalComments = clients.reduce((sum, c) => sum + c.comments.length, 0);

  // Stage distribution for pie chart
  const stageDistribution = STAGES.map((s) => ({
    name: s.label,
    value: clients.filter((c) => c.stage === s.key).length,
    color: STAGE_COLORS[s.key],
  })).filter((d) => d.value > 0);

  // Priority distribution for bar chart
  const priorityData = [
    { name: "Alta", value: clients.filter((c) => c.priority === "high").length, fill: PRIORITY_COLORS.high },
    { name: "Média", value: clients.filter((c) => c.priority === "medium").length, fill: PRIORITY_COLORS.medium },
    { name: "Baixa", value: clients.filter((c) => c.priority === "low").length, fill: PRIORITY_COLORS.low },
  ];

  // Stage funnel data for bar chart
  const funnelData = STAGES.map((s) => ({
    name: s.label.length > 15 ? s.label.substring(0, 15) + "…" : s.label,
    clientes: clients.filter((c) => c.stage === s.key).length,
    fill: STAGE_COLORS[s.key],
  }));

  // Conversion rate (finalized / total)
  const conversionRate = totalLeads > 0 ? ((finalized / totalLeads) * 100).toFixed(1) : "0";

  // Average comments per client
  const avgComments = totalLeads > 0 ? (totalComments / totalLeads).toFixed(1) : "0";

  // Recently updated clients
  const recentClients = [...clients].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  // Clients with high priority not yet finalized
  const urgentClients = clients.filter((c) => c.priority === "high" && c.stage !== "finalized");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral completa dos seus leads e contratos</p>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard icon={<Users className="h-4 w-4 text-primary" />} label="Total Leads" value={totalLeads} />
        <KPICard icon={<Handshake className="h-4 w-4 text-status-negotiation" />} label="Em Negociação" value={inNegotiation} />
        <KPICard icon={<CheckCircle className="h-4 w-4 text-status-finalized" />} label="Finalizados" value={finalized} />
        <KPICard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="Alta Prioridade" value={highPriority} />
        <KPICard icon={<TrendingUp className="h-4 w-4 text-status-finalized" />} label="Taxa Conversão" value={`${conversionRate}%`} />
        <KPICard icon={<MessageSquare className="h-4 w-4 text-primary" />} label="Média Comentários" value={avgComments} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel */}
        <div className="border rounded-lg bg-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" /> Funil de Vendas
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="clientes" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie - stage distribution */}
        <div className="border rounded-lg bg-card p-5">
          <h3 className="font-semibold text-sm mb-4">Distribuição por Etapa</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stageDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {stageDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second row: Priority + Urgent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority distribution */}
        <div className="border rounded-lg bg-card p-5">
          <h3 className="font-semibold text-sm mb-4">Distribuição por Prioridade</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Urgent clients */}
        <div className="border rounded-lg bg-card p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Clientes Urgentes
          </h3>
          {urgentClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum cliente urgente no momento.</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {urgentClients.map((c) => (
                <div key={c.id} className="flex items-center justify-between border rounded-md p-3 bg-destructive/5">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.company}</p>
                  </div>
                  <StageBadge stage={c.stage} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="border rounded-lg bg-card p-5">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Atividade Recente
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Empresa</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Prioridade</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Atualizado</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Comentários</th>
              </tr>
            </thead>
            <tbody>
              {recentClients.map((client) => (
                <tr key={client.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{client.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{client.company}</td>
                  <td className="px-4 py-2.5"><StageBadge stage={client.stage} /></td>
                  <td className="px-4 py-2.5 hidden md:table-cell"><PriorityBadge priority={client.priority} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{timeAgo(client.updatedAt)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{client.comments.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="border rounded-lg bg-card p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
