"use client";

import { useState } from "react";
import { fetchUrl } from "@/utils/scraper";
import { parseWebsite } from "@/utils/parser";
import { Knowledge } from "@/types/knowledge";

interface KnowledgeFormProps {
  onScraped: (knowledge: Knowledge) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function KnowledgeForm({
  onScraped,
  isLoading,
  error,
  setError,
  setIsLoading,
}: KnowledgeFormProps) {
  const [url, setUrl] = useState("");

  const validateUrl = (urlString: string): boolean => {
    try {
      let testUrl = urlString;
      if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
        testUrl = "https://" + testUrl;
      }
      new URL(testUrl);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    if (!validateUrl(url)) {
      setError("Invalid URL format. Please enter a valid website URL.");
      return;
    }

    setIsLoading(true);
    try {
      const html = await fetchUrl(url);
      const knowledge = parseWebsite(html, url);
      onScraped(knowledge);
      setUrl("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to scrape website";
      setError(message);
      console.error("Scraping error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
      <div className="mb-8">
        <label htmlFor="url" className="block text-sm font-bold text-white mb-4">
          Website URL
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:bg-white/30 focus:border-white/60 focus:outline-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? "Scraping..." : "Scrape"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6 animate-fade-in backdrop-blur-sm">
          <p className="font-semibold text-red-100 text-sm mb-1">Error</p>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 text-blue-100 text-sm animate-fade-in bg-white/10 p-4 rounded-lg border border-white/20 mb-6 backdrop-blur-sm">
          <div className="animate-spin h-5 w-5 flex-shrink-0 border-2 border-blue-100 border-t-white rounded-full" />
          <span>Scraping website... This may take a moment.</span>
        </div>
      )}

      <div className="p-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
        <h4 className="font-bold text-white text-sm mb-2">What we extract</h4>
        <p className="text-blue-100 text-sm leading-relaxed">Industry, business model, company positioning, branding, social links, key people, offerings, and more using intelligent HTML analysis.</p>
      </div>
    </form>
  );
}
