import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOGO_PATH } from '../lib/branding';
import { searchDocs, SearchResult, DocCategory } from '../lib/api';
import { DocCard } from '../components/DocCard';

export default function Search() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DocCategory | ''>('');
  const [year, setYear] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const CATEGORIES: { id: DocCategory | ''; label: string }[] = [
    { id: '', label: t('all') },
    { id: 'invoice', label: t('categories.invoice') },
    { id: 'contract', label: t('categories.contract') },
    { id: 'certificate', label: t('cert_short') },
    { id: 'government-id', label: t('gov_id_short') },
    { id: 'receipt', label: t('categories.receipt') },
    { id: 'other', label: t('categories.other') },
  ];

  const runSearch = useCallback(async (q: string, cat: DocCategory | '', yr: string) => {
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
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query, category, year);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        <img src={LOGO_PATH} alt="PSI" className="w-10 h-10 rounded-xl bg-white p-0.5 shrink-0" />
        <div>
          <p className="text-xs text-accent uppercase tracking-widest font-mono mb-0.5">{t('app_name')}</p>
          <h1 className="text-2xl font-bold text-white">{t('search_title')}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 space-y-3">
        <input
          type="search"
          placeholder={t('search_placeholder')}
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
                category === cat.id ? 'bg-accent text-ink' : 'bg-surface text-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); if (searched) runSearch(query, category, e.target.value); }}
            className="bg-surface text-white rounded-xl px-3 py-2 text-sm border border-muted focus:border-accent outline-none"
          >
            <option value="">{t('any_year')}</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button type="submit" className="flex-1 bg-accent text-ink font-bold py-2 rounded-xl text-sm active:opacity-80">
            {t('search_btn')}
          </button>
        </div>
      </form>

      <div className="flex-1 px-4 mt-4 overflow-y-auto pb-24 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12 text-gray-600 text-sm">{t('no_results')}</div>
        )}
        {!loading && results.map((doc) => <DocCard key={doc.fileId} doc={doc} />)}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-ink border-t border-muted flex safe-bottom z-10">
        <button type="button" onClick={() => navigate('/')} className="flex-1 py-4 text-sm text-gray-400">
          {t('nav_capture')}
        </button>
        <button type="button" className="flex-1 py-4 text-sm text-accent font-medium" disabled>
          {t('nav_search')}
        </button>
        <button type="button" onClick={() => navigate('/settings')} className="flex-1 py-4 text-sm text-gray-400">
          {t('nav_settings')}
        </button>
      </nav>
    </div>
  );
}
