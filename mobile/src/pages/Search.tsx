import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDocs, SearchResult, DocCategory } from '../lib/api';
import { DocCard } from '../components/DocCard';

const CATEGORIES: { id: DocCategory | ''; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'contract', label: 'Contract' },
  { id: 'certificate', label: 'Cert' },
  { id: 'government-id', label: 'Gov ID' },
  { id: 'receipt', label: 'Receipt' },
  { id: 'other', label: 'Other' },
];

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DocCategory | ''>('');
  const [year, setYear] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(
    async (q: string, cat: DocCategory | '', yr: string) => {
      setLoading(true);
      setSearched(true);
      try {
        const res = await searchDocs({ q: q || undefined, category: cat || undefined, year: yr || undefined });
        setResults(res.results);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query, category, year);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="px-4 pt-5 pb-3">
        <p className="text-xs text-accent uppercase tracking-widest font-mono mb-1">Doc Vault</p>
        <h1 className="text-2xl font-bold text-white">Search Documents</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 space-y-3">
        <input
          type="search"
          placeholder="Search text in documents…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface text-white rounded-xl px-4 py-3 text-base border border-muted focus:border-accent outline-none placeholder-gray-600"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id as DocCategory | '');
                if (searched) runSearch(query, cat.id as DocCategory | '', year);
              }}
              className={`flex-none px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat.id
                  ? 'bg-accent text-ink'
                  : 'bg-surface text-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              if (searched) runSearch(query, category, e.target.value);
            }}
            className="bg-surface text-white rounded-xl px-3 py-2 text-sm border border-muted focus:border-accent outline-none"
          >
            <option value="">Any year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            type="submit"
            className="flex-1 bg-accent text-ink font-bold py-2 rounded-xl text-sm active:opacity-80"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex-1 px-4 mt-4 overflow-y-auto pb-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12 text-gray-600 text-sm">No documents found.</div>
        )}
        {!loading && results.map((doc) => <DocCard key={doc.fileId} doc={doc} />)}
      </div>

      <nav className="border-t border-muted flex">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-4 text-sm text-gray-400"
        >
          Capture
        </button>
        <button className="flex-1 py-4 text-sm text-accent font-medium" disabled>
          Search
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex-1 py-4 text-sm text-gray-400"
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
