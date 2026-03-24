import { Client } from "@/types/crm";

const now = new Date();
const d = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockClients: Client[] = [
  {
    id: "1", name: "Carlos Silva", company: "TechBrasil Ltda", email: "carlos@techbrasil.com", phone: "(11) 99999-0001",
    chassi: "", especialista: "Ana", implemento: "", modelo: "",
    stage: "potential", priority: "high", updatedAt: d(1), createdAt: d(30), attachments: [],
    comments: [{ id: "c1", text: "Demonstrou interesse na solução enterprise.", author: "Ana", createdAt: d(1) }],
  },
  {
    id: "2", name: "Mariana Costa", company: "Inovação S.A.", email: "mariana@inovacao.com", phone: "(21) 99999-0002",
    chassi: "", especialista: "João", implemento: "", modelo: "",
    stage: "negotiation", priority: "high", updatedAt: d(2), createdAt: d(25), attachments: [],
    comments: [
      { id: "c2", text: "Proposta enviada com desconto de 15%.", author: "João", createdAt: d(5) },
      { id: "c3", text: "Aguardando retorno do jurídico.", author: "Ana", createdAt: d(2) },
    ],
  },
  {
    id: "3", name: "Roberto Almeida", company: "Construtora Horizonte", email: "roberto@horizonte.com", phone: "(31) 99999-0003",
    chassi: "", especialista: "Pedro", implemento: "", modelo: "",
    stage: "parametrization", priority: "medium", updatedAt: d(3), createdAt: d(20), attachments: [],
    comments: [{ id: "c4", text: "Configuração do ambiente em andamento.", author: "Pedro", createdAt: d(3) }],
  },
  {
    id: "4", name: "Fernanda Lima", company: "DigitalMKT", email: "fernanda@digitalmkt.com", phone: "(11) 99999-0004",
    chassi: "", especialista: "Ana", implemento: "", modelo: "",
    stage: "analysis", priority: "low", updatedAt: d(4), createdAt: d(18), attachments: [],
    comments: [{ id: "c5", text: "Cliente em fase de testes.", author: "Ana", createdAt: d(4) }],
  },
  {
    id: "5", name: "André Mendes", company: "Logística Express", email: "andre@logexpress.com", phone: "(41) 99999-0005",
    chassi: "", especialista: "João", implemento: "", modelo: "",
    stage: "payment", priority: "medium", updatedAt: d(1), createdAt: d(40), attachments: [],
    comments: [{ id: "c6", text: "Boleto gerado, aguardando confirmação.", author: "João", createdAt: d(1) }],
  },
  {
    id: "6", name: "Juliana Rocha", company: "EduTech Solutions", email: "juliana@edutech.com", phone: "(51) 99999-0006",
    chassi: "", especialista: "Ana", implemento: "", modelo: "",
    stage: "finalized", priority: "low", updatedAt: d(0), createdAt: d(60), attachments: [],
    comments: [
      { id: "c7", text: "Contrato assinado e pagamento confirmado.", author: "Ana", createdAt: d(2) },
      { id: "c8", text: "Onboarding agendado para próxima semana.", author: "Pedro", createdAt: d(0) },
    ],
  },
  {
    id: "7", name: "Lucas Ferreira", company: "AutoParts BR", email: "lucas@autoparts.com", phone: "(19) 99999-0007",
    chassi: "", especialista: "", implemento: "", modelo: "",
    stage: "potential", priority: "medium", updatedAt: d(5), createdAt: d(10), attachments: [],
    comments: [],
  },
  {
    id: "8", name: "Patricia Santos", company: "FoodTech Inc", email: "patricia@foodtech.com", phone: "(11) 99999-0008",
    chassi: "", especialista: "João", implemento: "", modelo: "",
    stage: "negotiation", priority: "medium", updatedAt: d(3), createdAt: d(15), attachments: [],
    comments: [{ id: "c9", text: "Reunião agendada para sexta-feira.", author: "João", createdAt: d(3) }],
  },
  {
    id: "9", name: "Marcos Oliveira", company: "FinanceiroPlus", email: "marcos@finplus.com", phone: "(21) 99999-0009",
    chassi: "", especialista: "", implemento: "", modelo: "",
    stage: "potential", priority: "low", updatedAt: d(7), createdAt: d(7), attachments: [],
    comments: [],
  },
  {
    id: "10", name: "Camila Souza", company: "HealthCare BR", email: "camila@healthcare.com", phone: "(31) 99999-0010",
    chassi: "", especialista: "Ana", implemento: "", modelo: "",
    stage: "negotiation", priority: "high", updatedAt: d(1), createdAt: d(12), attachments: [],
    comments: [{ id: "c10", text: "Interesse urgente, fechar até fim do mês.", author: "Ana", createdAt: d(1) }],
  },
];
