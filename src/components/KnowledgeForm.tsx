"use client";

import { useState } from "react";
import { scrapeSite } from "@/utils/scraper";
import { parseWebsite } from "@/utils/parser";
import { hostnameOf } from "@/utils/url";
import { Knowledge } from "@/types/knowledge";
import { button, Spinner } from "@/components/ui";

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
  const [progress, setProgress] = useState("");

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
      const site = await scrapeSite(url, setProgress);
      const knowledge = parseWebsite(site, url);
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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 rounded-[28px] border border-white/25 bg-white/10 p-2 backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full">
        <label htmlFor="url" className="flex flex-1 items-center gap-3 px-4">
          <svg className="h-5 w-5 shrink-0 text-white/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <span className="sr-only">Company website URL</span>
          <input
            id="url"
            type="text"
            inputMode="url"
            autoComplete="off"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="company.com"
            disabled={isLoading}
            className="w-full bg-transparent py-2.5 text-lg text-white placeholder:text-white/55 focus:outline-none"
          />
        </label>
        <button type="submit" disabled={isLoading} className={button.dark}>
          {isLoading ? (
            <>
              <Spinner /> Scraping
            </>
          ) : (
            "Build knowledge base"
          )}
        </button>
      </div>

      <div className="mt-4 min-h-6 text-sm" aria-live="polite">
        {isLoading && (
          <p className="text-white/85">
            <span className="font-medium text-white">{hostnameOf(url) || "Website"}</span>: {progress || "Starting"}…
          </p>
        )}
        {error && !isLoading && (
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1.5 text-red-50 ring-1 ring-red-300/40">
            <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
