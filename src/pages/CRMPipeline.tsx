import { KanbanBoard } from "@/components/KanbanBoard";

export default function CRMPipeline() {
  return (
    <div className="p-4 sm:p-6 flex flex-col h-[calc(100vh-3rem)]">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">CRM Pipeline</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Gerencie seus contratos por etapa</p>
      </div>
      <KanbanBoard />
    </div>
  );
}
