import React from 'react';
import { SearchResult } from '../lib/api';

const CATEGORY_COLORS: Record<string, string> = {
  invoice: 'bg-blue-900 text-blue-300',
  contract: 'bg-purple-900 text-purple-300',
  certificate: 'bg-yellow-900 text-yellow-300',
  'government-id': 'bg-red-900 text-red-300',
  receipt: 'bg-green-900 text-green-300',
  other: 'bg-muted text-gray-300',
};

function formatDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

interface Props {
  doc: SearchResult;
}

export function DocCard({ doc }: Props) {
  const colorClass = CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS['other'];

  return (
    <a
      href={doc.driveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface rounded-xl p-4 active:opacity-70 transition-opacity"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${colorClass}`}>
          {doc.category}
        </span>
        <span className="text-xs text-gray-500 ml-auto font-mono">{formatDate(doc.docDate)}</span>
      </div>
      <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{doc.snippet || 'No text extracted yet'}</p>
      {doc.ocrConfidence && (
        <p className="text-xs text-gray-600 mt-2">
          Confidence: {Math.round(parseFloat(doc.ocrConfidence) * 100)}%
        </p>
      )}
    </a>
  );
}
