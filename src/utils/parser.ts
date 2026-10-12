import { Knowledge, CompanyFoundation, Positioning, MarketAndCustomers, BrandingAndStyle, OnlinePresence } from "@/types/knowledge";

// Simple HTML text extraction
function extractText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// Extract metadata from HTML
function extractMetadata(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const getMeta = (name: string) => {
    const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta?.getAttribute("content") || "";
  };

  return {
    title: doc.querySelector("title")?.textContent || "",
    description: getMeta("description") || getMeta("og:description") || "",
    image: getMeta("og:image") || "",
    keywords: getMeta("keywords") || "",
  };
}

// Extract text from sections
function extractFromHeadings(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  return headings
    .map((h) => h.textContent?.trim() || "")
    .filter((text) => text.length > 0 && text.length < 500);
}

// Extract URLs and contact info
function extractUrls(html: string) {
  const urls = new Set<string>();
  const phoneRegex = /(\+?1)?[-.\s]?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
  const emailRegex = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  const text = new DOMParser().parseFromString(html, "text/html").body.textContent || "";

  const links = Array.from(new DOMParser().parseFromString(html, "text/html").querySelectorAll("a[href]"));
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href) urls.add(href);
  });

  const phones = text.match(phoneRegex) || [];
  const emails = text.match(emailRegex) || [];

  return {
    urls: Array.from(urls),
    phones: [...new Set(phones)],
    emails: [...new Set(emails)],
  };
}

// Extract social media links
function extractSocialLinks(html: string): Partial<OnlinePresence> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll("a[href]"));

  const social: Partial<OnlinePresence> = {};

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";

    if (href.includes("linkedin.com")) social.linkedin = href;
    if (href.includes("facebook.com")) social.facebook = href;
    if (href.includes("twitter.com") || href.includes("x.com")) social.twitter = href;
    if (href.includes("instagram.com")) social.instagram = href;
    if (href.includes("youtube.com")) social.youtube = href;
    if (href.includes("tiktok.com")) social.tiktok = href;
  });

  return social;
}

// Extract images/logos
function extractImages(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const images = Array.from(doc.querySelectorAll("img"));
  const logos = images
    .filter((img) => {
      const alt = img.getAttribute("alt") || "";
      const src = img.getAttribute("src") || "";
      return (
        alt.toLowerCase().includes("logo") ||
        src.toLowerCase().includes("logo")
      );
    })
    .map((img) => img.getAttribute("src") || "")
    .filter((src) => src.length > 0);

  return logos.length > 0 ? logos : images.slice(0, 3).map((img) => img.getAttribute("src") || "");
}

// Extract color palette from CSS
function extractColors(html: string): string[] {
  const colorRegex = /#[0-9A-Fa-f]{6}\b/g;
  const matches = html.match(colorRegex) || [];
  return [...new Set(matches)].slice(0, 5);
}

// Extract fonts
function extractFonts(html: string): string[] {
  const fontRegex = /font-family:\s*([^;]+)/gi;
  const matches = html.match(fontRegex) || [];
  return matches.slice(0, 3);
}

// Extract content for themes/USPs
function extractContentThemes(html: string): string[] {
  const text = new DOMParser().parseFromString(html, "text/html").body.textContent || "";
  const lines = text.split("\n").filter((line) => line.length > 20 && line.length < 200);

  // Simple keyword extraction - look for repeated meaningful phrases
  const keywords: Record<string, number> = {};
  const commonWords = ["the", "a", "and", "or", "in", "on", "at", "to", "is", "are", "be", "we", "you", "our", "your"];

  lines.forEach((line) => {
    const words = line.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      const clean = word.replace(/[^a-z0-9]/g, "");
      if (clean.length > 4 && !commonWords.includes(clean)) {
        keywords[clean] = (keywords[clean] || 0) + 1;
      }
    });
  });

  return Object.entries(keywords)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// Identify unique selling propositions from content
function extractUSPs(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const usps: string[] = [];

  // Look for common patterns
  const text = doc.body.textContent || "";
  const patterns = [
    /(?:why choose us|our advantages|what makes us|unique about us)[:\s]*([^.!?]{10,200})/gi,
    /(?:key benefits|our strengths|core value)[:\s]*([^.!?]{10,200})/gi,
    /(?:specializes? in|focuses? on|expert in)[:\s]*([^.!?]{10,200})/gi,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const usp = match[1].trim();
      if (usp.length > 10 && usp.length < 200) {
        usps.push(usp);
      }
    }
  });

  return [...new Set(usps)].slice(0, 5);
}

export function parseWebsite(html: string, url: string): Knowledge {
  const metadata = extractMetadata(html);
  const { phones } = extractUrls(html);
  const socialLinks = extractSocialLinks(html);
  const logos = extractImages(html);
  const colors = extractColors(html);
  const fonts = extractFonts(html);
  const themes = extractContentThemes(html);
  const usps = extractUSPs(html);

  const companyName = metadata.title.split("|")[0].trim() || new URL(url).hostname;
  const allText = extractText(html);

  const foundation: CompanyFoundation = {
    overview: metadata.description || "Company information from website",
    website: url,
    industry: "Unknown",
    businessModel: "Unknown",
    companyRole: "Service Provider",
  };

  const positioning: Positioning = {
    pitch: allText.substring(0, 500),
  };

  const marketAndCustomers: MarketAndCustomers = {
    channels: ["Website"],
    ctas: extractFromHeadings(html).slice(0, 3),
  };

  const brandingAndStyle: BrandingAndStyle = {
    writingStyle: "Professional",
    colors: colors.length > 0 ? colors : ["#000000"],
    logos: logos,
    fonts: fonts,
  };

  const onlinePresence: OnlinePresence = {
    ...socialLinks,
    other: phones.length > 0 ? { phones: phones.join(", ") } : {},
  };

  const now = new Date().toISOString();
  const id = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    sourceUrl: url,
    companyName,
    foundation,
    positioning,
    marketAndCustomers,
    brandingAndStyle,
    onlinePresence,
    offerings: [],
    keyPeople: [],
    thinkBigger: {
      contentThemes: themes,
      uniqueSellingPropositions: usps,
    },
    scrapedAt: now,
    updatedAt: now,
    confidenceScore: 0.6,
  };
}
