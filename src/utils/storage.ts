import { Knowledge } from "@/types/knowledge";

export function loadKnowledgeList(): Knowledge[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("knowledgeList");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load knowledge list", error);
    return [];
  }
}

export function saveKnowledge(knowledge: Knowledge): void {
  if (typeof window === "undefined") return;

  try {
    const list = loadKnowledgeList();
    const existing = list.findIndex((k) => k.id === knowledge.id);

    if (existing >= 0) {
      list[existing] = knowledge;
    } else {
      list.push(knowledge);
    }

    localStorage.setItem("knowledgeList", JSON.stringify(list));
  } catch (error) {
    console.error("Failed to save knowledge", error);
  }
}

export function deleteKnowledge(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const list = loadKnowledgeList();
    const filtered = list.filter((k) => k.id !== id);
    localStorage.setItem("knowledgeList", JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete knowledge", error);
  }
}

export function exportAsJSON(knowledge: Knowledge): string {
  return JSON.stringify(knowledge, null, 2);
}

export function downloadJSON(knowledge: Knowledge): void {
  const json = exportAsJSON(knowledge);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${knowledge.companyName.replace(/\s+/g, "_")}_knowledge.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsCSV(knowledgeList: Knowledge[]): string {
  if (knowledgeList.length === 0) return "";

  const headers = [
    "Company Name",
    "Website",
    "Industry",
    "Industry Confidence %",
    "Business Model",
    "Business Model Confidence %",
    "Pitch",
    "Scraped Date",
    "Overall Confidence %",
  ];

  const rows = knowledgeList.map((kb) => [
    escapeCSV(kb.companyName),
    escapeCSV(kb.sourceUrl),
    escapeCSV(kb.foundation.industry),
    kb.foundation.industryConfidence ? Math.round(kb.foundation.industryConfidence * 100) : "",
    escapeCSV(kb.foundation.businessModel),
    kb.foundation.businessModelConfidence ? Math.round(kb.foundation.businessModelConfidence * 100) : "",
    escapeCSV(kb.positioning.pitch || ""),
    new Date(kb.scrapedAt).toLocaleString(),
    kb.confidenceScore ? Math.round(kb.confidenceScore * 100) : "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csv;
}

function escapeCSV(value: string): string {
  if (!value) return '""';
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(knowledgeList: Knowledge[]): void {
  const csv = exportAsCSV(knowledgeList);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `knowledge_bases_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
