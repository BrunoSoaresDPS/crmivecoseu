import { KanbanBoard } from "@/components/KanbanBoard";

export default function CRMPipeline() {
  return (
    <div className="p-6 flex flex-col h-[calc(100vh-3rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">CRM Pipeline</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie seus contratos por etapa</p>
      </div>
      <KanbanBoard />
    </div>
  );
}
