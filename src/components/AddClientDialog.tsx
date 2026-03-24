import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCRM } from "@/contexts/CRMContext";
type Priority = "low" | "medium" | "high";

export function AddClientDialog() {
  const { importClients } = useCRM();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chassi, setChassi] = useState("");
  const [especialista, setEspecialista] = useState("");
  const [implemento, setImplemento] = useState("");
  const [modelo, setModelo] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const resetForm = () => {
    setName(""); setCompany(""); setEmail(""); setPhone("");
    setChassi(""); setEspecialista(""); setImplemento(""); setModelo("");
    setPriority("medium");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) { toast.error("O nome do cliente é obrigatório."); return; }

    const result = importClients([{
      name: trimmedName, company: company.trim(), email: email.trim(), phone: phone.trim(),
      chassi: chassi.trim(), especialista: especialista.trim(), implemento: implemento.trim(), modelo: modelo.trim(),
      priority,
    }]);

    if (result.duplicates > 0) {
      toast.warning("Este cliente já existe na base.");
    } else {
      toast.success(`Cliente "${trimmedName}" adicionado com sucesso!`);
      resetForm();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" /> Adicionar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente em Potencial</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="client-name">Nome *</Label>
            <Input id="client-name" placeholder="Nome do cliente" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-company">Empresa</Label>
            <Input id="client-company" placeholder="Nome da empresa" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={100} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-email">E-mail</Label>
              <Input id="client-email" type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Telefone</Label>
              <Input id="client-phone" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-chassi">Chassi</Label>
              <Input id="client-chassi" placeholder="Número do chassi" value={chassi} onChange={(e) => setChassi(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-modelo">Modelo</Label>
              <Input id="client-modelo" placeholder="Modelo do veículo" value={modelo} onChange={(e) => setModelo(e.target.value)} maxLength={100} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-especialista">Especialista Responsável</Label>
              <Input id="client-especialista" placeholder="Nome do especialista" value={especialista} onChange={(e) => setEspecialista(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-implemento">Implemento</Label>
              <Input id="client-implemento" placeholder="Tipo de implemento" value={implemento} onChange={(e) => setImplemento(e.target.value)} maxLength={100} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
