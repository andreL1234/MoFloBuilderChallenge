"use client";

import { useState, useEffect } from "react";
import { useKnowledge } from "@/context/KnowledgeContext";
import KnowledgeForm from "@/components/KnowledgeForm";
import KnowledgeDisplay from "@/components/KnowledgeDisplay";
import KnowledgeEditor from "@/components/KnowledgeEditor";
import BatchScraper from "@/components/BatchScraper";
import { Knowledge } from "@/types/knowledge";

type PageStep = "form" | "display" | "edit" | "batch";
type ScrapeMode = "single" | "batch";

export default function KnowledgePage() {
  const { setCurrentKnowledge, currentKnowledge, addKnowledge, updateKnowledge, knowledgeList, isLoading, error, setError, setIsLoading } = useKnowledge();
  const [step, setStep] = useState<PageStep>("form");
  const [scrapeMode, setScrapeMode] = useState<ScrapeMode>("single");

  // When currentKnowledge changes and we navigate here (from /view for editing),
  // start with display step. Otherwise stay in form for new scrapes.
  useEffect(() => {
    if (currentKnowledge && step === "form") {
      setStep("display");
    }
  }, [currentKnowledge]);

  const handleScraped = (knowledge: Knowledge) => {
    setCurrentKnowledge(knowledge);
    setStep("display");
  };

  const handleEdit = () => {
    setStep("edit");
  };

  const handleSave = (knowledge: Knowledge) => {
    // Check if this knowledge base already exists in the list
    const exists = knowledgeList.some((k) => k.id === knowledge.id);

    if (exists) {
      // Update existing knowledge base
      updateKnowledge(knowledge);
    } else {
      // Add new knowledge base
      addKnowledge(knowledge);
    }
    setStep("form");
    alert("Knowledge base saved successfully!");
  };

  const handleCancel = () => {
    setStep("display");
  };

  const handleBatchScraped = (knowledgeList: Knowledge[]) => {
    knowledgeList.forEach((kb) => {
      addKnowledge(kb);
    });
    alert(`Successfully imported ${knowledgeList.length} knowledge base(s)!`);
    setScrapeMode("single");
    setStep("form");
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Fixed background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex-1 flex flex-col">
        {step === "form" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
            <div className="w-full max-w-2xl">
              {/* Title */}
              <h1 className="text-6xl md:text-7xl font-black mb-4 leading-tight text-white drop-shadow-2xl">
                Build Knowledge Base
              </h1>
              <p className="text-xl text-blue-100 mb-12">
                Enter a company website URL to extract and organize their business information
              </p>

              {/* Mode Toggle */}
              <div className="flex gap-3 bg-white/10 backdrop-blur-md rounded-full p-1 w-fit mb-8 border border-white/20">
                <button
                  onClick={() => setScrapeMode("single")}
                  className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                    scrapeMode === "single"
                      ? "bg-white text-blue-900 shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Single Scrape
                </button>
                <button
                  onClick={() => setScrapeMode("batch")}
                  className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                    scrapeMode === "batch"
                      ? "bg-white text-blue-900 shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Batch Scrape
                </button>
              </div>

              {scrapeMode === "single" ? (
                <>
                  <KnowledgeForm
                    onScraped={handleScraped}
                    isLoading={isLoading}
                    error={error}
                    setError={setError}
                    setIsLoading={setIsLoading}
                  />
                </>
              ) : (
                <BatchScraper
                  onScraped={handleBatchScraped}
                  onError={setError}
                  setIsLoading={setIsLoading}
                />
              )}
            </div>
          </div>
        )}

        {step === "display" && currentKnowledge && (
          <div className="flex-1 flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-4xl">
              <KnowledgeDisplay knowledge={currentKnowledge} onEdit={handleEdit} />
            </div>
          </div>
        )}

        {step === "edit" && currentKnowledge && (
          <div className="flex-1 flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-4xl">
              <KnowledgeEditor
                knowledge={currentKnowledge}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
