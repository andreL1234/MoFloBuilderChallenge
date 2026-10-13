"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Knowledge } from "@/types/knowledge";
import { downloadJSON, downloadCSV, importJSON } from "@/utils/storage";
import { hostnameOf } from "@/utils/url";
import {
  button,
  Card,
  Chip,
  ConfidenceBadge,
  ConfidenceMeter,
  inputClass,
  LogoMark,
  normalizeConfidence,
} from "@/components/ui";

interface KnowledgeListProps {
  knowledgeList: Knowledge[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onImport: (knowledge: Knowledge) => void;
}

type ViewMode = "cards" | "table";
type SortBy = "name" | "date" | "industry" | "confidence";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

function ColorStrip({ colors = [] }: { colors?: string[] }) {
  if (colors.length === 0) return <div className="h-1.5 bg-linear-to-r from-brand-500 to-brand-700" />;
  return (
    <div className="flex h-1.5">
      {colors.slice(0, 6).map((color, i) => (
        <div key={i} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

export default function KnowledgeList({ knowledgeList, onDelete, onDuplicate, onImport }: KnowledgeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [filterModel, setFilterModel] = useState<string>("");
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Delete needs a second click within 3 seconds
  useEffect(() => {
    if (!pendingDeleteId) return;
    const timer = setTimeout(() => setPendingDeleteId(null), 3000);
    return () => clearTimeout(timer);
  }, [pendingDeleteId]);

  const industries = useMemo(
    () => [...new Set(knowledgeList.map((k) => k.foundation.industry))].sort(),
    [knowledgeList]
  );

  const models = useMemo(
    () => [...new Set(knowledgeList.map((k) => k.foundation.businessModel))].sort(),
    [knowledgeList]
  );

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const result = knowledgeList.filter((k) => {
      const matchesSearch =
        k.companyName.toLowerCase().includes(term) || k.foundation.industry.toLowerCase().includes(term);
      const matchesIndustry = !filterIndustry || k.foundation.industry === filterIndustry;
      const matchesModel = !filterModel || k.foundation.businessModel === filterModel;
      const matchesConfidence = normalizeConfidence(k.confidenceScore) >= minConfidence / 100;
      return matchesSearch && matchesIndustry && matchesModel && matchesConfidence;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.companyName.localeCompare(b.companyName);
        case "date":
          return new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime();
        case "industry":
          return a.foundation.industry.localeCompare(b.foundation.industry);
        case "confidence":
          return normalizeConfidence(b.confidenceScore) - normalizeConfidence(a.confidenceScore);
        default:
          return 0;
      }
    });

    return result;
  }, [knowledgeList, searchTerm, sortBy, filterIndustry, filterModel, minConfidence]);

  const hasActiveFilters = searchTerm || filterIndustry || filterModel || minConfidence > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterIndustry("");
    setFilterModel("");
    setMinConfidence(0);
  };

  const handleDelete = (id: string) => {
    if (pendingDeleteId === id) {
      onDelete(id);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(id);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imported = importJSON(e.target?.result as string);
      if (imported) {
        onImport(imported);
        setNotice({ tone: "success", text: `Imported ${imported.companyName}` });
      } else {
        setNotice({ tone: "error", text: "That file isn't a valid knowledge base JSON export." });
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    event.target.value = "";
  };

  const rowActions = (kb: Knowledge) => (
    <div className="relative z-10 flex items-center gap-1">
      {[
        { label: "Export", onClick: () => downloadJSON(kb), className: "text-muted hover:text-ink hover:bg-surface" },
        { label: "Duplicate", onClick: () => onDuplicate(kb.id), className: "text-muted hover:text-ink hover:bg-surface" },
        {
          label: pendingDeleteId === kb.id ? "Confirm delete" : "Delete",
          onClick: () => handleDelete(kb.id),
          className:
            pendingDeleteId === kb.id ? "bg-red-600 text-white hover:bg-red-700" : "text-muted hover:text-red-600 hover:bg-red-50",
        },
      ].map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition ${action.className}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );

  if (knowledgeList.length === 0) {
    return (
      <Card className="flex flex-col items-center px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-100">
          <svg className="h-6 w-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink">No knowledge bases yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Scrape a company website to create your first one, or import a JSON export.
        </p>
        <div className="mt-6 flex gap-2">
          <label className={button.subtle}>
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <Link href="/knowledge" className={button.primary}>
            Scrape a website
          </Link>
        </div>
        {notice && <p className={`mt-4 text-sm ${notice.tone === "error" ? "text-red-600" : "text-success"}`}>{notice.text}</p>}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by company or industry"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
              aria-label="Search knowledge bases"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-surface p-1 ring-1 ring-line">
              {(["cards", "table"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                    viewMode === mode ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <label className={button.subtle}>
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button type="button" onClick={() => downloadCSV(filtered)} className={button.subtle}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-muted">
            Sort by
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className={`${inputClass} mt-1.5`}>
              <option value="date">Recently scraped</option>
              <option value="name">Company name</option>
              <option value="industry">Industry</option>
              <option value="confidence">Confidence</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Industry
            <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} className={`${inputClass} mt-1.5`}>
              <option value="">All industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Business model
            <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)} className={`${inputClass} mt-1.5`}>
              <option value="">All models</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            <span className="flex justify-between">
              Minimum confidence <span className="text-ink tabular-nums">{minConfidence}%</span>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseInt(e.target.value))}
              className="mt-4 w-full accent-brand-600"
            />
          </label>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted">
          Showing <span className="font-medium text-ink">{filtered.length}</span> of {knowledgeList.length}
        </p>
        {notice && (
          <p className={`font-medium ${notice.tone === "error" ? "text-red-600" : "text-success"}`} role="status">
            {notice.text}
          </p>
        )}
        {hasActiveFilters && !notice && (
          <button type="button" onClick={clearFilters} className="cursor-pointer font-medium text-brand-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <p className="font-medium text-ink">No knowledge bases match these filters</p>
          <button type="button" onClick={clearFilters} className={`${button.subtle} mt-4`}>
            Clear filters
          </button>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((kb) => (
            <Card
              key={kb.id}
              className="group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(6,39,117,0.35)]"
            >
              <ColorStrip colors={kb.brandingAndStyle.colors} />
              <div className="flex-1 p-5">
                <div className="flex items-center gap-4">
                  <LogoMark knowledge={kb} />
                  <div className="min-w-0">
                    {/* The ::after overlay makes the whole card clickable without nesting buttons in a link */}
                    <Link
                      href={`/knowledge/view/${kb.id}`}
                      className="block truncate font-display font-semibold text-ink after:absolute after:inset-0 group-hover:text-brand-600"
                    >
                      {kb.companyName}
                    </Link>
                    <p className="truncate text-sm text-muted">{hostnameOf(kb.sourceUrl)}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone="brand">{kb.foundation.industry}</Chip>
                  <Chip>{kb.foundation.businessModel}</Chip>
                  {kb.foundation.yearFounded && <Chip>Est. {kb.foundation.yearFounded}</Chip>}
                </div>
                <div className="mt-5">
                  <p className="mb-1.5 text-xs text-muted">Completeness</p>
                  <ConfidenceMeter value={kb.confidenceScore} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <span className="text-xs text-muted">{formatDate(kb.scrapedAt)}</span>
                {rowActions(kb)}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-medium tracking-wide text-muted uppercase">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Business model</th>
                <th className="px-5 py-3 font-medium">Confidence</th>
                <th className="px-5 py-3 font-medium">Scraped</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((kb) => (
                <tr key={kb.id} className="transition hover:bg-surface/70">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <LogoMark knowledge={kb} className="h-9 w-9 rounded-xl" />
                      <div className="min-w-0">
                        <Link href={`/knowledge/view/${kb.id}`} className="font-medium text-ink hover:text-brand-600">
                          {kb.companyName}
                        </Link>
                        <p className="text-xs text-muted">{hostnameOf(kb.sourceUrl)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink">{kb.foundation.industry}</td>
                  <td className="px-5 py-3 text-ink">{kb.foundation.businessModel}</td>
                  <td className="px-5 py-3">
                    <ConfidenceBadge value={kb.confidenceScore} />
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(kb.scrapedAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">{rowActions(kb)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
