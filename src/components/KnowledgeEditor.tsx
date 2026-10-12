"use client";

import { useState } from "react";
import { Knowledge } from "@/types/knowledge";
import { downloadJSON } from "@/utils/storage";

interface KnowledgeEditorProps {
  knowledge: Knowledge;
  onSave: (knowledge: Knowledge) => void;
  onCancel: () => void;
}

export default function KnowledgeEditor({
  knowledge,
  onSave,
  onCancel,
}: KnowledgeEditorProps) {
  const [edited, setEdited] = useState<Knowledge>(knowledge);
  const [showJson, setShowJson] = useState(false);

  const handleCompanyNameChange = (name: string) => {
    setEdited({ ...edited, companyName: name });
  };

  const handleFoundationChange = (field: string, value: string | number | undefined) => {
    setEdited({
      ...edited,
      foundation: {
        ...edited.foundation,
        [field]: value,
      },
    });
  };

  const handlePitchChange = (pitch: string) => {
    setEdited({
      ...edited,
      positioning: {
        ...edited.positioning,
        pitch,
      },
    });
  };

  const handleSave = () => {
    edited.updatedAt = new Date().toISOString();
    onSave(edited);
  };

  const handleDownload = () => {
    downloadJSON(edited);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Knowledge Base</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJson(!showJson)}
            className="text-blue-600 px-3 py-2 rounded hover:bg-blue-50 transition"
          >
            {showJson ? "Hide" : "Show"} JSON
          </button>
          <button
            onClick={handleDownload}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Download JSON
          </button>
        </div>
      </div>

      {showJson && (
        <div className="mb-6 bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
            {JSON.stringify(edited, null, 2)}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={edited.companyName}
            onChange={(e) => handleCompanyNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Industry */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Industry
            </label>
            {edited.foundation.industryConfidence !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                edited.foundation.industryConfidence >= 0.75
                  ? "bg-green-100 text-green-700"
                  : edited.foundation.industryConfidence >= 0.5
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {Math.round(edited.foundation.industryConfidence * 100)}% confidence
              </span>
            )}
          </div>
          <input
            type="text"
            value={edited.foundation.industry}
            onChange={(e) => handleFoundationChange("industry", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Business Model */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Business Model
            </label>
            {edited.foundation.businessModelConfidence !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                edited.foundation.businessModelConfidence >= 0.75
                  ? "bg-green-100 text-green-700"
                  : edited.foundation.businessModelConfidence >= 0.5
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {Math.round(edited.foundation.businessModelConfidence * 100)}% confidence
              </span>
            )}
          </div>
          <input
            type="text"
            value={edited.foundation.businessModel}
            onChange={(e) => handleFoundationChange("businessModel", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Year Founded */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year Founded
          </label>
          <input
            type="number"
            value={edited.foundation.yearFounded || ""}
            onChange={(e) => {
              const year = e.target.value ? parseInt(e.target.value, 10) : undefined;
              handleFoundationChange("yearFounded", year);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Overview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Overview
        </label>
        <textarea
          value={edited.foundation.overview}
          onChange={(e) => handleFoundationChange("overview", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Pitch */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Pitch
        </label>
        <textarea
          value={edited.positioning.pitch || ""}
          onChange={(e) => handlePitchChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Save to Knowledge Base
        </button>
      </div>
    </div>
  );
}
