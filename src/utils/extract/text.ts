export type PageKind = "home" | "about" | "services" | "contact" | "team" | "faq" | "reviews" | "other";

export interface Page {
  url: string;
  kind: PageKind;
  doc: Document; // original parsed document - never mutate; clone first
  text: string; // visible text without scripts, styles, or legal/cookie boilerplate; words separated
  contentText: string; // same, minus nav/header/footer - the page's own copy, for prose extraction
}

export const PAGE_KIND_PATTERNS: { kind: Exclude<PageKind, "home" | "other">; pattern: RegExp }[] = [
  { kind: "about", pattern: /about|our-story|who-we-are|history|company/i },
  { kind: "services", pattern: /services?|products?|what-we-do|solutions|offerings|menu/i },
  { kind: "contact", pattern: /contact|locations?|find-us|visit/i },
  { kind: "team", pattern: /team|staff|leadership|our-people|meet/i },
  { kind: "faq", pattern: /faqs?|questions/i },
  { kind: "reviews", pattern: /testimonials?|reviews?/i },
];

export function pageKindFor(url: string): PageKind {
  try {
    const path = new URL(url).pathname;
    return PAGE_KIND_PATTERNS.find(({ pattern }) => pattern.test(path))?.kind ?? "other";
  } catch {
    return "other";
  }
}

export function cleanText(text: string | null | undefined): string {
  return (text || "").replace(/\s+/g, " ").trim();
}

// Hidden or boilerplate blocks whose text isn't about the business: terms-of-service modals,
// cookie banners, and screen-reader-hidden duplicates. Their addresses/emails belong to vendors.
export const BOILERPLATE_SELECTOR =
  "dialog, [aria-hidden='true'], [class*='cookie' i], [id*='cookie' i], [class*='consent' i], " +
  "[class*='modal' i], [id*='modal' i], [class*='terms' i], [id*='terms' i], [class*='privacy' i], [class*='legal' i]";

// textContent glues adjacent tags together ("<span>Be #1</span><span>on</span>" -> "Be #1on"),
// so append a space to every element before reading text.
export function visibleText(doc: Document, withoutChrome = false): string {
  const copy = doc.cloneNode(true) as Document;
  const chrome = withoutChrome ? ", nav, header, footer, [class*='menu' i]" : "";
  copy
    .querySelectorAll(`script, style, noscript, template, svg, iframe, ${BOILERPLATE_SELECTOR}${chrome}`)
    .forEach((el) => el.remove());
  copy.body?.querySelectorAll("*").forEach((el) => el.append(" "));
  return cleanText(copy.body?.textContent);
}

export function parsePage(html: string, url: string, kind: PageKind): Page {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return { url, kind, doc, text: visibleText(doc), contentText: visibleText(doc, true) };
}

export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z"“])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function elementText(el: Element | null | undefined): string {
  if (!el) return "";
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll("script, style, svg").forEach((n) => n.remove());
  copy.querySelectorAll("*").forEach((n) => n.append(" "));
  return cleanText(copy.textContent);
}

export function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item).toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function truncateAtSentence(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return lastStop > max * 0.5 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`;
}

// Pages in the order they should be trusted for a given field (e.g. contact page first for addresses)
export function prioritize(pages: Page[], ...kinds: PageKind[]): Page[] {
  const rank = (p: Page) => {
    const i = kinds.indexOf(p.kind);
    return i === -1 ? kinds.length : i;
  };
  return [...pages].sort((a, b) => rank(a) - rank(b));
}
