"use client";

import Link from "next/link";
import { useKnowledge } from "@/context/KnowledgeContext";
import KnowledgeList from "@/components/KnowledgeList";
import { button, Card } from "@/components/ui";

export default function ViewPage() {
  const { knowledgeList, isHydrated, deleteKnowledge, duplicateKnowledge, addKnowledge } = useKnowledge();

  return (
    <>
      <section className="hero-bg px-4 pt-32 pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Library</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Knowledge bases</h1>
            <p className="mt-3 max-w-xl text-white/80">
              Every company you&apos;ve scraped. Search, filter, export, or open one to see its full profile.
            </p>
          </div>
          <Link href="/knowledge" className={button.dark}>
            New scrape
          </Link>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 pb-24">
        {isHydrated ? (
          <KnowledgeList
            knowledgeList={knowledgeList}
            onDelete={deleteKnowledge}
            onDuplicate={duplicateKnowledge}
            onImport={addKnowledge}
          />
        ) : (
          <Card className="h-40 animate-pulse" />
        )}
      </div>
    </>
  );
}
