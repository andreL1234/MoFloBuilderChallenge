import { Offering } from "@/types/knowledge";
import { cleanText, elementText, Page, truncateAtSentence, uniqueBy } from "./text";
import { looksLikePersonName } from "./people";

const GENERIC_LABEL = /^(learn more|read more|view (all|more)|see (all|more)|more info|details|click here|home|about( us)?|contact( us)?|get started|call( now| us)?|request.*|book.*|schedule.*|our (services|products)|services|products|all (services|products)|blog|faqs?|testimonials|reviews|gallery|careers|shop all|menu|close|open|next|previous|back)$/i;

const PRICE = /\$\s?\d[\d,]*(?:\.\d{2})?(?:\s*(?:-|–|to)\s*\$?\d[\d,]*(?:\.\d{2})?)?(?:\s*(?:\/|per)\s*(?:mo|month|yr|year|hr|hour|user|person|visit|sq\.? ?ft))?/i;

// Names, not sentences or taglines: "Well Drilling" yes, "Not just a brewery…it's a destination." no
function isOfferingName(text: string): boolean {
  const words = text.split(" ").length;
  return (
    text.length >= 3 &&
    text.length <= 60 &&
    words <= 8 &&
    !GENERIC_LABEL.test(text) &&
    !/[?!©@.…]|^\d+$/.test(text) &&
    !/^(a|an|the|not|now|we|our|your|you|it|this|why|how|what|when|ready|welcome|meet)\b/i.test(text) &&
    !/privacy|cookie|terms|respect|copyright|^select\b|^find\b/i.test(text) &&
    !/,\s*[A-Z]{2}$/.test(text) && // "Minneapolis, MN" - a location picker, not an offering
    !looksLikePersonName(text)
  );
}

// Most small-business sites list every service in the nav's "Services" dropdown
function fromNavigation(page: Page): Offering[] {
  const offerings: Offering[] = [];
  page.doc.querySelectorAll("nav li, header li").forEach((li) => {
    const link = li.querySelector(":scope > a, :scope > span, :scope > button");
    const label = cleanText(link?.textContent);
    const match = label.match(/^(our )?(services|products|what we do|solutions|menu|shop)$/i);
    if (!match) return;
    const category = /product|shop/i.test(label) ? "Product" : "Service";
    li.querySelectorAll(":scope ul a").forEach((a) => {
      const name = cleanText(a.textContent);
      if (isOfferingName(name)) offerings.push({ name, category });
    });
  });
  return offerings;
}

// Cards/sections whose class or id says service/product, e.g. <div class="service-card"><h3>…</h3><p>…</p></div>
function fromSections(page: Page): Offering[] {
  const offerings: Offering[] = [];
  page.doc
    .querySelectorAll('[class*="service" i], [class*="product" i], [class*="offering" i], [class*="pricing" i], [class*="package" i]')
    .forEach((container) => {
      if (container.closest("nav, header, footer")) return;
      const heading = container.querySelector("h2, h3, h4, h5");
      const name = elementText(heading);
      if (!isOfferingName(name)) return;
      const description = elementText(container.querySelector("p"));
      const containerText = elementText(container);
      const features = Array.from(container.querySelectorAll("li"))
        .map((li) => elementText(li))
        .filter((f) => f.length >= 3 && f.length <= 80)
        .slice(0, 5);
      offerings.push({
        name,
        category: /product|shop|cart/i.test(container.className + containerText) ? "Product" : "Service",
        description: description.length >= 20 ? truncateAtSentence(description, 220) : undefined,
        features: features.length > 0 ? features : undefined,
        pricing: containerText.match(PRICE)?.[0],
      });
    });
  return offerings;
}

// On a dedicated services page, each h2/h3 is usually one offering followed by its description
function fromServicesPage(page: Page): Offering[] {
  if (page.kind !== "services") return [];
  const main = page.doc.querySelector("main") ?? page.doc.body;
  const offerings: Offering[] = [];
  main.querySelectorAll("h2, h3").forEach((heading) => {
    if (heading.closest("nav, header, footer")) return;
    const name = elementText(heading);
    if (!isOfferingName(name)) return;
    let description = "";
    let node = heading.nextElementSibling;
    while (node && !/^H[1-3]$/.test(node.tagName) && description.length < 200) {
      description += ` ${elementText(node)}`;
      node = node.nextElementSibling;
    }
    description = cleanText(description);
    offerings.push({
      name,
      category: "Service",
      description: description.length >= 20 ? truncateAtSentence(description, 220) : undefined,
      pricing: description.match(PRICE)?.[0],
    });
  });
  return offerings;
}

export function extractOfferings(pages: Page[], fromStructuredData: Offering[]): Offering[] {
  const all: Offering[] = [
    ...fromStructuredData,
    ...pages.flatMap(fromNavigation),
    ...pages.flatMap(fromServicesPage),
    ...pages.flatMap(fromSections),
  ];

  // Merge duplicates, keeping the richest details seen for each name
  const merged = new Map<string, Offering>();
  for (const offering of all) {
    const key = offering.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const existing = merged.get(key);
    merged.set(key, {
      name: existing?.name ?? offering.name,
      category: existing?.category ?? offering.category,
      description: existing?.description ?? offering.description,
      features: existing?.features ?? offering.features,
      pricing: existing?.pricing ?? offering.pricing,
    });
  }
  return uniqueBy([...merged.values()], (o) => o.name).slice(0, 12);
}
