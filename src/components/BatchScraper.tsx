"use client";

import { useState } from "react";
import Link from "next/link";
import { parseWebsite } from "@/utils/parser";
import { scrapeSite } from "@/utils/scraper";
import { hostnameOf } from "@/utils/url";
import { Knowledge } from "@/types/knowledge";
import { button, Spinner } from "@/components/ui";

interface BatchScraperProps {
  onScraped: (knowledgeList: Knowledge[]) => void;
  setIsLoading: (loading: boolean) => void;
}

interface ScrapeResult {
  url: string;
  knowledgeId?: string;
  error?: string;
}

const parseUrls = (input: string): string[] =>
  input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && (line.startsWith("http://") || line.startsWith("https://") || line.includes(".")));

export default function BatchScraper({ onScraped, setIsLoading }: BatchScraperProps) {
  const [urlInput, setUrlInput] = useState("");
  const [progress, setProgress] = useState<{ current: number; total: number; url: string } | null>(null);
  const [results, setResults] = useState<ScrapeResult[]>([]);

  const urls = parseUrls(urlInput);
  const isRunning = progress !== null;

  const handleBatchScrape = async () => {
    if (urls.length === 0) return;

    setIsLoading(true);
    setResults([]);

    const scraped: Knowledge[] = [];
    const scrapeResults: ScrapeResult[] = [];

    // Sequential on purpose: keeps the UI progress honest and avoids hammering the API route
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setProgress({ current: i + 1, total: urls.length, url });

      try {
        const site = await scrapeSite(url);
        const knowledge = parseWebsite(site, url);
        scraped.push(knowledge);
        scrapeResults.push({ url, knowledgeId: knowledge.id });
      } catch (error) {
        scrapeResults.push({ url, error: error instanceof Error ? error.message : "Unknown error" });
      }
      setResults([...scrapeResults]);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setProgress(null);
    setIsLoading(false);

    if (scraped.length > 0) {
      onScraped(scraped);
      setUrlInput("");
    }
  };

  const succeeded = results.filter((r) => r.knowledgeId).length;

  return (
    <div className="w-full rounded-[24px] border border-white/25 bg-white/10 p-5 text-left backdrop-blur-md sm:p-6">
      <label htmlFor="batch-urls" className="mb-2 block text-sm font-medium text-white">
        Website URLs <span className="font-normal text-white/65">(one per line)</span>
      </label>
      <textarea
        id="batch-urls"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        placeholder={"acme.com\nhttps://example.org\nnorthwind.io"}
        rows={5}
        disabled={isRunning}
        className="w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-mono text-sm text-white placeholder:text-white/45 focus:border-white/50 focus:outline-none"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/75">
          {urls.length} valid URL{urls.length !== 1 ? "s" : ""} detected
        </p>
        <button onClick={handleBatchScrape} disabled={urls.length === 0 || isRunning} className={button.dark}>
          {progress ? (
            <>
              <Spinner /> Scraping {progress.current} of {progress.total}
            </>
          ) : urls.length > 0 ? (
            `Scrape ${urls.length} website${urls.length === 1 ? "" : "s"}`
          ) : (
            "Scrape websites"
          )}
        </button>
      </div>

      {progress && (
        <div className="mt-5" aria-live="polite">
          <div className="mb-2 flex justify-between text-xs text-white/80">
            <span className="truncate">Fetching {hostnameOf(progress.url)}</span>
            <span className="tabular-nums">{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-5">
          {!isRunning && (
            <p className="mb-3 text-sm font-medium text-white">
              Saved {succeeded} of {results.length} to your knowledge bases
            </p>
          )}
          <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {results.map((result, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
                <span className={`h-2 w-2 shrink-0 rounded-full ${result.knowledgeId ? "bg-emerald-300" : "bg-red-300"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{hostnameOf(result.url)}</p>
                  {result.error && <p className="truncate text-xs text-red-100">{result.error}</p>}
                </div>
                {result.knowledgeId && !isRunning && (
                  <Link href={`/knowledge/view/${result.knowledgeId}`} className="text-xs font-medium text-white underline-offset-4 hover:underline">
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
