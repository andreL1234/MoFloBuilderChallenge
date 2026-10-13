"use client";

import { FieldSource, Knowledge } from "@/types/knowledge";
import { hostnameOf, safeExternalUrl, withProtocol } from "@/utils/url";
import BrandIdentity from "@/components/BrandIdentity";
import { Chip, ConfidenceBadge, LogoMark, SectionCard } from "@/components/ui";

const socialPlatforms = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "twitter", label: "X / Twitter" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
] as const;

const SOURCE_BADGES: Record<Exclude<FieldSource, "extracted">, { label: string; title: string; className: string }> = {
  derived: {
    label: "Derived",
    title: "Computed by a rule from extracted data, not stated on the site",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  "mock-ai": {
    label: "Mock AI",
    title: "Placeholder standing in for an LLM call - see prompts/EXAMPLE_PROMPTS.md",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  user: {
    label: "Edited",
    title: "Changed by a person after scraping",
    className: "bg-brand-50 text-brand-700 ring-brand-100",
  },
};

export function SourceBadge({ source }: { source?: FieldSource }) {
  if (!source || source === "extracted") return null;
  const badge = SOURCE_BADGES[source];
  return (
    <span title={badge.title} className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function Field({ label, source, children }: { label: string; source?: FieldSource; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="flex shrink-0 items-center gap-2 text-sm text-muted">
        {label}
        <SourceBadge source={source} />
      </dt>
      <dd className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink sm:justify-end sm:text-right">{children}</dd>
    </div>
  );
}

function Block({ label, source, children }: { label: string; source?: FieldSource; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
        <SourceBadge source={source} />
      </h4>
      {children}
    </div>
  );
}

function Empty({ children = "Not found on the site." }: { children?: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

function ChipList({ items, tone }: { items?: string[]; tone?: "neutral" | "brand" }) {
  if (!items || items.length === 0) return <Empty />;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Chip key={item} tone={tone}>
          {item}
        </Chip>
      ))}
    </div>
  );
}

function BulletList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <Empty />;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// Header row used above the preview (light) and inside the detail page hero (dark).
export function KnowledgeHeader({
  knowledge,
  onDark = false,
  actions,
}: {
  knowledge: Knowledge;
  onDark?: boolean;
  actions?: React.ReactNode;
}) {
  const website = safeExternalUrl(withProtocol(knowledge.foundation.website || knowledge.sourceUrl));
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-center gap-5">
        <LogoMark key={knowledge.id} knowledge={knowledge} className="h-16 w-16 sm:h-20 sm:w-20" />
        <div className="min-w-0">
          <h1 className={`text-2xl font-semibold tracking-tight sm:text-4xl ${onDark ? "text-white" : "text-ink"}`}>
            {knowledge.companyName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm underline-offset-4 hover:underline ${onDark ? "text-white/80" : "text-brand-600"}`}
              >
                {hostnameOf(knowledge.sourceUrl)}
              </a>
            )}
            <span className={onDark ? "text-white/40" : "text-line"}>•</span>
            <span className={`text-sm ${onDark ? "text-white/80" : "text-muted"}`}>{knowledge.foundation.industry}</span>
            <ConfidenceBadge value={knowledge.confidenceScore} label="complete" />
          </div>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-nowrap">{actions}</div>}
    </div>
  );
}

export default function KnowledgeDisplay({ knowledge }: { knowledge: Knowledge }) {
  const { foundation, positioning, marketAndCustomers: market, onlinePresence, thinkBigger, brandingAndStyle } = knowledge;
  const source = (path: string) => knowledge.provenance?.[path];

  const socials = socialPlatforms
    .map((platform) => ({ ...platform, url: safeExternalUrl(onlinePresence[platform.key]) }))
    .filter((platform) => platform.url);
  const otherContacts = Object.entries(onlinePresence.other || {});
  const locations = [foundation.mainAddress, ...(foundation.otherLocations || [])].filter(Boolean) as string[];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Company foundation" description={foundation.overview || undefined}>
          <dl className="divide-y divide-line">
            <Field label="Industry" source={source("foundation.industry")}>
              {foundation.industry}
              {foundation.industryConfidence !== undefined && <ConfidenceBadge value={foundation.industryConfidence} />}
            </Field>
            <Field label="Business model" source={source("foundation.businessModel")}>
              {foundation.businessModel}
              {foundation.businessModelConfidence !== undefined && (
                <ConfidenceBadge value={foundation.businessModelConfidence} />
              )}
            </Field>
            <Field label="Company role" source={source("foundation.companyRole")}>
              {foundation.companyRole}
            </Field>
            <Field label="Founded" source={source("foundation.yearFounded")}>{foundation.yearFounded ?? <span className="font-normal text-muted">Unknown</span>}</Field>
            <Field label="Legal entity" source={source("foundation.legalEntityType")}>{foundation.legalEntityType ?? <span className="font-normal text-muted">Unknown</span>}</Field>
            <Field label="Employees" source={source("foundation.employeeCount")}>{foundation.employeeCount ?? <span className="font-normal text-muted">Unknown</span>}</Field>
            <Field label={locations.length > 1 ? "Locations" : "Address"} source={source("foundation.mainAddress")}>
              {locations.length > 0 ? (
                <span className="flex flex-col gap-1">
                  {locations.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
              ) : (
                <span className="font-normal text-muted">Unknown</span>
              )}
            </Field>
            {foundation.serviceLocations && foundation.serviceLocations.length > 0 && (
              <Field label="Service areas" source={source("foundation.serviceLocations")}>{foundation.serviceLocations.join(", ")}</Field>
            )}
            {foundation.alternativeNames && foundation.alternativeNames.length > 0 && (
              <Field label="Also known as" source={source("foundation.alternativeNames")}>{foundation.alternativeNames.join(", ")}</Field>
            )}
          </dl>
        </SectionCard>

        <SectionCard title="Positioning" description="How the company describes itself and where it came from">
          <div className="space-y-5">
            <Block label="Pitch" source={source("positioning.pitch")}>
              {positioning.pitch ? (
                <blockquote className="border-l-2 border-brand-500 pl-4 text-[15px] leading-relaxed text-ink">
                  {positioning.pitch}
                </blockquote>
              ) : (
                <Empty />
              )}
            </Block>
            <Block label="Founding story" source={source("positioning.foundingStory")}>
              {positioning.foundingStory ? (
                <p className="text-sm leading-relaxed text-ink">{positioning.foundingStory}</p>
              ) : (
                <Empty />
              )}
            </Block>
          </div>
        </SectionCard>

        <SectionCard title="Market & customers" description="Who they sell to and how visitors convert">
          <div className="space-y-5">
            <Block label="Target buyers" source={source("marketAndCustomers.targetBuyers")}>
              <ChipList items={market.targetBuyers} />
            </Block>
            <Block label="Customer needs" source={source("marketAndCustomers.customerNeeds")}>
              <BulletList items={market.customerNeeds} />
            </Block>
            <Block label="Ideal customer persona" source={source("marketAndCustomers.idealPersona")}>
              {market.idealPersona ? <p className="text-sm leading-relaxed text-ink">{market.idealPersona}</p> : <Empty />}
            </Block>
            <Block label="Industry groupings" source={source("marketAndCustomers.industryGroupings")}>
              <ChipList items={market.industryGroupings} />
            </Block>
            {market.industryOutlook && (
              <Block label="Industry outlook" source={source("marketAndCustomers.industryOutlook")}>
                <p className="text-sm leading-relaxed text-ink">{market.industryOutlook}</p>
              </Block>
            )}
            <Block label="Partners & suppliers" source={source("marketAndCustomers.suppliers")}>
              <ChipList items={market.suppliers} />
            </Block>
          </div>
        </SectionCard>

        <SectionCard title="Channels & conversion" description="Where they show up and what they ask visitors to do">
          <div className="space-y-5">
            <Block label="Calls to action" source={source("marketAndCustomers.ctas")}>
              <ChipList items={market.ctas} tone="brand" />
            </Block>
            <Block label="Funnels" source={source("marketAndCustomers.funnels")}>
              <ChipList items={market.funnels} />
            </Block>
            <Block label="Channels" source={source("marketAndCustomers.channels")}>
              <ChipList items={market.channels} />
            </Block>
            <Block label="Social profiles & contact">
              {socials.length > 0 || otherContacts.length > 0 ? (
                <ul className="divide-y divide-line">
                  {socials.map((platform) => (
                    <li key={platform.key}>
                      <a
                        href={platform.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between py-2.5 text-sm"
                      >
                        <span className="font-medium text-ink">{platform.label}</span>
                        <span className="truncate pl-4 text-brand-600 underline-offset-4 group-hover:underline">
                          {platform.url!.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                        </span>
                      </a>
                    </li>
                  ))}
                  {otherContacts.map(([label, value]) => (
                    <li key={label} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="font-medium text-ink capitalize">{label}</span>
                      <span className="truncate pl-4 text-muted">{value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No social profiles or contact details found.</Empty>
              )}
            </Block>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Offerings" description="Products and services, with features and pricing where the site lists them">
        {knowledge.offerings && knowledge.offerings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {knowledge.offerings.map((offering, i) => (
              <div key={i} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink">{offering.name}</p>
                  {offering.category && <Chip>{offering.category}</Chip>}
                </div>
                {offering.description && <p className="mt-2 text-sm leading-relaxed text-muted">{offering.description}</p>}
                {offering.features && offering.features.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-ink">
                    {offering.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                {offering.pricing && <p className="mt-2 text-sm font-semibold text-brand-700">{offering.pricing}</p>}
              </div>
            ))}
          </div>
        ) : (
          <Empty>No offerings were listed in a way the scraper could read.</Empty>
        )}
      </SectionCard>

      <SectionCard title="Key people" description="Gender is intentionally not inferred from names">
        {knowledge.keyPeople && knowledge.keyPeople.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {knowledge.keyPeople.map((person, i) => (
              <div key={i} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink">{person.name}</p>
                  {person.role && <Chip tone={person.role === "Leadership" ? "brand" : "neutral"}>{person.role}</Chip>}
                </div>
                {person.title && <p className="text-sm text-muted">{person.title}</p>}
                {person.description && <p className="mt-2 text-sm leading-relaxed text-ink">{person.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <Empty>No team members were named on the pages scraped.</Empty>
        )}
      </SectionCard>

      <SectionCard
        title="Content insights"
        description="What MoSocial, MoMail, and MoBlogs can write from: recurring themes, headlines, and proof points"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <Block label="Content themes">
            <ChipList items={thinkBigger?.contentThemes} tone="brand" />
          </Block>
          <Block label="Key messages (headlines)">
            <BulletList items={thinkBigger?.messagingHeadlines} />
          </Block>
          <Block label="Unique selling points">
            <BulletList items={thinkBigger?.uniqueSellingPropositions} />
          </Block>
          <Block label="Trust signals">
            <BulletList items={thinkBigger?.certifications} />
          </Block>
          {thinkBigger?.communityValues && (
            <Block label="Mission & values">
              <p className="text-sm leading-relaxed text-ink">{thinkBigger.communityValues}</p>
            </Block>
          )}
          {thinkBigger?.mediaCovers && thinkBigger.mediaCovers.length > 0 && (
            <Block label="Media mentions">
              <ChipList items={thinkBigger.mediaCovers} />
            </Block>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Social proof" description="Reviews and common questions, ready to reuse in content">
        <div className="grid gap-8 lg:grid-cols-2">
          <Block label={thinkBigger?.reviewRating ? `Testimonials · ${thinkBigger.reviewRating}` : "Testimonials"}>
            {thinkBigger?.testimonials && thinkBigger.testimonials.length > 0 ? (
              <div className="space-y-3">
                {thinkBigger.testimonials.map((quote, i) => (
                  <blockquote key={i} className="rounded-2xl bg-surface p-4 text-sm leading-relaxed text-ink ring-1 ring-line">
                    “{quote}”
                  </blockquote>
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </Block>
          <Block label="FAQs">
            {thinkBigger?.faqs && thinkBigger.faqs.length > 0 ? (
              <dl className="divide-y divide-line">
                {thinkBigger.faqs.map((faq, i) => (
                  <div key={i} className="py-3 first:pt-0">
                    <dt className="text-sm font-medium text-ink">{faq.question}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <Empty />
            )}
          </Block>
        </div>
      </SectionCard>

      <BrandIdentity knowledge={knowledge} />

      <SectionCard title="Voice & visual style" description="Measured from the site's copy and design, for on-brand writing and imagery">
        <div className="grid gap-8 lg:grid-cols-2">
          <Block label="Writing style" source={source("brandingAndStyle.writingStyle")}>
            {brandingAndStyle.writingStyle ? (
              <p className="text-sm leading-relaxed text-ink">{brandingAndStyle.writingStyle}</p>
            ) : (
              <Empty>Not enough copy on the site to measure.</Empty>
            )}
          </Block>
          <Block label="Art style" source={source("brandingAndStyle.artStyle")}>
            {brandingAndStyle.artStyle ? (
              <p className="text-sm leading-relaxed text-ink">{brandingAndStyle.artStyle}</p>
            ) : (
              <Empty />
            )}
          </Block>
        </div>
      </SectionCard>

      <div className="text-center text-xs text-muted">
        <p>
          Scraped {new Date(knowledge.scrapedAt).toLocaleString()}
          {knowledge.updatedAt !== knowledge.scrapedAt && <> · Updated {new Date(knowledge.updatedAt).toLocaleString()}</>}
        </p>
        {knowledge.pagesScraped && knowledge.pagesScraped.length > 0 && (
          <p className="mt-1">
            Pages read:{" "}
            {knowledge.pagesScraped.map((url) => {
              try {
                return new URL(url).pathname;
              } catch {
                return url;
              }
            }).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
