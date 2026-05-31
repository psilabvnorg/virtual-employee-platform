import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOGO_PATH } from '../lib/branding';
import { DocCategory } from '../lib/api';

export default function CategorySelect() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const lastCategory = localStorage.getItem('last-category') as DocCategory | null;

  const CATEGORIES: { id: DocCategory; label: string; icon: string; desc: string }[] = [
    { id: 'invoice',       label: t('categories.invoice'),       icon: '🧾', desc: t('categories.invoice_desc') },
    { id: 'contract',      label: t('categories.contract'),      icon: '📝', desc: t('categories.contract_desc') },
    { id: 'certificate',   label: t('categories.certificate'),   icon: '🏅', desc: t('categories.certificate_desc') },
    { id: 'government-id', label: t('categories.government_id'), icon: '🪪', desc: t('categories.government_id_desc') },
    { id: 'receipt',       label: t('categories.receipt'),       icon: '🛒', desc: t('categories.receipt_desc') },
    { id: 'other',         label: t('categories.other'),         icon: '📄', desc: t('categories.other_desc') },
  ];

  function handleSelect(id: DocCategory) {
    localStorage.setItem('last-category', id);
    navigate(`/capture/${id}`);
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <img src={LOGO_PATH} alt="PSI" className="w-10 h-10 rounded-xl bg-white p-0.5 shrink-0" />
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-mono mb-0.5">{t('app_name')}</p>
          <h1 className="text-2xl font-bold text-white">{t('select_category')}</h1>
        </div>
        {lastCategory && (
          <button
            type="button"
            onClick={() => handleSelect(lastCategory)}
            className="mt-3 text-xs text-accent underline underline-offset-2"
          >
            {t('quick_repeat')} {lastCategory}
          </button>
        )}
      </header>

      <div className="flex-1 px-4 pb-6 grid grid-cols-2 gap-3 content-start">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
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
        <button type="button" className="flex-1 py-4 text-sm text-accent font-medium" disabled>
          {t('nav_capture')}
        </button>
        <button type="button" onClick={() => navigate('/search')} className="flex-1 py-4 text-sm text-gray-400">
          {t('nav_search')}
        </button>
        <button type="button" onClick={() => navigate('/settings')} className="flex-1 py-4 text-sm text-gray-400">
          {t('nav_settings')}
        </button>
      </nav>
    </div>
  );
}
