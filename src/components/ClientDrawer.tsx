import { useState, useRef } from "react";
import { useCRM } from "@/contexts/CRMContext";
import { STAGES, STAGE_INDEX } from "@/types/crm";
import { formatDateTime } from "@/lib/dateUtils";
import { StageBadge } from "@/components/StageBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, MessageSquare, User, Mail, Phone, Edit2, Check, X, Paperclip, FileText, Image, File, Trash2, Upload, Download, Truck, Tag, Wrench, UserCheck } from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <Image className="h-4 w-4 text-primary" />;
  if (type.includes("pdf")) return <FileText className="h-4 w-4 text-destructive" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

export function ClientDrawer() {
  const { selectedClient, setSelectedClientId, moveClient, addComment, updateClient, addAttachment, removeAttachment } = useCRM();
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", company: "", email: "", phone: "", priority: "" as string });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const open = !!selectedClient;

  const handleAddComment = () => {
    if (!selectedClient || !commentText.trim()) return;
    addComment(selectedClient.id, commentText.trim(), "Você");
    setCommentText("");
  };

  const startEdit = () => {
    if (!selectedClient) return;
    setEditForm({
      name: selectedClient.name,
      company: selectedClient.company,
      email: selectedClient.email,
      phone: selectedClient.phone,
      priority: selectedClient.priority,
    });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!selectedClient) return;
    updateClient(selectedClient.id, {
      name: editForm.name,
      company: editForm.company,
      email: editForm.email,
      phone: editForm.phone,
      priority: editForm.priority as "low" | "medium" | "high",
    });
    setEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      addAttachment(selectedClient.id, {
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        addedBy: "Você",
      });
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canPrev = selectedClient ? STAGE_INDEX[selectedClient.stage] > 0 : false;
  const canNext = selectedClient ? STAGE_INDEX[selectedClient.stage] < STAGES.length - 1 : false;

  const prevLabel = selectedClient && canPrev ? STAGES[STAGE_INDEX[selectedClient.stage] - 1].label : "";
  const nextLabel = selectedClient && canNext ? STAGES[STAGE_INDEX[selectedClient.stage] + 1].label : "";

  return (
    <Sheet open={open} onOpenChange={(o) => !o && setSelectedClientId(null)}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {selectedClient && (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg font-semibold truncate">{selectedClient.name}</SheetTitle>
                  <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                </div>
                {!editing ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={startEdit}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Editar informações do cliente</p></TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={saveEdit}><Check className="h-4 w-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">Salvar alterações</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">Cancelar edição</p></TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Tooltip>
                  <TooltipTrigger asChild><span><StageBadge stage={selectedClient.stage} /></span></TooltipTrigger>
                  <TooltipContent><p className="text-xs">Etapa atual do cliente no pipeline</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild><span><PriorityBadge priority={selectedClient.priority} /></span></TooltipTrigger>
                  <TooltipContent><p className="text-xs">Nível de prioridade deste cliente</p></TooltipContent>
                </Tooltip>
              </div>
            </SheetHeader>

            <Separator />

            <div className="p-6 space-y-3">
              {editing ? (
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground">Nome</label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Empresa</label><Input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Email</label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Telefone</label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                  <div>
                    <label className="text-xs text-muted-foreground">Prioridade</label>
                    <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-muted-foreground cursor-default">
                        <Mail className="h-3.5 w-3.5" /> {selectedClient.email}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Email de contato do cliente</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-muted-foreground cursor-default">
                        <Phone className="h-3.5 w-3.5" /> {selectedClient.phone}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Telefone de contato do cliente</p></TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <Separator />

            <div className="px-6 py-4 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => moveClient(selectedClient.id, "prev")}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">{canPrev ? `Mover para: ${prevLabel}` : "Já está na primeira etapa"}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!canNext} onClick={() => moveClient(selectedClient.id, "next")}>
                    Próxima <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">{canNext ? `Mover para: ${nextLabel}` : "Já está na última etapa"}</p></TooltipContent>
              </Tooltip>
            </div>

            <Separator />

            {/* Attachments Section */}
            <div className="p-6 space-y-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-semibold flex items-center gap-2 cursor-default">
                    <Paperclip className="h-4 w-4" /> Anexos ({selectedClient.attachments.length})
                  </h3>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Arquivos anexados a este lead, visíveis em todas as etapas</p></TooltipContent>
              </Tooltip>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Adicionar arquivo
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Faça upload de documentos, imagens ou outros arquivos</p></TooltipContent>
              </Tooltip>

              {selectedClient.attachments.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedClient.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 border rounded-md p-2.5 bg-muted/30 group">
                      {getFileIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} · {attachment.addedBy} · {formatDateTime(attachment.addedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => window.open(attachment.url, "_blank")}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">Abrir/baixar arquivo</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeAttachment(selectedClient.id, attachment.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">Remover anexo</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="flex-1 p-6 flex flex-col min-h-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 cursor-default">
                    <MessageSquare className="h-4 w-4" /> Comentários ({selectedClient.comments.length})
                  </h3>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Histórico de observações e interações sobre este cliente</p></TooltipContent>
              </Tooltip>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {selectedClient.comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
                )}
                {[...selectedClient.comments].reverse().map((comment) => (
                  <div key={comment.id} className="border rounded-md p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Textarea
                      placeholder="Adicionar comentário..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                    />
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Digite sua observação. Pressione Enter para enviar.</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()} className="self-end">
                      Enviar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Registrar comentário no histórico do cliente</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
