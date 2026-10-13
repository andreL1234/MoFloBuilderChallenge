"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useKnowledge } from "@/context/KnowledgeContext";
import KnowledgeDisplay, { KnowledgeHeader } from "@/components/KnowledgeDisplay";
import KnowledgeEditor from "@/components/KnowledgeEditor";
import { downloadJSON } from "@/utils/storage";
import { button, Card } from "@/components/ui";

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { knowledgeList, isHydrated, updateKnowledge, deleteKnowledge, duplicateKnowledge } = useKnowledge();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const knowledge = knowledgeList.find((k) => k.id === id);

  // localStorage loads after the first render, so wait before deciding the record doesn't exist
  if (!isHydrated) {
    return (
      <section className="hero-bg px-4 pt-36 pb-24">
        <div className="mx-auto h-20 max-w-6xl animate-pulse rounded-card bg-white/10" />
      </section>
    );
  }

  if (!knowledge) {
    return (
      <>
        <section className="hero-bg px-4 pt-36 pb-28" />
        <div className="relative z-10 mx-auto -mt-16 max-w-xl px-4 pb-24">
          <Card className="px-6 py-14 text-center">
            <h1 className="text-xl font-semibold text-ink">Knowledge base not found</h1>
            <p className="mt-2 text-sm text-muted">It may have been deleted, or it was saved in a different browser.</p>
            <Link href="/knowledge/view" className={`${button.primary} mt-6`}>
              Back to knowledge bases
            </Link>
          </Card>
        </div>
      </>
    );
  }

  const handleDuplicate = () => {
    const copy = duplicateKnowledge(knowledge.id);
    if (copy) router.push(`/knowledge/view/${copy.id}`);
  };

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    deleteKnowledge(knowledge.id);
    router.push("/knowledge/view");
  };

  return (
    <>
      <section className="hero-bg px-4 pt-32 pb-24 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-8 flex items-center gap-2 text-sm text-white/70" aria-label="Breadcrumb">
            <Link href="/knowledge/view" className="hover:text-white">
              Knowledge bases
            </Link>
            <span>/</span>
            <span className="truncate text-white">{knowledge.companyName}</span>
          </nav>
          <KnowledgeHeader
            knowledge={knowledge}
            onDark
            actions={
              !isEditing && (
                <>
                  <button type="button" onClick={() => setIsEditing(true)} className={button.white}>
                    Edit
                  </button>
                  <button type="button" onClick={() => downloadJSON(knowledge)} className={button.glass}>
                    Export JSON
                  </button>
                  <button type="button" onClick={handleDuplicate} className={button.glass}>
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className={confirmingDelete ? button.dangerSolid : button.glass}
                  >
                    {confirmingDelete ? "Confirm delete" : "Delete"}
                  </button>
                </>
              )
            }
          />
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 pb-24">
        {isEditing ? (
          <KnowledgeEditor
            knowledge={knowledge}
            onSave={(edited) => {
              updateKnowledge(edited);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <KnowledgeDisplay knowledge={knowledge} />
        )}
      </div>
    </>
  );
}
