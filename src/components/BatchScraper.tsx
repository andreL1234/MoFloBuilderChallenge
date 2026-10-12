"use client";

import { useState } from "react";
import { parseWebsite } from "@/utils/parser";
import { fetchUrl } from "@/utils/scraper";
import { Knowledge } from "@/types/knowledge";

interface BatchScraperProps {
  onScraped: (knowledgeList: Knowledge[]) => void;
  onError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function BatchScraper({
  onScraped,
  onError,
  setIsLoading,
}: BatchScraperProps) {
  const [urlInput, setUrlInput] = useState("");
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<{ url: string; success: boolean; error?: string }[]>([]);

  const parseUrls = (input: string): string[] => {
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && (line.startsWith("http://") || line.startsWith("https://") || line.includes(".")));
  };

  const handleBatchScrape = async () => {
    const urls = parseUrls(urlInput);

    if (urls.length === 0) {
      onError("No valid URLs found. Enter URLs one per line.");
      return;
    }

    setIsLoading(true);
    setProgress({ current: 0, total: urls.length });
    setResults([]);

    const knowledgeList: any[] = [];
    const scrapeResults: typeof results = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setProgress({ current: i + 1, total: urls.length });

      try {
        const html = await fetchUrl(url);
        const knowledge = parseWebsite(html, url);
        knowledgeList.push(knowledge);

        scrapeResults.push({ url, success: true });
        console.log(`✓ Scraped: ${url}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        scrapeResults.push({ url, success: false, error: errorMsg });
        console.error(`✗ Failed: ${url}`, error);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setResults(scrapeResults);
    setProgress(null);
    setIsLoading(false);

    const successCount = knowledgeList.length;
    if (successCount > 0) {
      onScraped(knowledgeList);
      setUrlInput(""); // Clear input on success
    }

    if (successCount < urls.length) {
      const failCount = urls.length - successCount;
      onError(
        `Scraped ${successCount}/${urls.length} successfully. ${failCount} failed - check console for details.`
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Scraping</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter URLs (one per line)
        </label>
        <textarea
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com&#10;https://another-site.com&#10;https://third-company.io"
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          {parseUrls(urlInput).length} valid URL{parseUrls(urlInput).length !== 1 ? "s" : ""} detected
        </p>
      </div>

      {progress && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium text-blue-900">
              Scraping: {progress.current} / {progress.total}
            </p>
            <p className="text-sm text-blue-700">
              {Math.round((progress.current / progress.total) * 100)}%
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Results:</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {results.map((result, i) => (
              <div
                key={i}
                className={`p-3 rounded text-sm ${
                  result.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-bold">{result.success ? "✓" : "✗"}</span>
                  <div className="flex-1">
                    <p className="break-all font-mono">{result.url}</p>
                    {result.error && <p className="text-xs mt-1">{result.error}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleBatchScrape}
        disabled={parseUrls(urlInput).length === 0 || progress !== null}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {progress ? "Scraping..." : "Start Batch Scrape"}
      </button>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Scraped companies will be added to your knowledge bases automatically.
          This may take a while depending on the number of URLs. Check your network connection and
          make sure websites are accessible.
        </p>
      </div>
    </div>
  );
}
