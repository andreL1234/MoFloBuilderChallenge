"use client";

import { useState } from "react";
import { FieldSource, KeyPerson, Knowledge, Offering } from "@/types/knowledge";
import { downloadJSON } from "@/utils/storage";
import { button, Card, ConfidenceBadge, inputClass } from "@/components/ui";
import { SourceBadge } from "@/components/KnowledgeDisplay";

interface KnowledgeEditorProps {
  knowledge: Knowledge;
  onSave: (knowledge: Knowledge) => void;
  onCancel: () => void;
  saveLabel?: string;
}

type FAQ = { question: string; answer: string };

const SOCIAL_FIELDS = [
  ["linkedin", "LinkedIn"],
  ["facebook", "Facebook"],
  ["twitter", "X / Twitter"],
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
] as const;

// Lists are edited as one item per line; blank lines are dropped on save
const toLines = (items?: string[]) => (items || []).join("\n");
const fromLines = (text: string) => text.split("\n");
const cleanList = (items?: string[]) => (items || []).map((i) => i.trim()).filter(Boolean);

function EditorSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </Card>
  );
}

function Label({ htmlFor, children, extra }: { htmlFor: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {children}
      </label>
      <span className="flex items-center gap-1.5">{extra}</span>
    </div>
  );
}

export default function KnowledgeEditor({
  knowledge,
  onSave,
  onCancel,
  saveLabel = "Save changes",
}: KnowledgeEditorProps) {
  const [edited, setEdited] = useState<Knowledge>(knowledge);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showJson, setShowJson] = useState(false);

  // Paths are "section.field" (e.g. "foundation.industry") or a top-level key ("companyName")
  const setField = (path: string, value: unknown) => {
    const [section, field] = path.split(".");
    setEdited((prev) => {
      if (!field) return { ...prev, [section]: value };
      const current = (prev[section as keyof Knowledge] as Record<string, unknown> | undefined) ?? {};
      return { ...prev, [section]: { ...current, [field]: value } };
    });
    setTouched((prev) => new Set(prev).add(path));
  };

  const get = (path: string): unknown => {
    const [section, field] = path.split(".");
    const value = edited[section as keyof Knowledge] as Record<string, unknown> | undefined;
    return field ? value?.[field] : value;
  };

  const sourceOf = (path: string): FieldSource | undefined =>
    touched.has(path) ? "user" : edited.provenance?.[path];

  const text = (path: string, label: string, opts: { area?: boolean; full?: boolean; rows?: number; badge?: React.ReactNode } = {}) => (
    <div className={opts.full || opts.area ? "md:col-span-2" : ""}>
      <Label htmlFor={path} extra={<>{opts.badge}<SourceBadge source={sourceOf(path)} /></>}>
        {label}
      </Label>
      {opts.area ? (
        <textarea id={path} rows={opts.rows ?? 3} value={(get(path) as string) || ""} onChange={(e) => setField(path, e.target.value)} className={inputClass} />
      ) : (
        <input id={path} type="text" value={(get(path) as string) || ""} onChange={(e) => setField(path, e.target.value)} className={inputClass} />
      )}
    </div>
  );

  const list = (path: string, label: string, hint = "One per line") => (
    <div>
      <Label htmlFor={path} extra={<SourceBadge source={sourceOf(path)} />}>
        {label}
      </Label>
      <textarea
        id={path}
        rows={4}
        placeholder={hint}
        value={toLines(get(path) as string[])}
        onChange={(e) => setField(path, fromLines(e.target.value))}
        className={inputClass}
      />
    </div>
  );

  // Repeatable rows for people, offerings, and FAQs
  const updateRow = <T,>(path: string, rows: T[], index: number, patch: Partial<T>) =>
    setField(path, rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const removeRow = <T,>(path: string, rows: T[], index: number) => setField(path, rows.filter((_, i) => i !== index));

  const people = edited.keyPeople || [];
  const offerings = edited.offerings || [];
  const faqs = edited.thinkBigger?.faqs || [];

  const handleSave = () => {
    const provenance = { ...(edited.provenance || {}) };
    touched.forEach((path) => (provenance[path] = "user"));
    const { foundation, marketAndCustomers: m, brandingAndStyle: b, thinkBigger: t } = edited;
    onSave({
      ...edited,
      foundation: {
        ...foundation,
        otherLocations: cleanList(foundation.otherLocations),
        serviceLocations: cleanList(foundation.serviceLocations),
        alternativeNames: cleanList(foundation.alternativeNames),
      },
      marketAndCustomers: {
        ...m,
        targetBuyers: cleanList(m.targetBuyers),
        customerNeeds: cleanList(m.customerNeeds),
        industryGroupings: cleanList(m.industryGroupings),
        channels: cleanList(m.channels),
        funnels: cleanList(m.funnels),
        ctas: cleanList(m.ctas),
        suppliers: cleanList(m.suppliers),
      },
      brandingAndStyle: { ...b, fonts: cleanList(b.fonts), colors: cleanList(b.colors), logos: cleanList(b.logos) },
      keyPeople: people.filter((p) => p.name.trim()),
      offerings: offerings.filter((o) => o.name.trim()).map((o) => ({ ...o, features: cleanList(o.features) })),
      thinkBigger: {
        ...t,
        contentThemes: cleanList(t?.contentThemes),
        uniqueSellingPropositions: cleanList(t?.uniqueSellingPropositions),
        messagingHeadlines: cleanList(t?.messagingHeadlines),
        certifications: cleanList(t?.certifications),
        testimonials: cleanList(t?.testimonials),
        faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      },
      provenance,
      updatedAt: new Date().toISOString(),
    });
  };

  const rowInput = "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="animate-fade-up space-y-6">
      <Card className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Edit knowledge base</h2>
          <p className="text-sm text-muted">Correct, fill in, or enhance anything before saving. Changed fields are marked “Edited”.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowJson(!showJson)} className={button.subtle}>
            {showJson ? "Hide JSON" : "Preview JSON"}
          </button>
          <button type="button" onClick={() => downloadJSON(edited)} className={button.subtle}>
            Download JSON
          </button>
        </div>
      </Card>

      {showJson && (
        <pre className="max-h-96 overflow-auto rounded-card bg-navy-900 px-6 py-5 font-mono text-xs leading-relaxed text-brand-100">
          {JSON.stringify(edited, null, 2)}
        </pre>
      )}

      <EditorSection title="Company foundation">
        {text("companyName", "Company name", { full: true })}
        {text("foundation.industry", "Industry", {
          badge: edited.foundation.industryConfidence !== undefined && <ConfidenceBadge value={edited.foundation.industryConfidence} />,
        })}
        {text("foundation.businessModel", "Business model", {
          badge: edited.foundation.businessModelConfidence !== undefined && <ConfidenceBadge value={edited.foundation.businessModelConfidence} />,
        })}
        {text("foundation.companyRole", "Company role")}
        <div>
          <Label htmlFor="foundation.yearFounded" extra={<SourceBadge source={sourceOf("foundation.yearFounded")} />}>
            Year founded
          </Label>
          <input
            id="foundation.yearFounded"
            type="number"
            min={1800}
            max={new Date().getFullYear()}
            value={edited.foundation.yearFounded ?? ""}
            onChange={(e) => setField("foundation.yearFounded", e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className={inputClass}
          />
        </div>
        {text("foundation.legalEntityType", "Legal entity type")}
        {text("foundation.employeeCount", "Employee count")}
        {text("foundation.website", "Website")}
        {text("foundation.mainAddress", "Main address", { full: true })}
        {list("foundation.otherLocations", "Other locations")}
        {list("foundation.serviceLocations", "Service areas")}
        {list("foundation.alternativeNames", "Alternative names")}
        {text("foundation.overview", "Overview", { area: true })}
      </EditorSection>

      <EditorSection title="Positioning">
        {text("positioning.pitch", "Company pitch", { area: true, rows: 4 })}
        {text("positioning.foundingStory", "Founding story", { area: true, rows: 5 })}
      </EditorSection>

      <EditorSection title="Market & customers">
        {list("marketAndCustomers.targetBuyers", "Target buyers")}
        {list("marketAndCustomers.customerNeeds", "Customer needs")}
        {text("marketAndCustomers.idealPersona", "Ideal customer persona", { area: true })}
        {list("marketAndCustomers.industryGroupings", "Industry groupings")}
        {list("marketAndCustomers.suppliers", "Partners & suppliers")}
        {text("marketAndCustomers.industryOutlook", "Industry outlook", { area: true, rows: 2 })}
        {list("marketAndCustomers.ctas", "Calls to action")}
        {list("marketAndCustomers.funnels", "Funnels")}
        {list("marketAndCustomers.channels", "Channels")}
      </EditorSection>

      <EditorSection title="Online presence" description="Profile URLs">
        {SOCIAL_FIELDS.map(([key, label]) => (
          <div key={key}>
            <Label htmlFor={`onlinePresence.${key}`}>{label}</Label>
            <input
              id={`onlinePresence.${key}`}
              type="url"
              placeholder="https://"
              value={edited.onlinePresence[key] || ""}
              onChange={(e) => setField(`onlinePresence.${key}`, e.target.value || undefined)}
              className={inputClass}
            />
          </div>
        ))}
      </EditorSection>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Offerings</h3>
          <button type="button" onClick={() => setField("offerings", [...offerings, { name: "", category: "Service" }])} className={button.subtle}>
            Add offering
          </button>
        </div>
        <div className="space-y-3">
          {offerings.length === 0 && <p className="text-sm text-muted">No offerings yet.</p>}
          {offerings.map((o: Offering, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-surface p-3 ring-1 ring-line md:grid-cols-[2fr_1fr_1fr_auto]">
              <input aria-label="Offering name" placeholder="Name" value={o.name} onChange={(e) => updateRow("offerings", offerings, i, { name: e.target.value })} className={rowInput} />
              <input aria-label="Category" placeholder="Category" value={o.category || ""} onChange={(e) => updateRow("offerings", offerings, i, { category: e.target.value })} className={rowInput} />
              <input aria-label="Pricing" placeholder="Pricing" value={o.pricing || ""} onChange={(e) => updateRow("offerings", offerings, i, { pricing: e.target.value })} className={rowInput} />
              <button type="button" onClick={() => removeRow("offerings", offerings, i)} className="cursor-pointer rounded-lg px-3 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600">
                Remove
              </button>
              <textarea aria-label="Description" placeholder="Description" rows={2} value={o.description || ""} onChange={(e) => updateRow("offerings", offerings, i, { description: e.target.value })} className={`${rowInput} md:col-span-2`} />
              <textarea aria-label="Features" placeholder="Features, one per line" rows={2} value={toLines(o.features)} onChange={(e) => updateRow("offerings", offerings, i, { features: fromLines(e.target.value) })} className={`${rowInput} md:col-span-2`} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Key people</h3>
          <button type="button" onClick={() => setField("keyPeople", [...people, { name: "" }])} className={button.subtle}>
            Add person
          </button>
        </div>
        <div className="space-y-3">
          {people.length === 0 && <p className="text-sm text-muted">No people yet.</p>}
          {people.map((p: KeyPerson, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-surface p-3 ring-1 ring-line md:grid-cols-[1fr_1fr_1fr_auto]">
              <input aria-label="Name" placeholder="Name" value={p.name} onChange={(e) => updateRow("keyPeople", people, i, { name: e.target.value })} className={rowInput} />
              <input aria-label="Title" placeholder="Title" value={p.title || ""} onChange={(e) => updateRow("keyPeople", people, i, { title: e.target.value })} className={rowInput} />
              <input aria-label="Role" placeholder="Role" value={p.role || ""} onChange={(e) => updateRow("keyPeople", people, i, { role: e.target.value })} className={rowInput} />
              <button type="button" onClick={() => removeRow("keyPeople", people, i)} className="cursor-pointer rounded-lg px-3 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600">
                Remove
              </button>
              <input aria-label="Gender" placeholder="Gender (only if stated)" value={p.gender || ""} onChange={(e) => updateRow("keyPeople", people, i, { gender: e.target.value })} className={rowInput} />
              <textarea aria-label="Background" placeholder="Background / relevance" rows={2} value={p.description || ""} onChange={(e) => updateRow("keyPeople", people, i, { description: e.target.value })} className={`${rowInput} md:col-span-3`} />
            </div>
          ))}
        </div>
      </Card>

      <EditorSection title="Content insights & social proof">
        {list("thinkBigger.contentThemes", "Content themes")}
        {list("thinkBigger.messagingHeadlines", "Key messages")}
        {list("thinkBigger.uniqueSellingPropositions", "Unique selling points")}
        {list("thinkBigger.certifications", "Trust signals")}
        {list("thinkBigger.testimonials", "Testimonials")}
        {text("thinkBigger.communityValues", "Mission & values", { area: true, rows: 2 })}
      </EditorSection>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">FAQs</h3>
          <button type="button" onClick={() => setField("thinkBigger.faqs", [...faqs, { question: "", answer: "" }])} className={button.subtle}>
            Add FAQ
          </button>
        </div>
        <div className="space-y-3">
          {faqs.length === 0 && <p className="text-sm text-muted">No FAQs yet.</p>}
          {faqs.map((f: FAQ, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-surface p-3 ring-1 ring-line md:grid-cols-[1fr_auto]">
              <input aria-label="Question" placeholder="Question" value={f.question} onChange={(e) => updateRow("thinkBigger.faqs", faqs, i, { question: e.target.value })} className={rowInput} />
              <button type="button" onClick={() => removeRow("thinkBigger.faqs", faqs, i)} className="cursor-pointer rounded-lg px-3 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600">
                Remove
              </button>
              <textarea aria-label="Answer" placeholder="Answer" rows={2} value={f.answer} onChange={(e) => updateRow("thinkBigger.faqs", faqs, i, { answer: e.target.value })} className={`${rowInput} md:col-span-2`} />
            </div>
          ))}
        </div>
      </Card>

      <EditorSection title="Branding & style">
        {text("brandingAndStyle.writingStyle", "Writing style", { area: true, rows: 2 })}
        {text("brandingAndStyle.artStyle", "Art style", { area: true, rows: 2 })}
        <div>
          {list("brandingAndStyle.colors", "Brand colors", "#2663EB, one per line")}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cleanList(edited.brandingAndStyle.colors).map((color, i) => (
              <span key={i} title={color} className="h-6 w-6 rounded-md ring-1 ring-line" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
        {list("brandingAndStyle.fonts", "Fonts")}
        <div className="md:col-span-2">{list("brandingAndStyle.logos", "Logo URLs")}</div>
      </EditorSection>

      <div className="sticky bottom-4 z-20 flex justify-end gap-2 rounded-full border border-line bg-white/90 p-2 shadow-float backdrop-blur-md">
        <button type="button" onClick={onCancel} className={button.subtle}>
          Cancel
        </button>
        <button type="button" onClick={handleSave} className={button.primary}>
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
