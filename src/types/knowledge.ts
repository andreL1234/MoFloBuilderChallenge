export interface CompanyFoundation {
  overview: string;
  website: string;
  industry: string;
  businessModel: string;
  companyRole: string;
  yearFounded?: number;
  legalEntityType?: string;
  employeeCount?: string;
  mainAddress?: string;
  otherLocations?: string[];
  serviceLocations?: string[];
  alternativeNames?: string[];
  industryConfidence?: number;
  businessModelConfidence?: number;
}

export interface Positioning {
  pitch?: string;
  foundingStory?: string;
}

export interface MarketAndCustomers {
  targetBuyers?: string[];
  customerNeeds?: string[];
  idealPersona?: string;
  industryGroupings?: string[];
  industryOutlook?: string;
  channels?: string[];
  funnels?: string[];
  ctas?: string[];
  suppliers?: string[];
}

export interface BrandingAndStyle {
  writingStyle?: string;
  artStyle?: string;
  fonts?: string[];
  colors?: string[];
  logos?: string[];
}

export interface OnlinePresence {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  other?: Record<string, string>;
}

export interface KeyPerson {
  name: string;
  title?: string;
  role?: string;
  gender?: string;
  description?: string;
  linkedinUrl?: string;
}

export interface Offering {
  name: string;
  category?: string;
  features?: string[];
  description?: string;
  pricing?: string;
}

export interface ThinkBiggerExtensions {
  contentThemes?: string[];
  uniqueSellingPropositions?: string[];
  testimonials?: string[];
  certifications?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  competitorInfo?: string;
  mediaCovers?: string[];
  communityValues?: string;
  messagingHeadlines?: string[];
  reviewRating?: string;
}

// Where a field's value came from, so reviewers know what to trust:
// extracted = read directly from the site, derived = computed from extracted data by a rule,
// mock-ai = placeholder standing in for an LLM call (see /prompts), user = edited by a person.
export type FieldSource = "extracted" | "derived" | "mock-ai" | "user";

export interface Knowledge {
  id: string;
  sourceUrl: string;
  companyName: string;
  foundation: CompanyFoundation;
  positioning: Positioning;
  marketAndCustomers: MarketAndCustomers;
  brandingAndStyle: BrandingAndStyle;
  onlinePresence: OnlinePresence;
  keyPeople?: KeyPerson[];
  offerings?: Offering[];
  thinkBigger?: ThinkBiggerExtensions;
  scrapedAt: string;
  updatedAt: string;
  confidenceScore?: number;
  // Keyed by field path, e.g. "marketAndCustomers.idealPersona"; fields not listed are "extracted"
  provenance?: Record<string, FieldSource>;
  pagesScraped?: string[];
}
