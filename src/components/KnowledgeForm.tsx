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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          Company Website URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Scraping..." : "Scrape"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Scraping website...</span>
        </div>
      )}
    </form>
  );
}
