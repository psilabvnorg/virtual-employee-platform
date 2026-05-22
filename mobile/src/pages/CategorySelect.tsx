import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DocCategory } from '../lib/api';

const CATEGORIES: { id: DocCategory; label: string; icon: string; desc: string }[] = [
  { id: 'invoice', label: 'Invoice', icon: '🧾', desc: 'Bills, purchase orders' },
  { id: 'contract', label: 'Contract', icon: '📝', desc: 'Agreements, MoUs' },
  { id: 'certificate', label: 'Certificate', icon: '🏅', desc: 'Licenses, certs' },
  { id: 'government-id', label: 'Gov. ID', icon: '🪪', desc: 'Passport, ID card, visa' },
  { id: 'receipt', label: 'Receipt', icon: '🛒', desc: 'Payment receipts' },
  { id: 'other', label: 'Other', icon: '📄', desc: 'Any other document' },
];

export default function CategorySelect() {
  const navigate = useNavigate();
  const lastCategory = localStorage.getItem('last-category') as DocCategory | null;

  function handleSelect(id: DocCategory) {
    localStorage.setItem('last-category', id);
    navigate(`/capture/${id}`);
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs uppercase tracking-widest text-accent font-mono mb-1">Doc Vault</p>
        <h1 className="text-2xl font-bold text-white">Select Category</h1>
        {lastCategory && (
          <button
            onClick={() => handleSelect(lastCategory)}
            className="mt-3 text-xs text-accent underline underline-offset-2"
          >
            Quick-repeat: {lastCategory}
          </button>
        )}
      </header>

      <div className="flex-1 px-4 pb-6 grid grid-cols-2 gap-3 content-start">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className="bg-surface rounded-2xl p-5 text-left active:scale-95 transition-transform flex flex-col gap-1"
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-base font-semibold text-white mt-1">{cat.label}</span>
            <span className="text-xs text-gray-500">{cat.desc}</span>
          </button>
        ))}
      </div>

      <nav className="border-t border-muted flex">
        <button className="flex-1 py-4 text-sm text-accent font-medium" disabled>
          Capture
        </button>
        <button
          onClick={() => navigate('/search')}
          className="flex-1 py-4 text-sm text-gray-400"
        >
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
