"use client";

import { useRouter } from "next/navigation";
import { useKnowledge } from "@/context/KnowledgeContext";
import KnowledgeList from "@/components/KnowledgeList";
import { Knowledge } from "@/types/knowledge";

export default function ViewPage() {
  const router = useRouter();
  const { knowledgeList, deleteKnowledge, setCurrentKnowledge } = useKnowledge();

  const handleEdit = (knowledge: Knowledge) => {
    setCurrentKnowledge(knowledge);
    router.push("/knowledge");
  };

  const handleDelete = (id: string) => {
    deleteKnowledge(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Knowledge Bases</h1>
        <p className="text-gray-600">
          View, manage, and edit all saved knowledge bases
        </p>
      </div>

      <KnowledgeList
        knowledgeList={knowledgeList}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
