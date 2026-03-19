export type Stage =
  | "potential"
  | "negotiation"
  | "parametrization"
  | "analysis"
  | "payment"
  | "finalized";

export const STAGES: { key: Stage; label: string }[] = [
  { key: "potential", label: "Clientes em Potencial" },
  { key: "negotiation", label: "Em Negociação" },
  { key: "parametrization", label: "Parametrização" },
  { key: "analysis", label: "Período de Análise" },
  { key: "payment", label: "Aguardando Pagamento" },
  { key: "finalized", label: "Finalizado" },
];

export const STAGE_INDEX: Record<Stage, number> = {
  potential: 0,
  negotiation: 1,
  parametrization: 2,
  analysis: 3,
  payment: 4,
  finalized: 5,
};

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  addedAt: string;
  addedBy: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: Stage;
  priority: "low" | "medium" | "high";
  updatedAt: string;
  createdAt: string;
  comments: Comment[];
  attachments: Attachment[];
}
