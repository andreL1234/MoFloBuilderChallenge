// PLACEHOLDER AI ENRICHMENT - no LLM is called.
// The assignment allows mock outputs for fields that need an LLM, as long as they're labeled.
// Each function below stands in for one prompt in /prompts/EXAMPLE_PROMPTS.md and fills the field
// from a template using extracted data. Every value is marked "mock-ai" in provenance, and the UI
// shows a "Mock AI" badge on it, so it's never mistaken for something the website said.

interface EnrichmentInput {
  companyName: string;
  industry: string;
  offerings: string[];
  themes: string[];
  usps: string[];
  serviceAreas: string[];
  audiences: string[];
  trustSignals: string[];
}

const list = (items: string[], max = 2) => items.slice(0, max).join(" and ");

// Stand-in for Prompt 1 (company pitch). Only used when the site has no meta description.
export function mockPitch(input: EnrichmentInput): string {
  const focus = list(input.offerings.length > 0 ? input.offerings : input.themes) || input.industry.toLowerCase();
  const where = input.serviceAreas[0] ? ` across ${input.serviceAreas[0]}` : "";
  const proof = input.usps[0] || input.trustSignals[0];
  return `${input.companyName} delivers ${focus}${where}.${proof ? ` ${proof}` : ""}`;
}

// Stand-in for Prompt 3 (target persona) - customer needs half
export function mockCustomerNeeds(input: EnrichmentInput): string[] {
  const topics = input.offerings.length > 0 ? input.offerings : input.themes;
  const needs = topics.slice(0, 2).map((topic) => `Dependable help with ${topic.toLowerCase()}`);
  needs.push(input.serviceAreas[0] ? `A provider who reliably serves ${input.serviceAreas[0]}` : "Fast, clear communication");
  if (input.trustSignals.length > 0) needs.push("Confidence they're hiring a qualified, trustworthy business");
  return needs;
}

// Stand-in for Prompt 3 (target persona) - persona half
export function mockIdealPersona(input: EnrichmentInput): string {
  const who = input.audiences[0] || "Customers";
  const where = input.serviceAreas[0] ? ` in ${input.serviceAreas[0]}` : "";
  const what = list(input.offerings.length > 0 ? input.offerings : input.themes) || input.industry.toLowerCase();
  return `${who}${where} who need ${what.toLowerCase()} and choose ${input.companyName} for a trusted, ${input.industry.toLowerCase()} specialist they can rely on.`;
}
