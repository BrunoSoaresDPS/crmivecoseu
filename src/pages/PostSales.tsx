import { useCRM } from "@/contexts/CRMContext";
import { timeAgo, formatDateTime } from "@/lib/dateUtils";
import { StageBadge } from "@/components/StageBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, MessageSquare, Paperclip, ChevronDown, ChevronUp, User, FileText, Download } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function PostSales() {
  const { clients, setSelectedClientId } = useCRM();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const finalizedClients = clients
    .filter((c) => c.stage === "finalized")
    .filter((c) => {
      if (!search) return true;
      return c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleExport = () => {
    const data = finalizedClients.map((c) => ({
      Nome: c.name,
      Empresa: c.company,
      Email: c.email,
      Telefone: c.phone,
      Prioridade: c.priority === "high" ? "Alta" : c.priority === "medium" ? "Média" : "Baixa",
      "Data Criação": new Date(c.createdAt).toLocaleDateString("pt-BR"),
      "Última Atualização": new Date(c.updatedAt).toLocaleDateString("pt-BR"),
      Comentários: c.comments.length,
      Anexos: c.attachments.length,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pós-Vendas");
    XLSX.writeFile(wb, "relatorio-pos-vendas.xlsx");
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Pós-Vendas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Clientes finalizados com histórico completo · {finalizedClients.length} cliente{finalizedClients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={finalizedClients.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Exportar relatório de pós-vendas em Excel</p></TooltipContent>
        </Tooltip>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-3">
        {finalizedClients.map((client) => {
          const isExpanded = expandedId === client.id;
          return (
            <div key={client.id} className="border-l-[3px] border-l-status-finalized bg-card border border-border rounded-lg overflow-hidden">
              <div
                className="p-3 sm:p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : client.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm sm:text-base truncate">{client.name}</span>
                    <PriorityBadge priority={client.priority} />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{client.company}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{timeAgo(client.updatedAt)}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {client.comments.length}</span>
                    <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> {client.attachments.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedClientId(client.id); }}>
                        Detalhes
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Abrir painel completo do cliente</p></TooltipContent>
                  </Tooltip>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/10 p-3 sm:p-4 space-y-4">
                  {/* Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground text-xs">Email:</span> <span className="block truncate">{client.email || "—"}</span></div>
                    <div><span className="text-muted-foreground text-xs">Telefone:</span> <span className="block">{client.phone || "—"}</span></div>
                    <div><span className="text-muted-foreground text-xs">Criado em:</span> <span className="block">{formatDateTime(client.createdAt)}</span></div>
                    <div><span className="text-muted-foreground text-xs">Finalizado em:</span> <span className="block">{formatDateTime(client.updatedAt)}</span></div>
                  </div>

                  {/* Comments timeline */}
                  {client.comments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Histórico de Comentários
                      </h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {[...client.comments].reverse().map((comment) => (
                          <div key={comment.id} className="border rounded-md p-2.5 bg-card text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{comment.author}</span>
                              <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(comment.createdAt)}</span>
                            </div>
                            <p className="text-xs sm:text-sm">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {client.attachments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" /> Anexos
                      </h4>
                      <div className="space-y-1.5">
                        {client.attachments.map((att) => (
                          <div key={att.id} className="flex items-center gap-2 border rounded-md p-2 bg-card text-sm">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate flex-1 text-xs">{att.name}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(att.url, "_blank")}>
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {finalizedClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            Nenhum cliente finalizado encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
