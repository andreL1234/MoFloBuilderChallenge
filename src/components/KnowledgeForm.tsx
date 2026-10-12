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
    <form onSubmit={handleSubmit} className="card">
      <h3 className="subsection-title">Enter Website URL</h3>

      <div className="mb-6">
        <label htmlFor="url" className="block text-sm font-semibold text-slate-900 mb-3">
          Company Website URL
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            className="input flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary px-8 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scraping...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Scrape
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-fade-in">
          <p className="font-semibold text-red-900 text-sm mb-1">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 text-primary-600 text-sm animate-fade-in">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Scraping website... This may take a moment.</span>
        </div>
      )}

      <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h4 className="font-semibold text-primary-900 text-sm mb-2">💡 Tip</h4>
        <p className="text-primary-800 text-sm">Enter a company website URL and we'll extract industry, business model, positioning, and more using intelligent scraping.</p>
      </div>
    </form>
  );
}
