import { useLocation, useNavigate } from "react-router-dom";
import { STAGES } from "@/types/crm";
import { cn } from "@/lib/utils";
import { UserCircle, Handshake, Settings2, SearchCheck, Clock, CheckCircle2 } from "lucide-react";

const stageIcons: Record<string, React.ElementType> = {
  potential: UserCircle,
  negotiation: Handshake,
  parametrization: Settings2,
  analysis: SearchCheck,
  payment: Clock,
  finalized: CheckCircle2,
};

export function PipelineTopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentStage = location.pathname.startsWith("/stage/")
    ? location.pathname.split("/stage/")[1]
    : null;

  return (
    <div className="w-full border-b bg-card/80 backdrop-blur-sm px-2 sm:px-4 overflow-x-auto shrink-0">
      <nav className="flex items-center gap-1 py-1.5 min-w-max">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
          Pipeline
        </span>
        {STAGES.map((stage, idx) => {
          const Icon = stageIcons[stage.key];
          const isActive = currentStage === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => navigate(`/stage/${stage.key}`)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span className="hidden sm:inline">{stage.label}</span>
              <span className="sm:hidden">{stage.label.split(" ").pop()}</span>
              {idx < STAGES.length - 1 && (
                <span className="ml-1 text-muted-foreground/30 hidden md:inline">›</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
