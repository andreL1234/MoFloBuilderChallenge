"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useKnowledge } from "@/context/KnowledgeContext";
import KnowledgeForm from "@/components/KnowledgeForm";
import KnowledgeDisplay, { KnowledgeHeader } from "@/components/KnowledgeDisplay";
import KnowledgeEditor from "@/components/KnowledgeEditor";
import BatchScraper from "@/components/BatchScraper";
import { button, Card } from "@/components/ui";
import { Knowledge } from "@/types/knowledge";

type ScrapeMode = "single" | "batch";

const modes: { value: ScrapeMode; label: string; hint: string }[] = [
  { value: "single", label: "Single website", hint: "Scrape one site (homepage plus key pages) and review the results before saving." },
  { value: "batch", label: "Batch scrape", hint: "Paste a list of sites. Each successful scrape is saved automatically." },
];

const steps = [
  {
    title: "Fetch",
    body: "The app's /api/scrape route downloads the homepage server-side (no browser CORS limits), then up to five key pages: about, services, contact, team, FAQ, and reviews.",
  },
  {
    title: "Extract",
    body: "Each page is parsed for structured data, contact details, people, offerings, FAQs, reviews, brand colors, logos, fonts, and messaging.",
  },
  {
    title: "Classify",
    body: "Keyword signals score the likely industry and business model. Each guess shows a confidence percentage so you know what to double-check.",
  },
  {
    title: "Review & save",
    body: "Fields are labeled Derived or Mock AI when they weren't read directly from the site. Fix anything that's off, then save and export as JSON or CSV.",
  },
];

export default function KnowledgePage() {
  const router = useRouter();
  const { addKnowledge, isLoading, error, setError, setIsLoading } = useKnowledge();
  const [mode, setMode] = useState<ScrapeMode>("single");
  const [preview, setPreview] = useState<Knowledge | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const previewRef = useRef<HTMLElement>(null);

  // Bring the freshly scraped result into view
  useEffect(() => {
    if (preview) previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [preview?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScraped = (knowledge: Knowledge) => {
    setPreview(knowledge);
    setIsEditing(false);
  };

  const handleSave = (knowledge: Knowledge) => {
    addKnowledge(knowledge);
    router.push(`/knowledge/view/${knowledge.id}`);
  };

  const handleBatchScraped = (scraped: Knowledge[]) => {
    scraped.forEach((kb) => addKnowledge(kb));
  };

  const switchMode = (next: ScrapeMode) => {
    setMode(next);
    setError(null);
  };

  const activeMode = modes.find((m) => m.value === mode)!;

  return (
    <>
      <section className="hero-bg px-4 pt-36 pb-28 sm:pt-44 sm:pb-36">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium text-white/90">
            Knowledge base builder for small businesses
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-brand-600">MoFlo</span>
          </p>

          <h1 className="mt-6 text-4xl leading-[1.15] font-semibold tracking-tight text-white sm:text-6xl">
            Turn any website into a{" "}
            <span className="mt-2 inline-block -rotate-2 rounded-2xl bg-white px-4 py-1 text-brand-600 shadow-float">
              knowledge base
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Enter a company URL and get its brand, positioning, and online presence as structured data that
            MoSocial, MoMail, and MoBlogs can write from.
          </p>

          <div className="mt-10 inline-flex rounded-full bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur-md">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => switchMode(m.value)}
                aria-pressed={mode === m.value}
                disabled={isLoading}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed ${
                  mode === m.value ? "bg-white text-brand-600 shadow-sm" : "text-white/85 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-3 mb-6 text-sm text-white/70">{activeMode.hint}</p>

          {mode === "single" ? (
            <KnowledgeForm
              onScraped={handleScraped}
              isLoading={isLoading}
              error={error}
              setError={setError}
              setIsLoading={setIsLoading}
            />
          ) : (
            <BatchScraper onScraped={handleBatchScraped} setIsLoading={setIsLoading} />
          )}
        </div>
      </section>

      {preview && (
        <section ref={previewRef} className="mx-auto max-w-6xl scroll-mt-6 px-4 pt-6 pb-16">
          <p className="mb-3 text-xs font-semibold tracking-wide text-brand-600 uppercase">Review extracted data</p>
          <Card className="mb-6 p-6">
            <KnowledgeHeader
              knowledge={preview}
              actions={
                !isEditing && (
                  <>
                    <button type="button" onClick={() => setPreview(null)} className={button.subtle}>
                      Discard
                    </button>
                    <button type="button" onClick={() => setIsEditing(true)} className={button.subtle}>
                      Edit fields
                    </button>
                    <button type="button" onClick={() => handleSave(preview)} className={button.primary}>
                      Save knowledge base
                    </button>
                  </>
                )
              }
            />
          </Card>
          {isEditing ? (
            <KnowledgeEditor
              knowledge={preview}
              saveLabel="Save knowledge base"
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <KnowledgeDisplay knowledge={preview} />
          )}
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-8 pb-24">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">What happens when you scrape</h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-600 ring-1 ring-brand-100">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
