// Rule-based fields computed from extracted data. Marked "derived" in provenance:
// deterministic and explainable, but an inference rather than something the site states.

export function deriveCompanyRole(businessModel: string, industry: string): string {
  if (/manufactur/i.test(industry)) return "Manufacturer";
  const byModel: Record<string, string> = {
    "Local Service Business": "Local service provider",
    "E-commerce": "Retailer",
    "SaaS / Subscription": "Software vendor",
    "Professional Services": "Professional services firm",
    Agency: "Agency",
    "Hospitality & Venue": "Hospitality operator",
    "Appointment-Based Services": "Appointment-based provider",
  };
  return byModel[businessModel] ?? "Service provider";
}

export function deriveChannels(signals: {
  socials: string[];
  hasPhone: boolean;
  hasEmail: boolean;
  text: string; // visible text - scripts mention "subscribe"/"demo" for unrelated reasons
  html: string; // raw markup - only for link targets like Google Maps
}): string[] {
  const channels = ["Website"];
  if (signals.hasPhone) channels.push("Phone");
  if (signals.hasEmail) channels.push("Email");
  channels.push(...signals.socials);
  if (/newsletter|subscribe/i.test(signals.text)) channels.push("Newsletter");
  if (/google\.com\/maps|maps\.google|g\.page/i.test(signals.html)) channels.push("Google Business Profile");
  return channels;
}

// Map the site's CTAs and page signals to the conversion paths a visitor can take
export function deriveFunnels(ctas: string[], visibleText: string, html: string): string[] {
  const text = `${ctas.join(" | ")} ${visibleText}`;
  const funnels: [RegExp, string, string][] = [
    [/\b(quote|estimate)s?\b/i, "Quote request", text],
    [/\b(book|appointment|schedule|reserv\w*)\b/i, "Booking / appointment", text],
    [/free trial|start (for )?free|sign up/i, "Free trial / signup", text],
    [/\b(get|request|book) a demo\b/i, "Demo request", text],
    [/add to cart|checkout|shop now|buy now/i, "Online purchase", text],
    [/<form/i, "Contact form", html],
    [/href="tel:/i, "Phone call", html],
    [/newsletter|subscribe/i, "Newsletter signup", text],
  ];
  return funnels.filter(([pattern, , source]) => pattern.test(source)).map(([, label]) => label);
}

export function deriveTargetBuyers(businessModel: string): string[] {
  if (businessModel === "SaaS / Subscription" || businessModel === "Agency") return ["Businesses"];
  if (businessModel === "Professional Services") return ["Individuals", "Businesses"];
  return ["Local consumers"];
}

// Share of baseline fields that ended up filled, so "complete" means something concrete
export function completeness(values: unknown[]): number {
  const filled = values.filter((v) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "")).length;
  return Math.round((filled / values.length) * 100) / 100;
}
