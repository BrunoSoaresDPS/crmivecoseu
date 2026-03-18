import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(dateStr: string) {
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(dateStr: string) {
  return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `${days} dias atrás`;
}
