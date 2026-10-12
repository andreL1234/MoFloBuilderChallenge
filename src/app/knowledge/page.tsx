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
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Build Knowledge Base</h1>
        <p className="text-gray-600">
          Enter a company website URL to extract and organize their business information
        </p>
      </div>

      {step === "form" && (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setScrapeMode("single")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                scrapeMode === "single"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Single Scrape
            </button>
            <button
              onClick={() => setScrapeMode("batch")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                scrapeMode === "batch"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
                  <li>Enter a company website URL</li>
                  <li>The scraper will extract key information</li>
                  <li>Review and edit the extracted data</li>
                  <li>Save to your knowledge base</li>
                </ol>
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
        <KnowledgeDisplay knowledge={currentKnowledge} onEdit={handleEdit} />
      )}

      {step === "edit" && currentKnowledge && (
        <KnowledgeEditor
          knowledge={currentKnowledge}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
