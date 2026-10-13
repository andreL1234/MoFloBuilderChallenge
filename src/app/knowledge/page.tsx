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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white">
      {/* Fixed background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation */}
      <div className="relative z-10 px-6 py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Build Knowledge Base</h1>
          <a
            href="/knowledge/view"
            className="px-6 py-2 bg-white/20 backdrop-blur-md text-white font-bold rounded-full border border-white/40 hover:bg-white/30 hover:border-white transition-all"
          >
            View Knowledge Bases
          </a>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex-1 flex flex-col">
        {step === "form" && (
          <>
            {/* Single Scrape Section */}
            {scrapeMode === "single" && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
                <div className="w-full max-w-2xl">
                  <h2 className="text-5xl font-black mb-4 text-white drop-shadow-2xl">
                    Scrape Single Website
                  </h2>
                  <p className="text-lg text-blue-100 mb-12">
                    Enter a company website URL to extract and organize their business information
                  </p>

                  <KnowledgeForm
                    onScraped={handleScraped}
                    isLoading={isLoading}
                    error={error}
                    setError={setError}
                    setIsLoading={setIsLoading}
                  />

                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setScrapeMode("batch")}
                      className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-bold rounded-full border border-white/40 hover:bg-white/30 hover:border-white transition-all"
                    >
                      Switch to Batch Scrape
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Scrape Section */}
            {scrapeMode === "batch" && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
                <div className="w-full max-w-2xl">
                  <h2 className="text-5xl font-black mb-4 text-white drop-shadow-2xl">
                    Batch Scrape Websites
                  </h2>
                  <p className="text-lg text-blue-100 mb-12">
                    Enter multiple website URLs to scrape and save multiple knowledge bases at once
                  </p>

                  <BatchScraper
                    onScraped={handleBatchScraped}
                    onError={setError}
                    setIsLoading={setIsLoading}
                  />

                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setScrapeMode("single")}
                      className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-bold rounded-full border border-white/40 hover:bg-white/30 hover:border-white transition-all"
                    >
                      Switch to Single Scrape
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
