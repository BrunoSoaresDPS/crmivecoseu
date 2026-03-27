import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCRM } from "@/contexts/CRMContext";
import { Stage, STAGES } from "@/types/crm";
import { timeAgo } from "@/lib/dateUtils";
import { StageBadge } from "@/components/StageBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ArrowRight, ArrowLeft, MessageSquare, Paperclip, Upload, Download, Trash2, MoveRight } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { AddClientDialog } from "@/components/AddClientDialog";

export default function StagePage() {
  const { stageKey } = useParams<{ stageKey: string }>();
  const { clients, setSelectedClientId, moveClient, setClientStage, importClients, deleteClient } = useCRM();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stage = STAGES.find((s) => s.key === stageKey);
  if (!stage) return <div className="p-6 text-muted-foreground">Etapa não encontrada.</div>;

  const stageIndex = STAGES.findIndex((s) => s.key === stageKey);
  const prevStage = stageIndex > 0 ? STAGES[stageIndex - 1] : null;
  const nextStage = stageIndex < STAGES.length - 1 ? STAGES[stageIndex + 1] : null;

  const stageClients = clients.filter((c) => {
    if (c.stage !== stageKey) return false;
    if (!search) return true;
    return c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
  });

  const borderClassMap: Record<Stage, string> = {
    potential: "border-l-status-potential",
    negotiation: "border-l-status-negotiation",
    parametrization: "border-l-status-parametrization",
    analysis: "border-l-status-analysis",
    payment: "border-l-status-payment",
    finalized: "border-l-status-finalized",
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === stageClients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(stageClients.map((c) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    selectedIds.forEach((id) => deleteClient(id));
    setSelectedIds(new Set());
    toast.success(`${count} lead(s) excluído(s) com sucesso.`);
  };

  const handleBulkMove = (targetStage: Stage) => {
    const count = selectedIds.size;
    const targetLabel = STAGES.find((s) => s.key === targetStage)?.label || targetStage;
    selectedIds.forEach((id) => setClientStage(id, targetStage));
    setSelectedIds(new Set());
    toast.success(`${count} lead(s) movido(s) para "${targetLabel}".`);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) {
          toast.error("A planilha está vazia.");
          return;
        }

        const mapColumn = (row: Record<string, string>, keys: string[]): string => {
          for (const key of Object.keys(row)) {
            const k = key.toLowerCase().trim();
            if (keys.some((target) => k.includes(target))) return String(row[key] || "").trim();
          }
          return "";
        };

        const parsedClients = rows
          .map((row) => ({
            name: mapColumn(row, ["contato_nome", "contato", "nome", "name", "cliente", "client"]),
            company: mapColumn(row, ["nome_empresa", "empresa", "company", "razão", "razao", "companhia"]),
            email: mapColumn(row, ["contato_email", "email", "e-mail", "mail"]),
            phone: mapColumn(row, ["contato_telefone", "contato_celular", "telefone", "phone", "celular", "tel", "fone"]),
            chassi: mapColumn(row, ["chassi", "chassis", "chasssis"]),
            especialista: mapColumn(row, ["especialista", "responsável", "responsavel", "consultor", "pos_venda_nome"]),
            implemento: mapColumn(row, ["implemento", "implement", "veiculo_descricao"]),
            modelo: mapColumn(row, ["modelo", "model"]),
            priority: "medium" as const,
          }))
          .filter((c) => c.name);

        if (parsedClients.length === 0) {
          toast.error("Nenhum cliente válido encontrado. Verifique se há uma coluna 'Nome'.");
          return;
        }

        const result = importClients(parsedClients);
        toast.success(
          `Importação concluída: ${result.imported} adicionados, ${result.duplicates} duplicados removidos (de ${result.total} total).`
        );
      } catch {
        toast.error("Erro ao processar o arquivo. Verifique o formato.");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{stage.label}</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-semibold bg-muted text-muted-foreground rounded-full px-3 py-0.5 cursor-default">
                  {stageClients.length}
                </span>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Total de clientes nesta etapa</p></TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {prevStage && <span>← {prevStage.label}</span>}
            {prevStage && nextStage && <span className="mx-2">·</span>}
            {nextStage && <span>{nextStage.label} →</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {stageKey === "potential" && (
            <>
              <AddClientDialog />
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelImport}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Importar Excel
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Importar clientes de uma planilha Excel (.xlsx, .xls, .csv)</p></TooltipContent>
              </Tooltip>
            </>
          )}

          {stageKey === "parametrization" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => {
                  const paramClients = clients.filter((c) => c.stage === "parametrization");
                  const data = paramClients.map((c) => ({
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
                  XLSX.utils.book_append_sheet(wb, ws, "Parametrização");
                  XLSX.writeFile(wb, "relatorio-parametrizacao.xlsx");
                  toast.success("Relatório de parametrização exportado com sucesso!");
                }}>
                  <Download className="h-4 w-4 mr-2" /> Exportar Relatório
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar relatório da parametrização em Excel</p></TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Filtre clientes por nome ou empresa</p></TooltipContent>
        </Tooltip>

        {stageClients.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleSelectAll}>
              {selectedIds.size === stageClients.length ? "Desmarcar todos" : "Selecionar todos"}
            </Button>
            {selectedIds.size > 0 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <MoveRight className="h-3.5 w-3.5" />
                      Mover ({selectedIds.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {STAGES.filter((s) => s.key !== stageKey).map((s) => (
                      <DropdownMenuItem key={s.key} onClick={() => handleBulkMove(s.key)}>
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir leads selecionados</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir <strong>{selectedIds.size} lead(s)</strong>? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBulkDelete}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {stageClients.map((client) => (
          <div
            key={client.id}
            className={`border-l-[3px] ${borderClassMap[client.stage]} bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow ${selectedIds.has(client.id) ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
          >
            <Checkbox
              checked={selectedIds.has(client.id)}
              onCheckedChange={() => toggleSelect(client.id)}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{client.name}</span>
                <PriorityBadge priority={client.priority} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{client.company}</p>
              {(client.especialista || client.modelo) && (
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  {client.especialista && <span>Resp: {client.especialista}</span>}
                  {client.modelo && <span>Modelo: {client.modelo}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default">{timeAgo(client.updatedAt)}</span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Data da última atualização deste cliente</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-default">
                      <MessageSquare className="h-3 w-3" /> {client.comments.length}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Número de comentários registrados</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-default">
                      <Paperclip className="h-3 w-3" /> {client.attachments.length}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Arquivos anexados a este lead</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={stageIndex === 0} onClick={() => moveClient(client.id, "prev")}>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Retornar para a etapa anterior{prevStage ? `: ${prevStage.label}` : ""}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={stageIndex === STAGES.length - 1} onClick={() => moveClient(client.id, "next")}>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Avançar para a próxima etapa{nextStage ? `: ${nextStage.label}` : ""}</p></TooltipContent>
              </Tooltip>
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Excluir este lead</p></TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir lead</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir <strong>{client.name}</strong>? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
                      deleteClient(client.id);
                      toast.success(`Lead "${client.name}" excluído com sucesso.`);
                    }}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedClientId(client.id)} className="ml-1">
                    Detalhes
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Abrir painel com informações completas, edição e comentários</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
        {stageClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            Nenhum cliente nesta etapa.
          </div>
        )}
      </div>
    </div>
  );
}