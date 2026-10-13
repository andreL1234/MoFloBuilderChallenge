"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Knowledge } from "@/types/knowledge";

interface KnowledgeContextType {
  knowledgeList: Knowledge[];
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  addKnowledge: (knowledge: Knowledge) => void;
  updateKnowledge: (knowledge: Knowledge) => void;
  deleteKnowledge: (id: string) => void;
  duplicateKnowledge: (id: string) => Knowledge | null;
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
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("knowledgeList");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setKnowledgeList(parsed);
          console.log("Loaded knowledge list from localStorage:", parsed);
        } catch (err) {
          console.error("Failed to load knowledge list from localStorage", err);
        }
      } else {
        console.log("No knowledge list found in localStorage");
      }
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage when list changes (but skip initial load)
  useEffect(() => {
    if (typeof window !== "undefined" && hasLoadedRef.current) {
      try {
        localStorage.setItem("knowledgeList", JSON.stringify(knowledgeList));
        console.log("Saved knowledge list to localStorage:", knowledgeList);
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
    }
  }, [knowledgeList]);

  // Mark that we've loaded initial data
  useEffect(() => {
    hasLoadedRef.current = true;
  }, [isHydrated]);

  const addKnowledge = (knowledge: Knowledge) => {
    console.log("Adding knowledge:", knowledge);
    setKnowledgeList((prev) => {
      const updated = [...prev, knowledge];
      console.log("Knowledge list after add:", updated);
      return updated;
    });
  };

  const updateKnowledge = (knowledge: Knowledge) => {
    console.log("Updating knowledge:", knowledge);
    setKnowledgeList((prev) => {
      const updated = prev.map((k) => (k.id === knowledge.id ? knowledge : k));
      console.log("Knowledge list after update:", updated);
      return updated;
    });
  };

  const deleteKnowledge = (id: string) => {
    setKnowledgeList((prev) => prev.filter((k) => k.id !== id));
  };

  const duplicateKnowledge = (id: string): Knowledge | null => {
    const existing = knowledgeList.find((k) => k.id === id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const newId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const duplicate: Knowledge = {
      ...existing,
      id: newId,
      companyName: `${existing.companyName} (Copy)`,
      scrapedAt: now,
      updatedAt: now,
    };

    addKnowledge(duplicate);
    return duplicate;
  };

  return (
    <KnowledgeContext.Provider
      value={{
        knowledgeList,
        isHydrated,
        isLoading,
        error,
        addKnowledge,
        updateKnowledge,
        deleteKnowledge,
        duplicateKnowledge,
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
