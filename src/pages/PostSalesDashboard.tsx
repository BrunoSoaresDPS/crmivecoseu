import { useCRM } from "@/contexts/CRMContext";
import { STAGES } from "@/types/crm";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LabelList } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Clock, MessageSquare, Paperclip, TrendingUp, Award, BarChart3, Calendar } from "lucide-react";

const PRIORITY_COLORS = { high: "#1E3A8A", medium: "#3B82F6", low: "#BFDBFE" };
const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function PostSalesDashboard() {
  const { clients } = useCRM();

  const finalized = clients.filter((c) => c.stage === "finalized");
  const totalFinalized = finalized.length;
  const totalClients = clients.length;
  const conversionRate = totalClients > 0 ? ((totalFinalized / totalClients) * 100).toFixed(1) : "0";

  // Average time from creation to finalization (days)
  const avgDays = totalFinalized > 0
    ? (finalized.reduce((sum, c) => {
        const created = new Date(c.createdAt).getTime();
        const updated = new Date(c.updatedAt).getTime();
        return sum + (updated - created) / (1000 * 60 * 60 * 24);
      }, 0) / totalFinalized).toFixed(1)
    : "0";

  const totalComments = finalized.reduce((sum, c) => sum + c.comments.length, 0);
  const totalAttachments = finalized.reduce((sum, c) => sum + c.attachments.length, 0);
  const avgComments = totalFinalized > 0 ? (totalComments / totalFinalized).toFixed(1) : "0";

  // Priority distribution
  const priorityData = [
    { name: "Alta", value: finalized.filter((c) => c.priority === "high").length, fill: PRIORITY_COLORS.high },
    { name: "Média", value: finalized.filter((c) => c.priority === "medium").length, fill: PRIORITY_COLORS.medium },
    { name: "Baixa", value: finalized.filter((c) => c.priority === "low").length, fill: PRIORITY_COLORS.low },
  ];

  // Finalized per month
  const monthMap = new Map<string, number>();
  finalized.forEach((c) => {
    const d = new Date(c.updatedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  });
  const monthData = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, count]) => {
      const [year, month] = key.split("-");
      return { name: `${MONTH_NAMES[parseInt(month)]}/${year.slice(2)}`, contratos: count };
    });

  // Top companies
  const companyMap = new Map<string, number>();
  finalized.forEach((c) => {
    if (c.company) companyMap.set(c.company, (companyMap.get(c.company) || 0) + 1);
  });
  const topCompanies = [...companyMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, contratos: count }));

  // Most engaged (most comments)
  const mostEngaged = [...finalized].sort((a, b) => b.comments.length - a.comments.length).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard Pós-Vendas</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Insights dos contratos finalizados</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard icon={<Users className="h-4 w-4 text-primary" />} label="Finalizados" value={totalFinalized} tooltip="Total de contratos finalizados" />
        <KPICard icon={<TrendingUp className="h-4 w-4 text-status-finalized" />} label="Taxa Conversão" value={`${conversionRate}%`} tooltip="Percentual de leads convertidos em contratos finalizados" />
        <KPICard icon={<Clock className="h-4 w-4 text-primary" />} label="Tempo Médio" value={`${avgDays}d`} tooltip="Dias médios entre criação e finalização do contrato" />
        <KPICard icon={<MessageSquare className="h-4 w-4 text-primary" />} label="Média Coment." value={avgComments} tooltip="Média de comentários por cliente finalizado" />
        <KPICard icon={<Paperclip className="h-4 w-4 text-muted-foreground" />} label="Total Anexos" value={totalAttachments} tooltip="Total de arquivos anexados aos contratos finalizados" />
        <KPICard icon={<Award className="h-4 w-4 text-primary" />} label="Total Interações" value={totalComments} tooltip="Total de comentários registrados nos contratos finalizados" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Finalized per month */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Contratos por Mês
              </h3>
              {monthData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados suficientes.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                    <Bar dataKey="contratos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="contratos" position="top" fill="hsl(var(--muted-foreground))" fontSize={11} fontWeight={600} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Quantidade de contratos finalizados por mês</p></TooltipContent>
        </Tooltip>

        {/* Priority distribution */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
              <h3 className="font-semibold text-sm mb-4">Prioridade dos Finalizados</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="45%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ value, percent }) => percent > 0.05 ? `${value}` : null}
                    labelLine={false}
                  >
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Distribuição de prioridade entre contratos finalizados</p></TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Top companies */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" /> Top Empresas
              </h3>
              {topCompanies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topCompanies} layout="vertical" margin={{ left: 10, right: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                    <Bar dataKey="contratos" fill="#1D4ED8" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="contratos" position="right" fill="hsl(var(--muted-foreground))" fontSize={11} fontWeight={600} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Empresas com mais contratos finalizados</p></TooltipContent>
        </Tooltip>

        {/* Most engaged clients */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border rounded-lg bg-card p-4 sm:p-5 cursor-default">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" /> Clientes Mais Engajados
              </h3>
              {mostEngaged.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados.</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {mostEngaged.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 border rounded-md p-2.5 bg-muted/20">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.company}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {c.comments.length}</span>
                        <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> {c.attachments.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Clientes finalizados com mais interações registradas</p></TooltipContent>
        </Tooltip>
      </div>
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
