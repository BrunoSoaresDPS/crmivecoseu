import { Stage, STAGES } from "@/types/crm";
import { Badge } from "@/components/ui/badge";

const stageClassMap: Record<Stage, string> = {
  potential: "status-badge-potential",
  negotiation: "status-badge-negotiation",
  parametrization: "status-badge-parametrization",
  analysis: "status-badge-analysis",
  payment: "status-badge-payment",
  finalized: "status-badge-finalized",
};

export function StageBadge({ stage }: { stage: Stage }) {
  const label = STAGES.find((s) => s.key === stage)?.label ?? stage;
  return (
    <Badge variant="secondary" className={`${stageClassMap[stage]} font-medium text-xs border-0`}>
      {label}
    </Badge>
  );
}
