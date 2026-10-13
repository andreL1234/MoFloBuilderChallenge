import { OnlinePresence } from "@/types/knowledge";
import { BOILERPLATE_SELECTOR, cleanText, elementText, Page, prioritize, uniqueBy } from "./text";

function formatPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits.length !== 10 || /^[01]/.test(digits)) return null; // US area codes never start with 0/1
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// tel: links are what the business intends as its phone number. Text matches must look like a
// formatted phone number - bare 10-digit runs are usually IDs or tracking numbers.
export function extractPhones(pages: Page[], fromStructuredData: string[]): string[] {
  const phones: string[] = [...fromStructuredData];
  for (const page of prioritize(pages, "contact", "home")) {
    page.doc.querySelectorAll('a[href^="tel:" i]').forEach((a) => phones.push(a.getAttribute("href")!.slice(4)));
    const formatted = page.text.match(/(?:\+1[\s.-]?)?\(?\b[2-9]\d{2}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g) || [];
    phones.push(...formatted);
  }
  return [...new Set(phones.map(formatPhone).filter((p): p is string => p !== null))].slice(0, 3);
}

const IGNORED_EMAIL = /\.(png|jpe?g|gif|webp|svg)$|@(sentry|example|wixpress|domain|email)\.|^(name|your|email)@/i;

export function extractEmails(pages: Page[], fromStructuredData: string[], siteUrl: string): string[] {
  const emails: string[] = [...fromStructuredData];
  for (const page of prioritize(pages, "contact", "home")) {
    page.doc.querySelectorAll('a[href^="mailto:" i]').forEach((a) => {
      if (!a.closest(BOILERPLATE_SELECTOR)) emails.push(decodeURIComponent(a.getAttribute("href")!.slice(7).split("?")[0]));
    });
    emails.push(...(page.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
  }
  const unique = uniqueBy(
    emails.map((e) => e.trim().toLowerCase()).filter((e) => !IGNORED_EMAIL.test(e)),
    (e) => e
  );
  // If the business has addresses on its own domain, others are usually vendors (web host, booking platform)
  const siteDomain = new URL(siteUrl).hostname.replace(/^www\./, "");
  const own = unique.filter((e) => e.endsWith(`@${siteDomain}`));
  return (own.length > 0 ? own : unique).slice(0, 3);
}

const STREET_TYPES =
  "Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Highway|Hwy|Parkway|Pkwy|Court|Ct|Circle|Cir|Place|Pl|Trail|Trl|Loop|Pike|Square|Sq|Terrace|Ter";
const US_ADDRESS = new RegExp(
  `\\b\\d{1,6}\\s+(?:[A-Z0-9][\\w.'#-]*\\s+){0,5}(?:${STREET_TYPES})\\.?` + // 123 Main St
    `(?:,?\\s*(?:Suite|Ste|Unit|Bldg|#)\\.?\\s*[\\w-]+)?` + // , Suite 200
    `,?\\s+(?:[A-Z][a-zA-Z.]*\\s){0,3}[A-Z][a-zA-Z.]*,?\\s+[A-Z]{2}\\s+\\d{5}(?:-\\d{4})?\\b`, // Austin, TX 78738
  "g"
);

export function extractAddresses(pages: Page[], fromStructuredData: string[]): string[] {
  const found: string[] = [...fromStructuredData];
  for (const page of prioritize(pages, "contact", "about", "home")) {
    page.doc.querySelectorAll("address").forEach((el) => {
      const text = elementText(el);
      if (/\d/.test(text) && text.length < 160) found.push(text);
    });
    found.push(...(page.text.match(US_ADDRESS) || []));
  }
  return uniqueBy(
    found.map((a) => cleanText(a).replace(/\s+,/g, ",")),
    (a) => a.replace(/[^a-z0-9]/gi, "").slice(0, 24) // same street + number = same address
  ).slice(0, 5);
}

// "Serving the Texas Hill Country since 1980" -> "Texas Hill Country"
export function extractServiceAreas(pages: Page[], fromStructuredData: string[]): string[] {
  const areas: string[] = [...fromStructuredData];
  for (const page of pages) {
    for (const match of page.text.matchAll(/\b(?:[Pp]roudly )?[Ss]erv(?:ing|ice [Aa]reas?:?|e)\s+(?:[Tt]he\s+|[Aa]ll of\s+)?((?:[A-Z][a-zA-Z.'-]*,?\s?(?:&|and)?\s?){1,6})/g)) {
      const area = cleanText(match[1])
        .replace(/\s+(Since|For|With|In|And|Area|Areas|Our|Today|Call)\b.*$/, "") // "Texas Hill Country Since" -> "Texas Hill Country"
        .replace(/[,&]$|\band$/, "")
        .trim();
      if (area.split(" ").length >= 1 && area.length >= 4 && !/^(Our|We|You|Your|Customers|Clients)\b/.test(area)) {
        areas.push(area);
      }
    }
    // List items under a heading like "Areas We Serve" / "Service Area"
    page.doc.querySelectorAll("h2, h3, h4").forEach((heading) => {
      if (!/areas? (we )?serve|service areas?|communities we serve/i.test(heading.textContent || "")) return;
      const list = heading.parentElement?.querySelector("ul, ol");
      list?.querySelectorAll("li").forEach((li) => {
        const text = elementText(li);
        if (text.length > 2 && text.length <= 40) areas.push(text);
      });
    });
  }
  return uniqueBy(areas, (a) => a).slice(0, 12);
}

const SOCIAL_DOMAINS: [keyof Omit<OnlinePresence, "other">, string[]][] = [
  ["linkedin", ["linkedin.com"]],
  ["facebook", ["facebook.com"]],
  ["twitter", ["twitter.com", "x.com"]],
  ["instagram", ["instagram.com"]],
  ["youtube", ["youtube.com"]],
  ["tiktok", ["tiktok.com"]],
];

// Share buttons, tweet intents, and single videos aren't the company's profile
const NON_PROFILE_PATH = /\/(sharer|share|intent|watch|embed|hashtag)\b/i;

// Match on the link's hostname - a substring check would treat "vistabrewingtx.com" as x.com
export function extractSocialLinks(pages: Page[], sameAs: string[]): Partial<OnlinePresence> {
  const hrefs = [
    ...sameAs,
    ...prioritize(pages, "home", "contact").flatMap((p) =>
      Array.from(p.doc.querySelectorAll("a[href]")).map((a) => a.getAttribute("href") || "")
    ),
  ];
  const social: Partial<OnlinePresence> = {};

  for (const href of hrefs) {
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      continue; // relative links can't be social profiles
    }
    if (!["http:", "https:"].includes(url.protocol) || NON_PROFILE_PATH.test(url.pathname) || url.pathname.length <= 1) continue;

    const host = url.hostname.replace(/^(www|m)\./, "");
    for (const [platform, domains] of SOCIAL_DOMAINS) {
      if (!social[platform] && domains.some((d) => host === d || host.endsWith(`.${d}`))) {
        social[platform] = url.href;
      }
    }
  }
  return social;
}
