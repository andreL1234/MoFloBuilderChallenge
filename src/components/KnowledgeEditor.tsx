"use client";

import { useState } from "react";
import { Knowledge } from "@/types/knowledge";
import { downloadJSON } from "@/utils/storage";
import { button, Card, ConfidenceBadge, inputClass } from "@/components/ui";

interface KnowledgeEditorProps {
  knowledge: Knowledge;
  onSave: (knowledge: Knowledge) => void;
  onCancel: () => void;
  saveLabel?: string;
}

function FieldLabel({ htmlFor, children, badge }: { htmlFor: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {children}
      </label>
      {badge}
    </div>
  );
}

export default function KnowledgeEditor({
  knowledge,
  onSave,
  onCancel,
  saveLabel = "Save changes",
}: KnowledgeEditorProps) {
  const [edited, setEdited] = useState<Knowledge>(knowledge);
  const [showJson, setShowJson] = useState(false);

  const handleFoundationChange = (field: string, value: string) => {
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
    onSave({ ...edited, updatedAt: new Date().toISOString() });
  };

  return (
    <Card className="animate-fade-up overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Edit knowledge base</h2>
          <p className="text-sm text-muted">Correct anything the scraper got wrong before saving.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowJson(!showJson)} className={button.subtle}>
            {showJson ? "Hide JSON" : "Preview JSON"}
          </button>
          <button type="button" onClick={() => downloadJSON(edited)} className={button.subtle}>
            Download JSON
          </button>
        </div>
      </div>

      {showJson && (
        <pre className="max-h-96 overflow-auto border-b border-line bg-navy-900 px-6 py-5 font-mono text-xs leading-relaxed text-brand-100">
          {JSON.stringify(edited, null, 2)}
        </pre>
      )}

      <div className="grid gap-6 p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel htmlFor="companyName">Company name</FieldLabel>
          <input
            id="companyName"
            type="text"
            value={edited.companyName}
            onChange={(e) => setEdited({ ...edited, companyName: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="industry"
            badge={
              edited.foundation.industryConfidence !== undefined && (
                <ConfidenceBadge value={edited.foundation.industryConfidence} label="detected" />
              )
            }
          >
            Industry
          </FieldLabel>
          <input
            id="industry"
            type="text"
            value={edited.foundation.industry}
            onChange={(e) => handleFoundationChange("industry", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="businessModel"
            badge={
              edited.foundation.businessModelConfidence !== undefined && (
                <ConfidenceBadge value={edited.foundation.businessModelConfidence} label="detected" />
              )
            }
          >
            Business model
          </FieldLabel>
          <input
            id="businessModel"
            type="text"
            value={edited.foundation.businessModel}
            onChange={(e) => handleFoundationChange("businessModel", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="overview">Company overview</FieldLabel>
          <textarea
            id="overview"
            value={edited.foundation.overview}
            onChange={(e) => handleFoundationChange("overview", e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="pitch">Company pitch</FieldLabel>
          <textarea
            id="pitch"
            value={edited.positioning.pitch || ""}
            onChange={(e) => handlePitchChange(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line bg-surface/60 px-6 py-4">
        <button type="button" onClick={onCancel} className={button.subtle}>
          Cancel
        </button>
        <button type="button" onClick={handleSave} className={button.primary}>
          {saveLabel}
        </button>
      </div>
    </Card>
  );
}
