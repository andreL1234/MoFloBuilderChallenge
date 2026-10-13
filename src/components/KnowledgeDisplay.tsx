"use client";

import { Knowledge } from "@/types/knowledge";
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink sm:justify-end sm:text-right">{children}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
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
  const website = safeExternalUrl(withProtocol(knowledge.sourceUrl));
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
  const { foundation, positioning, marketAndCustomers, onlinePresence, thinkBigger } = knowledge;

  const socials = socialPlatforms
    .map((platform) => ({ ...platform, url: safeExternalUrl(onlinePresence[platform.key]) }))
    .filter((platform) => platform.url);
  const otherContacts = Object.entries(onlinePresence.other || {});

  const themes = thinkBigger?.contentThemes || [];
  const usps = thinkBigger?.uniqueSellingPropositions || [];
  const keyMessages = marketAndCustomers.ctas || [];

  return (
    <div className="space-y-6 animate-fade-up">
      <BrandIdentity knowledge={knowledge} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Company foundation" description={foundation.overview}>
          <dl className="divide-y divide-line">
            <Field label="Industry">
              {foundation.industry}
              {foundation.industryConfidence !== undefined && <ConfidenceBadge value={foundation.industryConfidence} />}
            </Field>
            <Field label="Business model">
              {foundation.businessModel}
              {foundation.businessModelConfidence !== undefined && (
                <ConfidenceBadge value={foundation.businessModelConfidence} />
              )}
            </Field>
            <Field label="Company role">{foundation.companyRole}</Field>
            {foundation.yearFounded && <Field label="Founded">{foundation.yearFounded}</Field>}
            {foundation.mainAddress && <Field label="Address">{foundation.mainAddress}</Field>}
            {foundation.employeeCount && <Field label="Employees">{foundation.employeeCount}</Field>}
          </dl>
        </SectionCard>

        <SectionCard title="Positioning" description="How the company describes itself">
          {positioning.pitch ? (
            <blockquote className="border-l-2 border-brand-500 pl-4 text-[15px] leading-relaxed text-ink">
              {positioning.pitch}
            </blockquote>
          ) : (
            <Empty>No pitch found.</Empty>
          )}
          {positioning.foundingStory && (
            <p className="mt-4 text-sm leading-relaxed text-muted">{positioning.foundingStory}</p>
          )}
        </SectionCard>

        <SectionCard title="Online presence">
          {socials.length > 0 || otherContacts.length > 0 ? (
            <ul className="divide-y divide-line">
              {socials.map((platform) => (
                <li key={platform.key}>
                  <a
                    href={platform.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 text-sm group"
                  >
                    <span className="font-medium text-ink">{platform.label}</span>
                    <span className="truncate pl-4 text-brand-600 group-hover:underline underline-offset-4">
                      {platform.url!.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    </span>
                  </a>
                </li>
              ))}
              {otherContacts.map(([label, value]) => (
                <li key={label} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-ink capitalize">{label}</span>
                  <span className="truncate pl-4 text-muted">{value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No social profiles linked from the homepage.</Empty>
          )}
        </SectionCard>

        <SectionCard title="Market & messaging" description="Headlines and channels the site leads with">
          <div className="space-y-5">
            <div>
              <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Key messages</h4>
              {keyMessages.length > 0 ? (
                <ul className="space-y-2">
                  {keyMessages.map((message, i) => (
                    <li key={i} className="rounded-xl bg-surface px-3 py-2 text-sm text-ink">
                      {message}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No headings found.</Empty>
              )}
            </div>
            {marketAndCustomers.channels && marketAndCustomers.channels.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {marketAndCustomers.channels.map((channel) => (
                    <Chip key={channel}>{channel}</Chip>
                  ))}
                </div>
              </div>
            )}
            {marketAndCustomers.targetBuyers && marketAndCustomers.targetBuyers.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Target buyers</h4>
                <div className="flex flex-wrap gap-2">
                  {marketAndCustomers.targetBuyers.map((buyer) => (
                    <Chip key={buyer}>{buyer}</Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Content insights"
        description="Recurring themes and selling points that MoSocial, MoMail, and MoBlogs can write from"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">Content themes</h4>
            {themes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <Chip key={theme} tone="brand">
                    {theme}
                  </Chip>
                ))}
              </div>
            ) : (
              <Empty>No recurring themes detected.</Empty>
            )}
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">Unique selling points</h4>
            {usps.length > 0 ? (
              <ul className="space-y-2.5">
                {usps.map((usp, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {usp}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No selling points detected.</Empty>
            )}
          </div>
        </div>
      </SectionCard>

      {knowledge.offerings && knowledge.offerings.length > 0 && (
        <SectionCard title="Offerings">
          <div className="grid gap-3 sm:grid-cols-2">
            {knowledge.offerings.map((offering, i) => (
              <div key={i} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                <p className="font-medium text-ink">{offering.name}</p>
                {offering.description && <p className="mt-1 text-sm text-muted">{offering.description}</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {knowledge.keyPeople && knowledge.keyPeople.length > 0 && (
        <SectionCard title="Key people">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {knowledge.keyPeople.map((person, i) => (
              <div key={i} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                <p className="font-medium text-ink">{person.name}</p>
                {person.title && <p className="text-sm text-muted">{person.title}</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {thinkBigger?.faqs && thinkBigger.faqs.length > 0 && (
        <SectionCard title="FAQs">
          <dl className="divide-y divide-line">
            {thinkBigger.faqs.map((faq, i) => (
              <div key={i} className="py-3">
                <dt className="font-medium text-ink">{faq.question}</dt>
                <dd className="mt-1 text-sm text-muted">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      )}

      <p className="text-center text-xs text-muted">
        Scraped {new Date(knowledge.scrapedAt).toLocaleString()}
        {knowledge.updatedAt !== knowledge.scrapedAt && <> · Updated {new Date(knowledge.updatedAt).toLocaleString()}</>}
      </p>
    </div>
  );
}
