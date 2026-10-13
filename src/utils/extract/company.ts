import { cleanText, elementText, Page, prioritize, sentences, truncateAtSentence, uniqueBy } from "./text";

const CURRENT_YEAR = new Date().getFullYear();

// "Since 1980", "Founded in 1995", "Est. 2004", "Serving Austin since 1980"
export function extractYearFounded(pages: Page[], fromStructuredData?: number): number | undefined {
  if (fromStructuredData) return fromStructuredData;
  const pattern = /\b(?:founded|established|est\.?|since|in business since|started in|opened in|family[- ]owned since)\s*(?:in\s+)?((?:18|19|20)\d{2})\b/i;
  for (const page of prioritize(pages, "about", "home")) {
    const match = page.text.match(pattern);
    const year = match ? Number(match[1]) : NaN;
    if (year >= 1800 && year <= CURRENT_YEAR) return year;
  }
  return undefined;
}

const ENTITY_TYPES: [RegExp, string][] = [
  [/\bP\.?L\.?L\.?C\.?(?=\W|$)/, "PLLC"],
  [/\bL\.?L\.?C\.?(?=\W|$)/, "LLC"],
  [/\bL\.?L\.?P\.?(?=\W|$)/, "LLP"],
  [/\b(?:Inc\.?|Incorporated)(?=\W|$)/, "Corporation (Inc.)"],
  [/\b(?:Corp\.?|Corporation)(?=\W|$)/, "Corporation"],
  [/\b(?:Ltd\.?|Limited)(?=\W|$)/, "Limited company (Ltd.)"],
  [/\bP\.C\.(?=\W|$)/, "Professional corporation (P.C.)"],
];

// Copyright lines name the legal entity: "© 2024 Account-it Consulting Services, LLC. All rights reserved."
function copyrightHolders(pages: Page[]): string[] {
  const holders: string[] = [];
  for (const page of pages) {
    for (const match of page.text.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*(?:[-–]\s*\d{4})?\s*)?([A-Z][\w&.,'’ -]{2,70}?)(?=\s*(?:\.\s|\||All rights|Powered|Privacy|Website|Designed|$))/gi)) {
      const holder = cleanText(match[1]).replace(/[,.\s–—-]+$/, "");
      const isSentence = /^(all rights|copyright|we|this|our|the site|site|you)\b/i.test(holder) || holder.split(" ").length > 7;
      if (holder.length >= 3 && !isSentence) holders.push(holder);
    }
  }
  return uniqueBy(holders, (h) => h);
}

export function extractLegalEntityType(pages: Page[], legalName: string | undefined, title: string): string | undefined {
  const sources = [legalName || "", ...copyrightHolders(pages), title];
  for (const source of sources) {
    const match = ENTITY_TYPES.find(([pattern]) => pattern.test(source));
    if (match) return match[1];
  }
  return undefined;
}

export function extractAlternativeNames(
  pages: Page[],
  companyName: string,
  candidates: (string | undefined)[]
): string[] {
  const home = pages.find((p) => p.kind === "home") ?? pages[0];
  const siteName = home.doc.querySelector('meta[property="og:site_name"]')?.getAttribute("content") || "";
  const names = [...candidates, siteName, ...copyrightHolders(pages)]
    .map((n) => cleanText(n))
    .filter((n) => n.length >= 3 && n.length <= 70 && n.toLowerCase() !== companyName.toLowerCase());
  return uniqueBy(names, (n) => n.replace(/[^a-z0-9]/gi, "")).slice(0, 5);
}

export function extractEmployeeCount(pages: Page[], fromStructuredData?: string): string | undefined {
  if (fromStructuredData) return fromStructuredData;
  // Require "team of 25" / "over 40 employees" style phrasing; a bare "2 technicians" is usually about a job
  const pattern = /\b(team of|staff of|over|more than|employs?|employing)\s+(\d{1,5})\+?\s*(?:employees|team members|staff members|full[- ]time staff|professionals|technicians|people)?\b/i;
  for (const page of prioritize(pages, "about", "team", "home")) {
    const match = page.text.match(pattern);
    const count = match ? Number(match[2]) : 0;
    if (count >= 3 && (/team|staff|employ/i.test(match![1]) || /employees|team members|staff|professionals|technicians/i.test(match![0]))) {
      return /over|more than|\+/i.test(match![0]) ? `${count}+` : String(count);
    }
  }
  return undefined;
}

const STORY_HEADING = /our story|about us|who we are|our history|how (it|we) (all )?(started|began)|our beginnings|meet the owner|about (the )?company|company (info|history|profile)|^about\b|^since (18|19|20)\d{2}/i;

// Founding story: text under an "Our Story"/"About Us" heading, else a sentence about how it started
export function extractFoundingStory(pages: Page[]): string | undefined {
  for (const page of prioritize(pages, "about", "home")) {
    for (const heading of Array.from(page.doc.querySelectorAll("h1, h2, h3"))) {
      if (!STORY_HEADING.test(heading.textContent || "")) continue;
      const paragraphs: string[] = [];
      let node = heading.nextElementSibling;
      while (node && !/^H[1-3]$/.test(node.tagName) && paragraphs.join(" ").length < 700) {
        const text = elementText(node);
        if (text.length > 40) paragraphs.push(text);
        node = node.nextElementSibling;
      }
      // Page builders often wrap the heading alone in its own container
      if (paragraphs.length === 0) {
        heading.parentElement?.parentElement?.querySelectorAll("p").forEach((p) => {
          const text = elementText(p);
          if (text.length > 40) paragraphs.push(text);
        });
      }
      const story = cleanText(paragraphs.join(" "));
      if (story.length >= 80) return truncateAtSentence(story, 600);
    }
  }

  // An origin sentence ("…began in the back room of Rex and Lois's house"), not a CTA ("Get started for free"),
  // plus what follows it on the page
  for (const page of prioritize(pages, "about", "home")) {
    const all = sentences(page.contentText);
    const start = all.findIndex(
      (s) =>
        /\b(founded|began|opened|started (in|out|as|with|back|from))\b|\bestablished in\b/i.test(s) &&
        !/\b(you|your|get started)\b/i.test(s) &&
        s.length >= 60 &&
        s.length < 300
    );
    if (start !== -1) return truncateAtSentence(all.slice(start, start + 5).join(" "), 600);
  }
  return undefined;
}

export function extractMission(pages: Page[]): string | undefined {
  const patterns = [
    /(?:our mission|mission statement)\s*(?:is|:)?\s*([^.!?]{20,280}[.!?]?)/i,
    /(?:our vision|vision statement)\s*(?:is|:)?\s*([^.!?]{20,280}[.!?]?)/i,
    /(?:our (?:core )?values|we believe)\s*(?:are|:|that)?\s*([^.!?]{20,280}[.!?]?)/i,
    /([^.!?]{0,120}\b(?:give back|community involvement|we (?:proudly )?(?:sponsor|support|volunteer|donate))\b[^.!?]{0,160}[.!?])/i,
  ];
  for (const page of prioritize(pages, "about", "home")) {
    for (const pattern of patterns) {
      const match = page.contentText.match(pattern);
      if (match) return cleanText(match[1]);
    }
  }
  return undefined;
}

// "LEAVE PLUMBING TO THE PROS" -> "Leave plumbing to the pros"
function toSentenceCaseIfShouting(text: string): string {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  const upper = text.replace(/[^A-Z]/g, "").length;
  if (letters.length === 0 || upper / letters.length < 0.6) return text;
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const TRUST_SIGNAL = /\b(licensed|insured|bonded|certified|accredited|award[- ]winning|awards?|BBB|A\+ rating|years of experience|family[- ]owned|veteran[- ]owned|woman[- ]owned|locally owned|guarantee[d]?|warrant(?:y|ies)|satisfaction|5[- ]star)\b/i;

// Short sentences that build trust - useful as proof points in posts and emails
export function extractTrustSignals(pages: Page[]): string[] {
  const found = pages
    .flatMap((p) => sentences(p.contentText))
    .filter(
      (s) =>
        TRUST_SIGNAL.test(s) &&
        s.length >= 15 &&
        s.length <= 140 &&
        !/cookie|privacy|terms|jurisdiction|judgment|disclaim|liabilit|arbitration|indemnif|governing law|hereby|shall\b/i.test(s)
    )
    .map(toSentenceCaseIfShouting);
  return uniqueBy(found, (s) => s.slice(0, 40)).slice(0, 6);
}

const PARTNER_CONTAINER = '[class*="partner" i], [id*="partner" i], [class*="brand" i], [class*="vendor" i], [class*="certif" i], [class*="affiliat" i]';

export function extractPartners(pages: Page[], companyName: string): string[] {
  const partners: string[] = [];
  for (const page of pages) {
    page.doc.querySelectorAll(PARTNER_CONTAINER).forEach((container) => {
      container.querySelectorAll("img[alt]").forEach((img) => {
        const alt = cleanText(img.getAttribute("alt")).replace(/\b(logo|image|icon|badge)\b/gi, "").trim();
        if (alt.length >= 2 && alt.length <= 40) partners.push(alt);
      });
    });
    for (const match of page.text.matchAll(/\b(?:authorized|certified|official|preferred)\s+(?:dealer|installer|partner|provider|distributor)\s+(?:of|for)\s+((?:[A-Z][\w&'-]*\s?){1,4})/g)) {
      partners.push(cleanText(match[1]));
    }
    for (const match of page.text.matchAll(/\b(?:proud(?:ly)? (?:to )?partner(?:ed)? with|in partnership with|we carry|we install)\s+((?:[A-Z][\w&'-]*\s?){1,4})/g)) {
      partners.push(cleanText(match[1]));
    }
  }
  const ownName = companyName.toLowerCase();
  return uniqueBy(
    partners.filter((p) => !ownName.includes(p.toLowerCase()) && !p.toLowerCase().includes(ownName)),
    (p) => p
  ).slice(0, 8);
}

export function extractMediaMentions(pages: Page[]): string[] {
  const mentions: string[] = [];
  for (const page of pages) {
    for (const match of page.text.matchAll(/\b(?:as (?:seen|featured) (?:on|in)|featured (?:on|in)|press:)\s+((?:[A-Z][\w&.'-]*\s?){1,5})/g)) {
      mentions.push(cleanText(match[1]));
    }
  }
  return uniqueBy(mentions, (m) => m).slice(0, 6);
}

// Short action labels on buttons/links ("Get a Free Quote", "Book Now") - the site's conversion language
const CTA_START = /^(get|call|book|schedule|request|contact|start|try|shop|buy|order|sign up|join|subscribe|download|claim|reserve|apply|donate|see pricing|view pricing|talk to|chat|text|find|visit|explore|discover)\b/i;

export function extractCtas(home: Page): string[] {
  const counts = new Map<string, { label: string; count: number }>();
  home.doc.querySelectorAll("a, button, input[type=submit]").forEach((el) => {
    const label = cleanText(el.getAttribute("value") || el.textContent);
    if (label.length < 4 || label.length > 40 || !CTA_START.test(label)) return;
    const key = label.toLowerCase();
    counts.set(key, { label, count: (counts.get(key)?.count || 0) + 1 });
  });
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6).map((c) => c.label);
}

export function extractHeadlines(home: Page): string[] {
  // Skip generic section titles every site has - they say nothing about this business
  const generic = /cookie|privacy|newsletter|subscribe|(clients|customers) (are )?saying|testimonials|reviews|contact us|get in touch|follow us|latest (news|posts|articles)|our (team|blog|services|partners)$/i;
  const headlines = Array.from(home.doc.querySelectorAll("h1, h2"))
    .map((h) => elementText(h))
    .filter((t) => t.length >= 8 && t.length <= 120 && !generic.test(t));
  return uniqueBy(headlines, (h) => h).slice(0, 6);
}

const AUDIENCES = [
  "homeowners", "home owners", "property owners", "landlords", "renters", "home buyers", "families", "parents", "seniors",
  "students", "patients", "small businesses", "local businesses", "businesses", "enterprises", "startups", "developers",
  "contractors", "builders", "farmers", "ranchers", "individuals", "couples", "pet owners", "drivers", "travelers",
  "visitors", "investors", "nonprofits", "schools", "restaurants", "retailers", "agencies", "commercial clients",
  "residential customers", "commercial customers", "veterans", "athletes", "brides",
];

// Who the site talks to, based on the audience nouns it actually uses
export function extractAudiences(pages: Page[], summary: string): string[] {
  const text = `${summary} ${summary} ${pages.map((p) => p.text).join(" ")}`;
  return AUDIENCES.map((audience) => ({
    audience,
    count: (text.match(new RegExp(`\\b${audience}\\b`, "gi")) || []).length,
  }))
    .filter((a) => a.count >= 2)
    .sort((a, b) => b.count - a.count)
    // "businesses" is already counted inside "small businesses" - keep only the more specific one
    .filter((a, _, all) => !all.some((other) => other !== a && other.audience.endsWith(` ${a.audience}`)))
    .slice(0, 4)
    .map((a) => a.audience.replace(/\b\w/g, (c) => c.toUpperCase()));
}
