"use client";

import { useState } from "react";
import { Knowledge } from "@/types/knowledge";
import { downloadJSON } from "@/utils/storage";

interface KnowledgeListProps {
  knowledgeList: Knowledge[];
  onEdit: (knowledge: Knowledge) => void;
  onDelete: (id: string) => void;
}

type ViewMode = "cards" | "table" | "detail";

export default function KnowledgeList({
  knowledgeList,
  onEdit,
  onDelete,
}: KnowledgeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = knowledgeList.filter(
    (k) =>
      k.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.foundation.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedKnowledge = filtered.find((k) => k.id === selectedId);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this knowledge base?")) {
      onDelete(id);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by company name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <div className="flex gap-2">
            {(["cards", "table", "detail"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === mode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {filtered.length} knowledge base{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No knowledge bases found</p>
          <a
            href="/knowledge"
            className="text-blue-600 hover:underline font-medium"
          >
            Start by creating one
          </a>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((kb) => (
            <div
              key={kb.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedId(kb.id)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {kb.companyName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {kb.foundation.industry}
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                {kb.foundation.yearFounded && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {kb.foundation.yearFounded}
                  </span>
                )}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {
                    (() => {
                      const score = kb.confidenceScore || 0;
                      const normalized = typeof score === 'number' && score > 1 ? score / 100 : score;
                      return `${(Math.max(0, Math.min(1, normalized)) * 100).toFixed(0)}% confidence`;
                    })()
                  }
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(kb);
                  }}
                  className="flex-1 text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadJSON(kb);
                  }}
                  className="flex-1 text-sm px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition"
                >
                  Export
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(kb.id);
                  }}
                  className="flex-1 text-sm px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">Company</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">Industry</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">Founded</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">Confidence</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kb, i) => (
                <tr
                  key={kb.id}
                  className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="px-6 py-3 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedId(kb.id)}>
                    {kb.companyName}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{kb.foundation.industry}</td>
                  <td className="px-6 py-3 text-gray-700">{kb.foundation.yearFounded || "-"}</td>
                  <td className="px-6 py-3">
                    <span className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded">
                      {
                        (() => {
                          const score = kb.confidenceScore || 0;
                          const normalized = typeof score === 'number' && score > 1 ? score / 100 : score;
                          return `${(Math.max(0, Math.min(1, normalized)) * 100).toFixed(0)}%`;
                        })()
                      }
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(kb)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadJSON(kb)}
                        className="text-gray-600 hover:underline text-sm font-medium"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => handleDelete(kb.id)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedKnowledge && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setSelectedId(null)}
              className="text-blue-600 hover:underline mb-4 text-sm"
            >
              ← Back to list
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedKnowledge.companyName}
            </h2>
            <p className="text-gray-600 mb-4">{selectedKnowledge.foundation.industry}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                <p className="text-gray-700 text-sm">{selectedKnowledge.foundation.overview}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pitch</h3>
                <p className="text-gray-700 text-sm line-clamp-4">
                  {selectedKnowledge.positioning.pitch}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(selectedKnowledge)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit
              </button>
              <button
                onClick={() => downloadJSON(selectedKnowledge)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Download JSON
              </button>
              <button
                onClick={() => handleDelete(selectedKnowledge.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
