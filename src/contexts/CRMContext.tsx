import React, { createContext, useContext, useState, useCallback } from "react";
import { Client, Comment, Attachment, Stage, STAGE_INDEX, STAGES } from "@/types/crm";
import { mockClients } from "@/data/mockClients";

export interface ImportResult {
  imported: number;
  duplicates: number;
  total: number;
}

interface CRMContextType {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  moveClient: (clientId: string, direction: "next" | "prev") => void;
  setClientStage: (clientId: string, stage: Stage) => void;
  addComment: (clientId: string, text: string, author: string) => void;
  updateClient: (clientId: string, updates: Partial<Pick<Client, "name" | "company" | "email" | "phone" | "priority" | "chassi" | "especialista" | "implemento" | "modelo">>) => void;
  addAttachment: (clientId: string, attachment: Omit<Attachment, "id" | "addedAt">) => void;
  removeAttachment: (clientId: string, attachmentId: string) => void;
  importClients: (newClients: Omit<Client, "id" | "stage" | "updatedAt" | "createdAt" | "comments" | "attachments">[]) => ImportResult;
  deleteClient: (clientId: string) => void;
  selectedClient: Client | null;
}

const CRMContext = createContext<CRMContextType | null>(null);

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error("useCRM must be used within CRMProvider");
  return ctx;
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  const moveClient = useCallback((clientId: string, direction: "next" | "prev") => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const idx = STAGE_INDEX[c.stage];
        const newIdx = direction === "next" ? idx + 1 : idx - 1;
        if (newIdx < 0 || newIdx >= STAGES.length) return c;
        return { ...c, stage: STAGES[newIdx].key, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const setClientStage = useCallback((clientId: string, stage: Stage) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, stage, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const addComment = useCallback((clientId: string, text: string, author: string) => {
    const comment: Comment = {
      id: crypto.randomUUID(),
      text,
      author,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, comments: [...c.comments, comment], updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  const updateClient = useCallback(
    (clientId: string, updates: Partial<Pick<Client, "name" | "company" | "email" | "phone" | "priority">>) => {
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        )
      );
    },
    []
  );

  const addAttachment = useCallback(
    (clientId: string, attachment: Omit<Attachment, "id" | "addedAt">) => {
      const newAttachment: Attachment = {
        ...attachment,
        id: crypto.randomUUID(),
        addedAt: new Date().toISOString(),
      };
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, attachments: [...c.attachments, newAttachment], updatedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  const removeAttachment = useCallback((clientId: string, attachmentId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, attachments: c.attachments.filter((a) => a.id !== attachmentId), updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setSelectedClientId((prev) => (prev === clientId ? null : prev));
  }, []);

  const importClients = useCallback(
    (newClients: Omit<Client, "id" | "stage" | "updatedAt" | "createdAt" | "comments" | "attachments">[]): ImportResult => {
      const now = new Date().toISOString();
      let imported = 0;
      let duplicates = 0;

      setClients((prev) => {
        const existingEmails = new Set(prev.map((c) => c.email.toLowerCase().trim()));
        const existingNames = new Set(prev.map((c) => `${c.name.toLowerCase().trim()}|${c.company.toLowerCase().trim()}`));
        const newEmailsAdded = new Set<string>();

        const clientsToAdd: Client[] = [];

        for (const nc of newClients) {
          const email = nc.email?.toLowerCase().trim() || "";
          const nameKey = `${nc.name.toLowerCase().trim()}|${nc.company.toLowerCase().trim()}`;

          const isDuplicate =
            (email && (existingEmails.has(email) || newEmailsAdded.has(email))) ||
            existingNames.has(nameKey);

          if (isDuplicate) {
            duplicates++;
            continue;
          }

          if (email) newEmailsAdded.add(email);

          clientsToAdd.push({
            id: crypto.randomUUID(),
            name: nc.name,
            company: nc.company || "",
            email: nc.email || "",
            phone: nc.phone || "",
            chassi: (nc as any).chassi || "",
            especialista: (nc as any).especialista || "",
            implemento: (nc as any).implemento || "",
            modelo: (nc as any).modelo || "",
            priority: nc.priority || "medium",
            stage: "potential",
            updatedAt: now,
            createdAt: now,
            comments: [],
            attachments: [],
          });
          imported++;
        }

        return [...prev, ...clientsToAdd];
      });

      return { imported, duplicates, total: newClients.length };
    },
    []
  );

  return (
    <CRMContext.Provider
      value={{ clients, selectedClientId, setSelectedClientId, moveClient, setClientStage, addComment, updateClient, addAttachment, removeAttachment, importClients, deleteClient, selectedClient }}
    >
      {children}
    </CRMContext.Provider>
  );
};
