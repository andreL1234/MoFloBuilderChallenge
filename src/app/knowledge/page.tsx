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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 shadow-lg">
        <h1 className="text-5xl font-bold mb-3">Build Knowledge Base</h1>
        <p className="text-xl text-blue-100">
          Enter a company website URL to extract and organize their business information
        </p>
      </div>

      {step === "form" && (
        <>
          {/* Mode Toggle */}
          <div className="flex gap-3 bg-white rounded-lg p-2 border border-slate-200 w-fit shadow-sm">
            <button
              onClick={() => setScrapeMode("single")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                scrapeMode === "single"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Single Scrape
            </button>
            <button
              onClick={() => setScrapeMode("batch")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                scrapeMode === "batch"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
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
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-3">How it works:</h3>
                    <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                      <li>Enter a company website URL</li>
                      <li>The scraper will extract key information (industry, business model, positioning, etc.)</li>
                      <li>Review and edit the extracted data</li>
                      <li>Save to your knowledge base</li>
                    </ol>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <BatchScraper
              onScraped={handleBatchScraped}
              onError={setError}
              setIsLoading={setIsLoading}
            />
          )}
        </>
      )}

      {step === "display" && currentKnowledge && (
        <div className="space-y-4">
          <KnowledgeDisplay knowledge={currentKnowledge} onEdit={handleEdit} />
        </div>
      )}

      {step === "edit" && currentKnowledge && (
        <div className="space-y-4">
          <KnowledgeEditor
            knowledge={currentKnowledge}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
