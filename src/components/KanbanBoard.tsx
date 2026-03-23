import { useCRM } from "@/contexts/CRMContext";
import { STAGES, Stage } from "@/types/crm";
import { timeAgo } from "@/lib/dateUtils";
import { StageBadge } from "@/components/StageBadge";
import { PriorityBadge } from "@/components/PriorityBadge";

const borderMap: Record<Stage, string> = {
  potential: "kanban-border-potential",
  negotiation: "kanban-border-negotiation",
  parametrization: "kanban-border-parametrization",
  analysis: "kanban-border-analysis",
  payment: "kanban-border-payment",
  finalized: "kanban-border-finalized",
};

const headerMap: Record<Stage, string> = {
  potential: "column-header-potential",
  negotiation: "column-header-negotiation",
  parametrization: "column-header-parametrization",
  analysis: "column-header-analysis",
  payment: "column-header-payment",
  finalized: "column-header-finalized",
};

export function KanbanBoard() {
  const { clients, setSelectedClientId } = useCRM();

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 min-h-0 flex-1 snap-x snap-mandatory sm:snap-none">
      {STAGES.map((stage) => {
        const stageClients = clients.filter((c) => c.stage === stage.key);
        return (
          <div key={stage.key} className="flex flex-col min-w-[240px] sm:min-w-[280px] w-[240px] sm:w-[280px] shrink-0 snap-start">
            <div className={`sticky top-0 z-10 rounded-md px-3 py-2 mb-3 flex items-center justify-between ${headerMap[stage.key]}`}>
              <span className="font-semibold text-sm">{stage.label}</span>
              <span className="text-xs font-bold rounded-full px-2 py-0.5 bg-background/50">
                {stageClients.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {stageClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`border-l-[3px] ${borderMap[client.stage]} bg-card border border-border rounded-md p-3 text-left hover:shadow-sm transition-shadow duration-150 cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground truncate">{client.name}</span>
                    <PriorityBadge priority={client.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                  <p className="text-xs text-muted-foreground mt-2">{timeAgo(client.updatedAt)}</p>
                </button>
              ))}
              {stageClients.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-md">
                  Nenhum cliente
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
