import React, { createContext, useContext, useState, useCallback } from "react";
import { Client, Comment, Attachment, Stage, STAGE_INDEX, STAGES } from "@/types/crm";
import { mockClients } from "@/data/mockClients";

interface CRMContextType {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  moveClient: (clientId: string, direction: "next" | "prev") => void;
  setClientStage: (clientId: string, stage: Stage) => void;
  addComment: (clientId: string, text: string, author: string) => void;
  updateClient: (clientId: string, updates: Partial<Pick<Client, "name" | "company" | "email" | "phone" | "priority">>) => void;
  addAttachment: (clientId: string, attachment: Omit<Attachment, "id" | "addedAt">) => void;
  removeAttachment: (clientId: string, attachmentId: string) => void;
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

  return (
    <CRMContext.Provider
      value={{ clients, selectedClientId, setSelectedClientId, moveClient, setClientStage, addComment, updateClient, selectedClient }}
    >
      {children}
    </CRMContext.Provider>
  );
};
