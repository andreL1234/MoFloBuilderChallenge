import { FieldSource, Knowledge, OnlinePresence } from "@/types/knowledge";
import { ScrapedSite } from "@/utils/scraper";
import { hostnameOf } from "@/utils/url";
import { detectBusinessModel, detectIndustry, extractThemes, industryGroupings, PageContent } from "@/utils/classifier";
import { completeness, deriveChannels, deriveCompanyRole, deriveFunnels, deriveTargetBuyers } from "@/utils/derive";
import { mockCustomerNeeds, mockIdealPersona, mockPitch } from "@/utils/mockAi";
import {
  BOILERPLATE_SELECTOR,
  cleanText,
  elementText,
  Page,
  pageKindFor,
  parsePage,
  sentences,
  truncateAtSentence,
  uniqueBy,
} from "@/utils/extract/text";
import { extractStructuredData } from "@/utils/extract/structuredData";
import { extractAddresses, extractEmails, extractPhones, extractServiceAreas, extractSocialLinks } from "@/utils/extract/contact";
import {
  extractAlternativeNames,
  extractAudiences,
  extractCtas,
  extractEmployeeCount,
  extractFoundingStory,
  extractHeadlines,
  extractLegalEntityType,
  extractMediaMentions,
  extractMission,
  extractPartners,
  extractTrustSignals,
  extractYearFounded,
} from "@/utils/extract/company";
import { extractOfferings } from "@/utils/extract/offerings";
import { extractKeyPeople } from "@/utils/extract/people";
import { extractFaqs, extractRating, extractTestimonials } from "@/utils/extract/socialProof";
import { extractColors, extractFonts, extractLogos } from "@/utils/extract/brand";
import { describeArtStyle, describeWritingStyle } from "@/utils/extract/style";

function extractMetadata(doc: Document) {
  const getMeta = (name: string) =>
    doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute("content") || "";
  return {
    title: cleanText(doc.querySelector("title")?.textContent),
    description: cleanText(getMeta("description") || getMeta("og:description")),
    keywords: getMeta("keywords"),
    siteName: cleanText(getMeta("og:site_name")),
  };
}

// "MoFlo – AI Marketing Platform for Local Businesses" -> "MoFlo"
function companyNameFrom(structuredName: string | undefined, siteName: string, title: string, url: string): string {
  if (structuredName) return structuredName;
  if (siteName) return siteName;
  const firstSegment = cleanText(title.split(/\s[|–—:-]\s|\s\|\s?/)[0]);
  return firstSegment || hostnameOf(url);
}

// Text in the shapes the classifier needs. Menus, footers, cookie banners, and hidden legal/modal
// text repeat on every site and drown out what the business actually does, so they're removed.
function buildPageContent(pages: Page[], metadata: ReturnType<typeof extractMetadata>): PageContent {
  const home = pages[0];
  const mainHeadings = Array.from(home.doc.querySelectorAll("h1, h2")).map((h) => elementText(h));
  const actions = Array.from(home.doc.querySelectorAll("a, button"))
    .map((el) => elementText(el))
    .filter((t) => t.length > 0 && t.length <= 40);

  const blocks: string[] = [];
  const bodies: string[] = [];
  // Staff bios ("favorite movie: …") and review pages describe people, not the business
  for (const page of pages.filter((p) => p.kind !== "team" && p.kind !== "reviews")) {
    const copy = page.doc.cloneNode(true) as Document;
    copy
      .querySelectorAll(`script, style, noscript, template, svg, iframe, nav, footer, ${BOILERPLATE_SELECTOR}`)
      .forEach((el) => el.remove());
    copy.body?.querySelectorAll("*").forEach((el) => el.append(" "));
    const pageBlocks = Array.from(copy.querySelectorAll("h1, h2, h3, h4, p, li, td, blockquote, figcaption"))
      .map((el) => cleanText(el.textContent))
      .filter((t) => t.length > 0);
    const body = cleanText(copy.body?.textContent);
    bodies.push(body);
    // Some sites put text in plain <div>s; fall back to the whole body as one block
    blocks.push(...(pageBlocks.join(" ").length >= 200 ? pageBlocks : [body]));
  }

  return {
    summary: [metadata.title, metadata.description, metadata.keywords, ...mainHeadings].join(" . "),
    actions: actions.join(" . "),
    body: bodies.join(" . "),
    blocks,
  };
}

// Unique selling propositions phrased as "why choose us", "specializes in", etc.
function extractUSPs(pages: Page[]): string[] {
  const patterns = [
    /(?:why choose us|our advantages|what makes us (?:different|unique)|what sets us apart)[:\s]*([^.!?]{10,200})/gi,
    /(?:key benefits|our strengths|core values?)[:\s]*([^.!?]{10,200})/gi,
    /(?:specializ(?:e|es|ing) in|focus(?:es)? on|experts? in)[:\s]*([^.!?]{10,200})/gi,
  ];
  const usps = pages.flatMap((page) => patterns.flatMap((p) => Array.from(page.contentText.matchAll(p)).map((m) => cleanText(m[1]))));
  return uniqueBy(usps.filter((u) => u.length > 10), (u) => u.slice(0, 40)).slice(0, 5);
}

// First substantial paragraph of real copy, used when the site has no meta description
function firstParagraph(home: Page): string | undefined {
  const paragraph = Array.from(home.doc.querySelectorAll("main p, section p, p"))
    .filter((p) => !p.closest("nav, header, footer"))
    .map((p) => elementText(p))
    .find((t) => t.length >= 60 && t.split(" ").length >= 10 && !/©|cookie/i.test(t));
  return paragraph ? truncateAtSentence(paragraph, 400) : undefined;
}

export function parseWebsite(site: ScrapedSite, inputUrl: string): Knowledge {
  const pages: Page[] = [
    parsePage(site.home.html, site.home.url, "home"),
    ...site.subpages.map((p) => parsePage(p.html, p.url, pageKindFor(p.url))),
  ];
  const home = pages[0];
  const homeHtml = site.home.html;
  const metadata = extractMetadata(home.doc);
  const structured = extractStructuredData(pages);
  const provenance: Record<string, FieldSource> = {};

  const companyName = companyNameFrom(structured.names[0], metadata.siteName, metadata.title, inputUrl);
  const content = buildPageContent(pages, metadata);

  // Classification
  const industry = detectIndustry(content);
  const businessModel = detectBusinessModel(content);
  const themes = extractThemes(content, companyName);

  // Contact & locations
  const phones = extractPhones(pages, structured.phones);
  const emails = extractEmails(pages, structured.emails, site.home.url);
  const addresses = extractAddresses(pages, structured.addresses);
  const serviceAreas = extractServiceAreas(pages, structured.areaServed);
  const socialLinks = extractSocialLinks(pages, structured.sameAs);

  // Company facts
  const yearFounded = extractYearFounded(pages, structured.foundingYear);
  const legalEntityType = extractLegalEntityType(pages, structured.legalName, metadata.title);
  const alternativeNames = extractAlternativeNames(pages, companyName, [...structured.names, structured.legalName]);
  const employeeCount = extractEmployeeCount(pages, structured.employees);
  const foundingStory = extractFoundingStory(pages);

  // People, offerings, social proof
  const keyPeople = extractKeyPeople(pages, structured.people);
  const offerings = extractOfferings(pages, structured.offerings);
  const testimonials = extractTestimonials(pages, structured.reviews);
  const faqs = extractFaqs(pages, structured.faqs);
  const reviewRating = extractRating(pages, structured.rating);

  // Messaging & brand
  const usps = extractUSPs(pages);
  const ctas = extractCtas(home);
  const headlines = extractHeadlines(home);
  const audiences = extractAudiences(pages, content.summary);
  const trustSignals = extractTrustSignals(pages);
  const partners = extractPartners(pages, companyName);
  const mediaMentions = extractMediaMentions(pages);
  const mission = extractMission(pages);
  const logos = extractLogos(home, structured.logos, companyName);
  const colors = extractColors(home, homeHtml);
  const fonts = extractFonts(home, homeHtml);

  // Derived fields (rules applied to extracted data)
  const companyRole = deriveCompanyRole(businessModel.label, industry.label);
  provenance["foundation.companyRole"] = "derived";
  provenance["foundation.industry"] = "derived";
  provenance["foundation.businessModel"] = "derived";
  const groupings = industryGroupings(content);
  provenance["marketAndCustomers.industryGroupings"] = "derived";
  const socialNames = (Object.keys(socialLinks) as (keyof OnlinePresence)[]).map((k) =>
    k === "twitter" ? "X / Twitter" : k.charAt(0).toUpperCase() + k.slice(1)
  );
  const channels = deriveChannels({
    socials: socialNames,
    hasPhone: phones.length > 0,
    hasEmail: emails.length > 0,
    text: home.text,
    html: homeHtml,
  });
  provenance["marketAndCustomers.channels"] = "derived";
  const funnels = deriveFunnels(ctas, home.text, homeHtml);
  provenance["marketAndCustomers.funnels"] = "derived";
  let targetBuyers = audiences;
  if (targetBuyers.length === 0) {
    targetBuyers = deriveTargetBuyers(businessModel.label);
    provenance["marketAndCustomers.targetBuyers"] = "derived";
  }
  const writingStyle = describeWritingStyle(content.blocks);
  const artStyle = describeArtStyle(home, colors, fonts);
  provenance["brandingAndStyle.writingStyle"] = "derived";
  provenance["brandingAndStyle.artStyle"] = "derived";

  // Placeholder AI enrichment (clearly labeled - see src/utils/mockAi.ts)
  const enrichmentInput = {
    companyName,
    industry: industry.label,
    offerings: offerings.map((o) => o.name),
    themes,
    usps,
    serviceAreas,
    audiences: targetBuyers,
    trustSignals,
  };
  let pitch = metadata.description || structured.description || firstParagraph(home);
  if (!pitch) {
    pitch = mockPitch(enrichmentInput);
    provenance["positioning.pitch"] = "mock-ai";
  }
  const customerNeeds = mockCustomerNeeds(enrichmentInput);
  provenance["marketAndCustomers.customerNeeds"] = "mock-ai";
  const idealPersona = mockIdealPersona(enrichmentInput);
  provenance["marketAndCustomers.idealPersona"] = "mock-ai";

  const otherContacts: Record<string, string> = {};
  if (phones.length > 0) otherContacts.phone = phones.join(", ");
  if (emails.length > 0) otherContacts.email = emails.join(", ");

  const overview =
    metadata.description ||
    structured.description ||
    sentences(firstParagraph(home) || "").slice(0, 2).join(" ") ||
    "";

  const knowledge: Knowledge = {
    id: `kb_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    sourceUrl: inputUrl,
    companyName,
    foundation: {
      overview,
      website: site.home.url,
      industry: industry.label,
      businessModel: businessModel.label,
      companyRole,
      industryConfidence: industry.confidence,
      businessModelConfidence: businessModel.confidence,
      yearFounded,
      legalEntityType,
      employeeCount,
      mainAddress: addresses[0],
      otherLocations: addresses.slice(1),
      serviceLocations: serviceAreas,
      alternativeNames,
    },
    positioning: { pitch, foundingStory },
    marketAndCustomers: {
      targetBuyers,
      customerNeeds,
      idealPersona,
      industryGroupings: groupings,
      channels,
      funnels,
      ctas,
      suppliers: partners,
    },
    brandingAndStyle: { writingStyle, artStyle, fonts, colors, logos },
    onlinePresence: { ...socialLinks, other: otherContacts },
    keyPeople,
    offerings,
    thinkBigger: {
      contentThemes: themes,
      uniqueSellingPropositions: usps,
      messagingHeadlines: headlines,
      testimonials,
      reviewRating,
      certifications: trustSignals,
      faqs,
      mediaCovers: mediaMentions,
      communityValues: mission,
    },
    scrapedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    provenance,
    pagesScraped: pages.map((p) => p.url),
    confidenceScore: 0,
  };

  // Completeness over the baseline fields in the assignment (mock-AI fields excluded so they can't inflate it)
  knowledge.confidenceScore = completeness([
    overview, industry.confidence >= 0.4 ? industry.label : undefined, businessModel.confidence >= 0.4 ? businessModel.label : undefined,
    yearFounded, legalEntityType, employeeCount, addresses[0], serviceAreas, alternativeNames,
    provenance["positioning.pitch"] ? undefined : pitch, foundingStory,
    audiences, ctas, partners, writingStyle, artStyle, fonts, colors, logos,
    Object.keys(socialLinks), keyPeople, offerings,
  ]);

  return knowledge;
}
