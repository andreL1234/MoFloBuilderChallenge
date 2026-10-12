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
