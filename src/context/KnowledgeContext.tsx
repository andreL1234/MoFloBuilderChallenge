"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Knowledge } from "@/types/knowledge";

interface KnowledgeContextType {
  currentKnowledge: Knowledge | null;
  knowledgeList: Knowledge[];
  isLoading: boolean;
  error: string | null;
  setCurrentKnowledge: (knowledge: Knowledge | null) => void;
  addKnowledge: (knowledge: Knowledge) => void;
  updateKnowledge: (knowledge: Knowledge) => void;
  deleteKnowledge: (id: string) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(
  undefined
);

export function KnowledgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentKnowledge, setCurrentKnowledge] = useState<Knowledge | null>(
    null
  );
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("knowledgeList");
    if (stored) {
      try {
        setKnowledgeList(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to load knowledge list from localStorage", err);
      }
    }
  }, []);

  // Save to localStorage when list changes
  useEffect(() => {
    localStorage.setItem("knowledgeList", JSON.stringify(knowledgeList));
  }, [knowledgeList]);

  const addKnowledge = (knowledge: Knowledge) => {
    setKnowledgeList((prev) => [...prev, knowledge]);
    setCurrentKnowledge(null);
  };

  const updateKnowledge = (knowledge: Knowledge) => {
    setKnowledgeList((prev) =>
      prev.map((k) => (k.id === knowledge.id ? knowledge : k))
    );
    setCurrentKnowledge(null);
  };

  const deleteKnowledge = (id: string) => {
    setKnowledgeList((prev) => prev.filter((k) => k.id !== id));
    if (currentKnowledge?.id === id) {
      setCurrentKnowledge(null);
    }
  };

  return (
    <KnowledgeContext.Provider
      value={{
        currentKnowledge,
        knowledgeList,
        isLoading,
        error,
        setCurrentKnowledge,
        addKnowledge,
        updateKnowledge,
        deleteKnowledge,
        setError,
        setIsLoading,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error("useKnowledge must be used within KnowledgeProvider");
  }
  return context;
}
