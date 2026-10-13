import { cleanText, Page } from "./text";

// Many small-business sites embed schema.org JSON-LD for SEO (Yoast, Wix, Squarespace do it by
// default). When present it's the most reliable source we have: address, phone, founding date,
// FAQs, and reviews in machine-readable form.

export interface StructuredData {
  names: string[];
  legalName?: string;
  description?: string;
  foundingYear?: number;
  addresses: string[];
  phones: string[];
  emails: string[];
  employees?: string;
  sameAs: string[];
  logos: string[];
  areaServed: string[];
  faqs: { question: string; answer: string }[];
  reviews: string[];
  rating?: string;
  offerings: { name: string; description?: string; pricing?: string }[];
  people: { name: string; title?: string }[];
}

type Node = Record<string, unknown>;

const ORG_TYPE = /Organization|Business|Corporation|Company|Store|Restaurant|Brewery|Winery|Bar|Cafe|Service|Contractor|Agent|Agency|Practice|Office|Clinic|Dentist|Attorney|Plumber|Electrician|Roofing|HVAC|Physician|Shop|Center|Salon|Spa|Gym|Hotel|Dealer/i;

function asArray<T = unknown>(value: unknown): T[] {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]) as T[];
}

function str(value: unknown): string | undefined {
  if (typeof value === "string") return cleanText(value.replace(/<[^>]+>/g, " ")) || undefined;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "name" in value) return str((value as Node).name);
  return undefined;
}

function typesOf(node: Node): string[] {
  return asArray<string>(node["@type"]).filter((t) => typeof t === "string");
}

function formatAddress(value: unknown): string | undefined {
  if (typeof value === "string") return cleanText(value);
  if (!value || typeof value !== "object") return undefined;
  const a = value as Node;
  const line = [str(a.streetAddress), str(a.addressLocality), [str(a.addressRegion), str(a.postalCode)].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return line || undefined;
}

// Walk every object in the JSON-LD graph, including nested ones (@graph, mainEntity, offers...)
function collectNodes(value: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(value)) value.forEach((v) => collectNodes(v, out));
  else if (value && typeof value === "object") {
    out.push(value as Node);
    Object.values(value as Node).forEach((v) => collectNodes(v, out));
  }
  return out;
}

export function extractStructuredData(pages: Page[]): StructuredData {
  const data: StructuredData = {
    names: [],
    addresses: [],
    phones: [],
    emails: [],
    sameAs: [],
    logos: [],
    areaServed: [],
    faqs: [],
    reviews: [],
    offerings: [],
    people: [],
  };

  const nodes: Node[] = [];
  for (const page of pages) {
    page.doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      try {
        collectNodes(JSON.parse(script.textContent || ""), nodes);
      } catch {
        // Malformed JSON-LD is common; skip it
      }
    });
  }

  for (const node of nodes) {
    const types = typesOf(node);

    if (types.some((t) => ORG_TYPE.test(t)) && !types.includes("WebSite") && !types.includes("WebPage")) {
      const name = str(node.name);
      if (name) data.names.push(name);
      asArray(node.alternateName).forEach((n) => str(n) && data.names.push(str(n)!));
      data.legalName ||= str(node.legalName);
      data.description ||= str(node.description);
      const founded = str(node.foundingDate)?.match(/(18|19|20)\d{2}/);
      if (founded && !data.foundingYear) data.foundingYear = Number(founded[0]);
      asArray(node.address).forEach((a) => {
        const formatted = formatAddress(a);
        if (formatted) data.addresses.push(formatted);
      });
      asArray(node.telephone).forEach((t) => str(t) && data.phones.push(str(t)!));
      asArray(node.email).forEach((e) => str(e) && data.emails.push(str(e)!.replace(/^mailto:/i, "")));
      const employees = node.numberOfEmployees as Node | string | number | undefined;
      if (employees && !data.employees) {
        data.employees =
          typeof employees === "object" ? str(employees.value) ?? str(employees.minValue) : String(employees);
      }
      asArray(node.sameAs).forEach((s) => typeof s === "string" && data.sameAs.push(s));
      asArray(node.logo).forEach((l) => {
        const url = typeof l === "string" ? l : str((l as Node)?.url);
        if (url) data.logos.push(url);
      });
      asArray(node.areaServed).forEach((a) => str(a) && data.areaServed.push(str(a)!));
      asArray(node.founder).forEach((f) => str(f) && data.people.push({ name: str(f)!, title: "Founder" }));
    }

    if (types.includes("Question")) {
      const question = str(node.name);
      const answer = str((node.acceptedAnswer as Node | undefined)?.text);
      if (question && answer) data.faqs.push({ question, answer });
    }

    if (types.includes("Review")) {
      const body = str(node.reviewBody);
      if (body) data.reviews.push(body);
    }

    if (types.includes("AggregateRating") && !data.rating) {
      const value = str(node.ratingValue);
      const count = str(node.reviewCount) ?? str(node.ratingCount);
      if (value) data.rating = count ? `${value} / 5 from ${count} reviews` : `${value} / 5`;
    }

    if (types.some((t) => t === "Product" || t === "Service" || t === "MenuItem")) {
      const name = str(node.name);
      if (name) {
        const offer = asArray<Node>(node.offers)[0];
        const price = offer ? str(offer.price) : undefined;
        const currency = offer ? str(offer.priceCurrency) : undefined;
        data.offerings.push({
          name,
          description: str(node.description),
          pricing: price ? `${currency === "USD" || !currency ? "$" : currency + " "}${price}` : undefined,
        });
      }
    }

    if (types.includes("Person")) {
      const name = str(node.name);
      if (name) data.people.push({ name, title: str(node.jobTitle) });
    }
  }

  return data;
}
