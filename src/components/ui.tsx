"use client";

import { useState } from "react";
import { Knowledge } from "@/types/knowledge";
import { resolveAssetUrl } from "@/utils/url";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2";

export const button = {
  primary: `${buttonBase} px-5 py-2.5 text-white bg-linear-to-br from-brand-500 to-brand-700 shadow-[0_8px_20px_-8px_rgba(38,99,235,0.8)] hover:brightness-110`,
  dark: `${buttonBase} px-6 py-3 text-white bg-linear-to-br from-navy-800 to-navy-900 ring-1 ring-white/10 shadow-float hover:brightness-125`,
  white: `${buttonBase} px-5 py-2.5 bg-white text-brand-600 shadow-sm hover:bg-brand-50`,
  glass: `${buttonBase} px-5 py-2.5 text-white bg-white/10 ring-1 ring-white/25 backdrop-blur-md hover:bg-white/20`,
  subtle: `${buttonBase} px-4 py-2 text-ink bg-white ring-1 ring-line hover:bg-surface`,
  dangerSolid: `${buttonBase} px-5 py-2.5 text-white bg-red-600 hover:bg-red-700`,
};

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100";

export function Card({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-line bg-white shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

export function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "brand" }) {
  const tones = {
    neutral: "bg-surface text-ink ring-line",
    brand: "bg-brand-50 text-brand-700 ring-brand-100",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

// Older saved records stored confidence as 0-100; newer ones as 0-1.
export function normalizeConfidence(score: number | undefined): number {
  if (score === undefined || Number.isNaN(score)) return 0;
  const value = score > 1 ? score / 100 : score;
  return Math.max(0, Math.min(1, value));
}

export function ConfidenceBadge({ value, label }: { value: number | undefined; label?: string }) {
  const score = normalizeConfidence(value);
  const tone =
    score >= 0.75
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : score >= 0.5
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {Math.round(score * 100)}%{label ? ` ${label}` : ""}
    </span>
  );
}

export function ConfidenceMeter({ value }: { value: number | undefined }) {
  const score = normalizeConfidence(value);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-700"
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted tabular-nums">{Math.round(score * 100)}%</span>
    </div>
  );
}

function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || "?").slice(0, 2)).toUpperCase();
}

// Shows the first logo URL that actually loads; falls back to the company's initials.
export function LogoMark({ knowledge, className = "h-12 w-12" }: { knowledge: Knowledge; className?: string }) {
  const sources = (knowledge.brandingAndStyle.logos || [])
    .map((src) => resolveAssetUrl(src, knowledge.sourceUrl))
    .filter((src): src is string => src !== null);
  const [failedCount, setFailedCount] = useState(0);
  const src = sources[failedCount];

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-line ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary scraped domains
        <img
          src={src}
          alt={`${knowledge.companyName} logo`}
          className="h-full w-full object-contain p-1.5"
          onError={() => setFailedCount((n) => n + 1)}
        />
      ) : (
        <span className="font-display text-sm font-semibold text-brand-600">{initials(knowledge.companyName)}</span>
      )}
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />;
}
