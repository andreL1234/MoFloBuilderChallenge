// Keyword-based classification of a scraped page. No LLM: every result can be traced
// back to the phrases that matched, and confidence reflects how clearly one category won.

export interface PageContent {
  summary: string; // title, meta description/keywords, h1/h2 - how the business describes itself
  actions: string; // button and link labels - the calls to action a visitor sees
  body: string; // visible page text without scripts, styles, nav, footer, or cookie banners
  blocks: string[]; // body text split into headings/paragraphs/list items, for theme extraction
}

export interface Classification {
  label: string;
  confidence: number;
}

const INDUSTRIES: Record<string, string[]> = {
  "Water Well & Drilling": ["water well", "water wells", "well drilling", "drilling", "well pump", "well pumps", "pump repair", "well service", "well inspection", "pressure tank", "irrigation well"],
  "Construction & Contracting": ["construction", "general contractor", "contractor", "contractors", "remodeling", "renovation", "roofing", "concrete", "excavation", "home builder", "framing"],
  "Home Services": ["plumbing", "plumber", "hvac", "air conditioning", "heating and cooling", "electrician", "landscaping", "lawn care", "pest control", "house cleaning", "cleaning services", "garage door", "handyman", "drain cleaning", "water heater"],
  "Solar & Energy": ["solar", "solar panels", "solar energy", "renewable energy", "battery storage", "solar installation", "energy savings"],
  "Accounting & Tax": ["accounting", "accountant", "accountants", "bookkeeping", "tax", "taxes", "tax preparation", "tax return", "tax returns", "tax planning", "cpa", "payroll", "irs"],
  "Financial Services & Lending": ["loan", "loans", "mortgage", "lending", "lender", "refinance", "financial planning", "wealth management", "financial advisor"],
  "Payments & Fintech": ["payments", "payment processing", "online payments", "billing", "invoicing", "fintech", "merchants", "card payments"],
  Insurance: ["insurance", "coverage", "insurance agent", "auto insurance", "home insurance", "life insurance"],
  Legal: ["attorney", "attorneys", "lawyer", "lawyers", "law firm", "litigation", "personal injury", "estate planning"],
  "Healthcare & Medical": ["healthcare", "medical", "clinic", "patient", "patients", "physician", "dental", "dentist", "chiropractic", "therapy"],
  "Fitness & Wellness": ["fitness", "gym", "yoga", "wellness", "massage", "personal training", "pilates", "nutrition"],
  "Beauty & Personal Care": ["salon", "hair salon", "barber", "nails", "skincare", "lashes", "med spa", "facials"],
  "Food & Beverage": ["restaurant", "brewery", "craft beer", "beer", "beers", "taproom", "winery", "wine", "coffee", "bakery", "catering", "cafe", "cocktails", "food truck"],
  "Hospitality & Events": ["hotel", "resort", "lodging", "event venue", "wedding venue", "live music", "festival", "events", "tourism"],
  "Real Estate": ["real estate", "realtor", "homes for sale", "property management", "listings", "brokerage", "home buyers"],
  Automotive: ["auto repair", "car dealership", "vehicles", "collision repair", "oil change", "tires", "automotive", "mechanic"],
  "Security & Monitoring": ["security", "surveillance", "security cameras", "alarm", "remote monitoring", "video monitoring", "guard services"],
  "Marketing & Advertising": ["marketing", "seo", "social media", "advertising", "digital marketing", "lead generation", "branding", "google business profile", "online reviews"],
  "Software & SaaS": ["software", "saas", "api", "developers", "integrations", "dashboard", "workflow", "cloud platform", "product development"],
  "Retail & E-commerce": ["online store", "shop", "apparel", "clothing", "shoes", "jewelry", "furniture", "boutique"],
  "Education & Training": ["courses", "training", "students", "tutoring", "academy", "curriculum", "education"],
  Consulting: ["consulting", "consultant", "consultants", "advisory", "business strategy"],
  Manufacturing: ["manufacturing", "manufacturer", "fabrication", "machining", "industrial"],
};

const BUSINESS_MODELS: Record<string, string[]> = {
  "Local Service Business": ["estimate", "free estimate", "free estimates", "quote", "free quote", "get a quote", "request a quote", "request service", "schedule service", "service area", "areas we serve", "serving the", "call now", "call today", "call us today", "licensed", "licensed and insured", "years of experience", "family owned", "locally owned", "emergency service"],
  "E-commerce": ["add to cart", "shop now", "free shipping", "checkout", "buy now", "shop all", "in stock", "cart"],
  "SaaS / Subscription": ["free trial", "start free", "start for free", "get started free", "per month", "per user", "pricing", "subscription", "sign up", "request a demo", "book a demo", "get a demo", "contact sales"],
  "Professional Services": ["consultation", "free consultation", "schedule a consultation", "book a consultation", "client portal", "practice areas", "case results"],
  Agency: ["our work", "portfolio", "case studies", "agency", "hire us"],
  // Plain "menu" is excluded: every site's navigation has a "Menu" button
  "Hospitality & Venue": ["reservations", "make a reservation", "book a table", "our menu", "view menu", "food menu", "drink menu", "order online", "taproom", "happy hour", "live music", "tickets", "book your stay"],
  "Appointment-Based Services": ["book now", "book online", "book an appointment", "schedule an appointment", "schedule appointment", "appointments", "new patients"],
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word, case-insensitive matches only: "tax" must not match "syntax", "app" must not match "happy".
function countPhrase(text: string, phrase: string): number {
  return (text.match(new RegExp(`\\b${escapeRegex(phrase)}\\b`, "gi")) || []).length;
}

// Each keyword contributes: longer phrases are more specific, so they're worth more; summary and
// call-to-action text describe the business directly, so they count 3x; per-keyword caps stop one
// repeated word from deciding the result on its own.
function scoreCategories(
  categories: Record<string, string[]>,
  content: PageContent,
  useActions: boolean
): { label: string; score: number }[] {
  return Object.entries(categories)
    .map(([label, phrases]) => {
      const score = phrases.reduce((total, phrase) => {
        const specificity = phrase.split(" ").length;
        const inSummary = Math.min(countPhrase(content.summary, phrase), 3) * 3;
        const inActions = useActions ? Math.min(countPhrase(content.actions, phrase), 3) * 3 : 0;
        const inBody = Math.min(countPhrase(content.body, phrase), 5);
        return total + specificity * (inSummary + inActions + inBody);
      }, 0);
      return { label, score };
    })
    .sort((a, b) => b.score - a.score);
}

// Confidence = how much of all matched evidence the winner holds, scaled down when there's little evidence.
function toClassification(
  ranked: { label: string; score: number }[],
  fallback: string,
  minScore: number
): Classification {
  const [best] = ranked;
  if (!best || best.score < minScore) return { label: fallback, confidence: 0.2 };

  const total = ranked.reduce((sum, r) => sum + r.score, 0);
  const share = best.score / total;
  const evidence = Math.min(best.score / 20, 1);
  const confidence = 0.35 + 0.6 * share * evidence;
  return { label: best.label, confidence: Math.round(confidence * 100) / 100 };
}

export function detectIndustry(content: PageContent): Classification {
  return toClassification(scoreCategories(INDUSTRIES, content, false), "General Business", 4);
}

export function detectBusinessModel(content: PageContent): Classification {
  return toClassification(scoreCategories(BUSINESS_MODELS, content, true), "Service Provider", 3);
}

const STOP_WORDS = new Set(
  (
    "a about above after again against all also am an and any are as at be because been before being below between both but by can " +
    "could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is " +
    "it its itself just me more most my no nor not now of off on once only or other our ours out over own same she should so some " +
    "such than that the their theirs them then there these they this those through to too under until up very was we were what when " +
    "where which while who whom why will with would you your yours us get got let lets one two three first new best also may might " +
    "every many much make makes made need needs help helps like want know see find way ways thing things stuff year years day days " +
    "time times today please thank thanks yes able around within without across always never ever really even still back next last " +
    // Website boilerplate
    "home about contact menu click here read learn view page pages website site sites privacy policy terms conditions cookie cookies " +
    "rights reserved copyright accessibility information info skip content toggle navigation search login log sign email phone call " +
    "submit form subscribe newsletter follow share more less open close loading select video watch blog post posts news faq faqs " +
    // Words too generic to be a theme on their own
    "service services company companies business businesses customer customers client clients team quality professional experience " +
    "solutions solution products product people work working provide provides providing offer offers including use uses used " +
    "user users access grow growing saying says leave handle handles implement gives give whether based like start started"
  ).split(" ")
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .split(/[^a-z]+/)
    .filter((word) => word.length > 0);
}

const isContentWord = (word: string) => word.length >= 3 && !STOP_WORDS.has(word);

// Themes are the phrases a site keeps repeating. Two-word phrases ("water well", "craft beer")
// are preferred over single words because they carry more meaning; terms that are just part
// of the company's own name are skipped.
export function extractThemes(content: PageContent, companyName: string, limit = 8): string[] {
  const scores = new Map<string, number>();
  const add = (term: string, points: number) => scores.set(term, (scores.get(term) || 0) + points);

  const weightedBlocks: [string, number][] = [[content.summary, 3], ...content.blocks.map((b): [string, number] => [b, 1])];

  for (const [block, weight] of weightedBlocks) {
    // Pair words only within a phrase, so "...revenue. Accept payments" doesn't produce "revenue accept"
    for (const phrase of block.split(/[.,;:!?()|•·–—/"“”]+/)) {
      const words = tokenize(phrase);
      words.forEach((word, i) => {
        if (!isContentWord(word)) return;
        add(word, weight);
        const next = words[i + 1];
        if (next && isContentWord(next) && next !== word) add(`${word} ${next}`, weight * 2);
      });
    }
  }

  const name = tokenize(companyName).join(" ");
  const ranked = [...scores.entries()]
    .filter(([term, score]) => score >= (term.includes(" ") ? 4 : 3) && !name.includes(term))
    .sort((a, b) => b[1] - a[1]);

  // Drop single words already covered by a chosen phrase, e.g. "beer" when "craft beer" is a theme
  const candidates = ranked.slice(0, limit * 2).map(([term]) => term);
  const phrases = candidates.filter((term) => term.includes(" "));
  return candidates
    .filter((term) => term.includes(" ") || !phrases.some((phrase) => phrase.split(" ").includes(term)))
    .slice(0, limit);
}
