"use client";

import { Knowledge } from "@/types/knowledge";

interface KnowledgeDisplayProps {
  knowledge: Knowledge | null;
  onEdit: () => void;
}

export default function KnowledgeDisplay({
  knowledge,
  onEdit,
}: KnowledgeDisplayProps) {
  if (!knowledge) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{knowledge.companyName}</h2>
          <a
            href={knowledge.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            {knowledge.sourceUrl}
          </a>
        </div>
        <button
          onClick={onEdit}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Edit & Save
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Foundation */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Foundation</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Website</dt>
              <dd className="text-gray-900">{knowledge.foundation.website}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Industry</dt>
              <dd className="text-gray-900 flex items-center gap-2">
                {knowledge.foundation.industry}
                {knowledge.foundation.industryConfidence !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    knowledge.foundation.industryConfidence >= 0.75
                      ? "bg-green-100 text-green-700"
                      : knowledge.foundation.industryConfidence >= 0.5
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {Math.round(knowledge.foundation.industryConfidence * 100)}%
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Business Model</dt>
              <dd className="text-gray-900 flex items-center gap-2">
                {knowledge.foundation.businessModel}
                {knowledge.foundation.businessModelConfidence !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    knowledge.foundation.businessModelConfidence >= 0.75
                      ? "bg-green-100 text-green-700"
                      : knowledge.foundation.businessModelConfidence >= 0.5
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {Math.round(knowledge.foundation.businessModelConfidence * 100)}%
                  </span>
                )}
              </dd>
            </div>
            {knowledge.foundation.yearFounded && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Year Founded</dt>
                <dd className="text-gray-900">{knowledge.foundation.yearFounded}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Online Presence */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Online Presence</h3>
          <div className="space-y-2">
            {knowledge.onlinePresence.linkedin && (
              <a
                href={knowledge.onlinePresence.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm block"
              >
                LinkedIn
              </a>
            )}
            {knowledge.onlinePresence.facebook && (
              <a
                href={knowledge.onlinePresence.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm block"
              >
                Facebook
              </a>
            )}
            {knowledge.onlinePresence.twitter && (
              <a
                href={knowledge.onlinePresence.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm block"
              >
                Twitter/X
              </a>
            )}
          </div>
        </div>

        {/* Positioning */}
        <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Positioning</h3>
          <p className="text-gray-700 line-clamp-3">{knowledge.positioning.pitch}</p>
        </div>

        {/* Branding */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Branding & Style</h3>
          <div className="space-y-2">
            {knowledge.brandingAndStyle.writingStyle && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Writing Style</dt>
                <dd className="text-gray-900">{knowledge.brandingAndStyle.writingStyle}</dd>
              </div>
            )}
            {knowledge.brandingAndStyle.colors && knowledge.brandingAndStyle.colors.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Colors</dt>
                <div className="flex gap-2">
                  {knowledge.brandingAndStyle.colors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Think Bigger */}
        {knowledge.thinkBigger && (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Themes & USPs</h3>
            <div className="space-y-3">
              {knowledge.thinkBigger.contentThemes && knowledge.thinkBigger.contentThemes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Content Themes:</p>
                  <div className="flex flex-wrap gap-1">
                    {knowledge.thinkBigger.contentThemes.slice(0, 5).map((theme) => (
                      <span key={theme} className="bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {knowledge.thinkBigger.uniqueSellingPropositions &&
                knowledge.thinkBigger.uniqueSellingPropositions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">USPs:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {knowledge.thinkBigger.uniqueSellingPropositions.slice(0, 3).map((usp, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{usp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Confidence Score:</strong> {((knowledge.confidenceScore || 0) * 100).toFixed(0)}% •
          <strong className="ml-2">Scraped:</strong> {new Date(knowledge.scrapedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
