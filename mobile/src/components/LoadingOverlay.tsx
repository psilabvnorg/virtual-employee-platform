import React from 'react';
import { useTranslation } from 'react-i18next';
import { LOGO_PATH } from '../lib/branding';

interface Props {
  message?: string;
}

export function LoadingOverlay({ message }: Props) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-ink flex flex-col items-center justify-center gap-6 z-50">
      <img src={LOGO_PATH} alt="PSI" className="w-24 h-24 rounded-2xl" />
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-medium">{message ?? t('processing')}</p>
    </div>
  );
}
