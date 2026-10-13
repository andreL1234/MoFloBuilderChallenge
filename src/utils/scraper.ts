import { PAGE_KIND_PATTERNS } from "@/utils/extract/text";

export interface FetchedPage {
  url: string; // final URL after redirects
  html: string;
}

export interface ScrapedSite {
  home: FetchedPage;
  subpages: FetchedPage[];
}

export async function fetchUrl(url: string): Promise<FetchedPage> {
  // Call server-side API to avoid CORS restrictions
  const response = await fetch("/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return { url: data.finalUrl || url, html: data.html };
}

// Pages most likely to hold baseline fields the homepage lacks (address, people, offerings, story).
// One page per kind, in priority order.
const MAX_SUBPAGES = 5;

export function discoverSubpages(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const sameSite = (host: string) => host.replace(/^www\./, "") === base.hostname.replace(/^www\./, "");
  const doc = new DOMParser().parseFromString(html, "text/html");

  const candidates: URL[] = [];
  doc.querySelectorAll("a[href]").forEach((link) => {
    try {
      const url = new URL(link.getAttribute("href") || "", base);
      url.hash = "";
      url.search = "";
      const isPage =
        !/\.(pdf|jpe?g|png|gif|svg|webp|zip|docx?|mp4)$/i.test(url.pathname) &&
        !/privacy|terms|legal|cookie|login|sign-?in|cart|account|careers?|jobs/i.test(url.pathname);
      if (url.protocol.startsWith("http") && sameSite(url.hostname) && isPage && url.pathname !== base.pathname) {
        candidates.push(url);
      }
    } catch {
      // ignore malformed hrefs
    }
  });

  const chosen: string[] = [];
  for (const { pattern } of PAGE_KIND_PATTERNS) {
    // Prefer the shortest matching path: /about over /about/press-release-2019
    const match = candidates
      .filter((url) => pattern.test(url.pathname) && !chosen.includes(url.href))
      .sort((a, b) => a.pathname.length - b.pathname.length)[0];
    if (match) chosen.push(match.href);
    if (chosen.length >= MAX_SUBPAGES) break;
  }
  return chosen;
}

// Fetch the homepage, then the most useful internal pages in parallel. Subpage failures are
// ignored - the homepage alone still produces a knowledge base.
export async function scrapeSite(url: string, onProgress?: (message: string) => void): Promise<ScrapedSite> {
  onProgress?.("Fetching homepage");
  const home = await fetchUrl(url);

  const subpageUrls = discoverSubpages(home.html, home.url);
  if (subpageUrls.length > 0) {
    const names = subpageUrls.map((u) => new URL(u).pathname.replace(/^\/|\/$/g, "") || "/").join(", ");
    onProgress?.(`Reading ${subpageUrls.length} more page${subpageUrls.length > 1 ? "s" : ""}: ${names}`);
  }

  const results = await Promise.allSettled(subpageUrls.map((u) => fetchUrl(u)));
  const subpages = results
    .filter((r): r is PromiseFulfilledResult<FetchedPage> => r.status === "fulfilled")
    .map((r) => r.value);

  onProgress?.("Extracting knowledge");
  return { home, subpages };
}
