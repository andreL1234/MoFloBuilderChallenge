import { resolveAssetUrl } from "@/utils/url";
import { cleanText, Page, uniqueBy } from "./text";

// Logos: <img> tags that mention "logo" (in alt, src, or a wrapping element), the JSON-LD logo,
// then the touch icon / favicon. URLs are made absolute so they render in our app.
// Logo images outside the header must name the company - otherwise they're usually partner or
// customer logos ("Proud partners", "Trusted by") rather than the company's own.
export function extractLogos(home: Page, fromStructuredData: string[], companyName: string): string[] {
  const nameTokens = [
    ...companyName.toLowerCase().split(/[^a-z0-9]+/),
    new URL(home.url).hostname.replace(/^www\./, "").split(".")[0],
  ].filter((t) => t.length >= 3 && !["the", "and", "inc", "llc", "company", "services"].includes(t));

  const logoImages = Array.from(home.doc.querySelectorAll("img"))
    .filter((img) => {
      const alt = (img.getAttribute("alt") || "").toLowerCase();
      const src = (img.getAttribute("src") || "").toLowerCase();
      const insideLogoElement = img.closest('[class*="logo" i], [id*="logo" i]') !== null;
      if (!(alt.includes("logo") || src.includes("logo") || insideLogoElement)) return false;
      // <body> often carries classes like "et_header_style_left", so it must not count as the header
      const headerEl = img.closest("header, [class*='header' i], [id*='header' i], [class*='navbar' i]");
      const inHeader = headerEl !== null && !["BODY", "HTML"].includes(headerEl.tagName);
      // Compare against the file name only - the site's own domain appears in every image URL
      const fileName = src.split("?")[0].split("/").pop() || "";
      const namesCompany = nameTokens.some((t) => alt.includes(t) || fileName.includes(t));
      const genericLogoFile = /^(site-?)?logo[-_.]?(\d{4}|white|dark|light|horizontal|main|header)?[-_\w]*\.\w+$/.test(fileName) && !/logo-[a-z]+-[a-z]+/.test(fileName);
      return inHeader || namesCompany || genericLogoFile;
    })
    // Header logos first - the company's own logo usually lives there, customer logos further down
    .sort((a, b) => Number(!!b.closest("header")) - Number(!!a.closest("header")))
    // Lazy-loaded images keep the real URL in data-src
    .map((img) => img.getAttribute("data-src") || img.getAttribute("src"));

  const icons = Array.from(
    home.doc.querySelectorAll('link[rel~="apple-touch-icon"], link[rel~="icon"]')
  ).map((link) => link.getAttribute("href"));

  const resolved = [...fromStructuredData, ...logoImages, ...icons]
    .map((src) => resolveAssetUrl(src, home.url))
    .filter((src): src is string => src !== null);

  return [...new Set(resolved)].slice(0, 6);
}

// WordPress injects its default editor palette into every page; those colors aren't the brand's
const WORDPRESS_DEFAULT_PALETTE = new Set([
  "#ABB8C3", "#F78DA7", "#CF2E2E", "#FF6900", "#FCB900", "#7BDCB5", "#00D084", "#8ED1FC", "#0693E3", "#9B51E0",
  "#32373C",
]);

function isNeutral(hex: string): boolean {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return Math.max(r, g, b) - Math.min(r, g, b) < 16; // white, black, and grays
}

// Color palette: the declared theme-color first, then hex values from inline CSS ranked by how often
// they're used (a brand color repeats across buttons, links, and headings). Grays go last.
export function extractColors(home: Page, html: string): string[] {
  const themeColor = (home.doc.querySelector('meta[name="theme-color"]')?.getAttribute("content") || "").toUpperCase();
  const counts = new Map<string, number>();
  for (const match of html.match(/#[0-9A-Fa-f]{6}\b/g) || []) {
    const hex = match.toUpperCase();
    if (!WORDPRESS_DEFAULT_PALETTE.has(hex)) counts.set(hex, (counts.get(hex) || 0) + 1);
  }
  const ranked = [...counts.entries()]
    .sort((a, b) => Number(isNeutral(a[0])) - Number(isNeutral(b[0])) || b[1] - a[1])
    .map(([hex]) => hex);
  const colors = /^#[0-9A-F]{6}$/.test(themeColor) ? [themeColor, ...ranked] : ranked;
  return [...new Set(colors)].slice(0, 6);
}

// Fonts: Google Fonts stylesheet links name the brand fonts directly; fall back to CSS declarations
export function extractFonts(home: Page, html: string): string[] {
  const fromGoogle = Array.from(home.doc.querySelectorAll('link[href*="fonts.googleapis.com"]')).flatMap((link) => {
    const href = link.getAttribute("href") || "";
    return Array.from(href.matchAll(/family=([^&:;]+)/g)).flatMap((m) =>
      decodeURIComponent(m[1]).split("|").map((f) => f.split(":")[0].replace(/\+/g, " "))
    );
  });
  const fromCss = Array.from(html.matchAll(/font-family:\s*([^;}"]+)/gi)).map((m) =>
    m[1].split(",")[0].replace(/["']|!important/g, "").trim()
  );
  const generic = /^(inherit|initial|unset|sans-serif|serif|monospace|system-ui|-apple-system|var\(.*|arial|helvetica|times new roman|icons?|.*awesome.*|dashicons|eicons)$/i;
  return uniqueBy(
    [...fromGoogle, ...fromCss].map((f) => cleanText(f)).filter((f) => f.length > 1 && !generic.test(f)),
    (f) => f
  ).slice(0, 4);
}
