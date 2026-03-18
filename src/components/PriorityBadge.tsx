import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/crm";

const priorityConfig = {
  high: { label: "Alta", className: "bg-destructive/10 text-destructive border-0" },
  medium: { label: "Média", className: "bg-primary/10 text-primary border-0" },
  low: { label: "Baixa", className: "bg-muted text-muted-foreground border-0" },
};

export function PriorityBadge({ priority }: { priority: Client["priority"] }) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="secondary" className={`${config.className} text-xs font-medium`}>
      {config.label}
    </Badge>
  );
}
