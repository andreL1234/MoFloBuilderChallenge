import { Knowledge, CompanyFoundation, Positioning, MarketAndCustomers, BrandingAndStyle, OnlinePresence } from "@/types/knowledge";

// Simple HTML text extraction - removes script and style tags
function extractText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Remove script and style tags to avoid extracting CSS/JS
  const scripts = doc.querySelectorAll("script, style, meta, link, noscript");
  scripts.forEach(script => script.remove());

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

// Extract services/products from common patterns
function extractServices(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const services: { name: string; description: string }[] = [];

  // Look for service containers (div, li, section with common class names)
  const serviceSelectors = [
    '[class*="service"]',
    '[class*="product"]',
    '[class*="offering"]',
    '[class*="feature"]',
  ];

  serviceSelectors.forEach((selector) => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const headings = el.querySelectorAll("h2, h3, h4, .title, .name");
      const descriptions = el.querySelectorAll("p, .description, .details");

      if (headings.length > 0) {
        const name = headings[0].textContent?.trim() || "";
        const description = descriptions[0]?.textContent?.trim() || "";

        if (name && name.length > 3 && name.length < 100) {
          services.push({ name, description: description.substring(0, 200) });
        }
      }
    });
  });

  return services.slice(0, 8);
}

// Extract team members from common patterns
function extractTeamMembers(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const team: { name: string; title: string; description: string }[] = [];

  // Look for team sections
  const teamSelectors = [
    '[class*="team"]',
    '[class*="staff"]',
    '[class*="people"]',
    '[class*="about"] [class*="person"]',
  ];

  teamSelectors.forEach((selector) => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const name = el.querySelector("h2, h3, h4, .name, .person-name")?.textContent?.trim() || "";
      const title = el.querySelector(".title, .position, .role, .job-title")?.textContent?.trim() || "";
      const description = el.querySelector("p, .bio, .description")?.textContent?.trim() || "";

      if (name && name.length > 3 && name.length < 100) {
        team.push({
          name,
          title: title.substring(0, 50),
          description: description.substring(0, 150)
        });
      }
    });
  });

  return team.slice(0, 8);
}

// Extract FAQ content
function extractFAQs(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const faqs: { question: string; answer: string }[] = [];

  // Look for FAQ patterns
  const faqSelectors = [
    '[class*="faq"]',
    '[class*="qa"]',
    '[class*="question"]',
    'dt',
  ];

  faqSelectors.forEach((selector) => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const question = el.querySelector("h3, h4, .question, summary")?.textContent?.trim() ||
                      el.textContent?.trim() || "";
      const answerEl = el.nextElementSibling;
      const answer = answerEl?.querySelector("p, .answer, [class*='content']")?.textContent?.trim() ||
                    answerEl?.textContent?.trim() || "";

      if (question && answer && question.length > 5 && answer.length > 10) {
        faqs.push({
          question: question.substring(0, 150),
          answer: answer.substring(0, 300)
        });
      }
    });
  });

  return faqs.slice(0, 6);
}

// Extract testimonials/reviews
function extractTestimonials(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const testimonials: string[] = [];

  // Look for testimonial patterns
  const testSelectors = [
    '[class*="testimonial"]',
    '[class*="review"]',
    '[class*="quote"]',
    '[class*="feedback"]',
    '[class*="case-study"]',
  ];

  testSelectors.forEach((selector) => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const text = el.querySelector("p, blockquote, .text, .content")?.textContent?.trim() || "";
      if (text && text.length > 20 && text.length < 500) {
        testimonials.push(text);
      }
    });
  });

  return [...new Set(testimonials)].slice(0, 5);
}

// Extract mission/vision/values statements
function extractMissionStatement(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = doc.body.textContent || "";

  // Look for mission/vision patterns
  const patterns = [
    /(?:our mission|mission statement)[:\s]*([^.!?]{20,300})/i,
    /(?:our vision|vision statement)[:\s]*([^.!?]{20,300})/i,
    /(?:our purpose|core purpose)[:\s]*([^.!?]{20,300})/i,
    /(?:our values|core values)[:\s]*([^.!?]{20,300})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "";
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

  // Enhanced extraction (simplified for reliability)
  // Note: Advanced extraction functions exist but are disabled for MVP
  // They often don't find data on non-standard website structures
  const services: any[] = [];
  const teamMembers: any[] = [];
  const faqs: any[] = [];
  const testimonials: any[] = [];
  const mission = "";

  const companyName = metadata.title.split("|")[0].trim() || new URL(url).hostname;

  const foundation: CompanyFoundation = {
    overview: metadata.description || "Company information from website",
    website: url,
    industry: "Unknown",
    businessModel: "Unknown",
    companyRole: "Service Provider",
  };

  // Extract better pitch text - prefer metadata description, then find good paragraph
  let pitchText = metadata.description || "";

  if (!pitchText) {
    // Remove nav, footer, header elements to avoid their text
    const docForPitch = new DOMParser().parseFromString(html, "text/html");
    const elementsToRemove = docForPitch.querySelectorAll("nav, header, footer, script, style, [class*='nav'], [class*='menu'], [class*='sidebar']");
    elementsToRemove.forEach(el => el.remove());

    const textLines = (docForPitch.body.textContent || "")
      .split("\n")
      .map(line => line.trim())
      .filter(line => {
        // Filter: substantive paragraphs only
        if (line.length < 50 || line.length > 400) return false;
        if (line.match(/^[0-9\s,.-]+$/)) return false; // Just numbers
        if (line.includes("\t") || line.includes("©")) return false; // Special formatting
        if (line.split(" ").length < 8) return false; // Need at least 8 words
        return true;
      });

    pitchText = textLines.length > 0
      ? textLines[0].substring(0, 400)
      : "Company information from website";
  }

  const positioning: Positioning = {
    pitch: pitchText,
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

  // Calculate confidence score based on what was extracted
  let confidence = 0.5;
  if (metadata.description) confidence += 0.1;
  if (socialLinks.linkedin || socialLinks.facebook) confidence += 0.1;
  if (logos.length > 0) confidence += 0.05;
  if (colors.length > 0) confidence += 0.05;
  if (themes.length > 0) confidence += 0.1;
  if (usps.length > 0) confidence += 0.1;
  if (services.length > 0) confidence += 0.05;
  if (teamMembers.length > 0) confidence += 0.05;
  if (faqs.length > 0) confidence += 0.03;
  if (testimonials.length > 0) confidence += 0.03;
  confidence = Math.min(confidence, 0.99); // Cap at 0.99 for high quality

  return {
    id,
    sourceUrl: url,
    companyName,
    foundation,
    positioning,
    marketAndCustomers,
    brandingAndStyle,
    onlinePresence,
    offerings: services.map(s => ({
      name: s.name,
      category: "Service",
      description: s.description,
      features: [],
    })),
    keyPeople: teamMembers.map(t => ({
      name: t.name,
      title: t.title,
      description: t.description,
    })),
    thinkBigger: {
      contentThemes: themes,
      uniqueSellingPropositions: usps,
      testimonials: testimonials.length > 0 ? testimonials : undefined,
      faqs: faqs.length > 0 ? faqs : undefined,
      communityValues: mission || undefined,
    },
    scrapedAt: now,
    updatedAt: now,
    confidenceScore: confidence,
  };
}
