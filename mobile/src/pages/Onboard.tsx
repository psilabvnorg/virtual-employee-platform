import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGoogleAuth, getStoredUser, GoogleUser } from '../hooks/useGoogleAuth';
import { FolderPicker } from '../components/FolderPicker';
import { getStoredFolder, storeFolder, FolderConfig } from './Settings';
import { LOGO_PATH } from '../lib/branding';

const ONBOARD_KEY = 'doc-vault-onboarded';
const STEPS = 3;

interface OnboardProps {
  onComplete: () => void;
}

export default function Onboard({ onComplete }: OnboardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<GoogleUser | null>(getStoredUser);
  const [folder, setFolder] = useState<FolderConfig | null>(getStoredFolder);
  const [loginError, setLoginError] = useState('');

  const { login } = useGoogleAuth(
    (newUser) => { setUser(newUser); setLoginError(''); },
    (msg) => setLoginError(msg),
  );

  function switchLanguage(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem('doc-vault-lang', lang);
  }

  function handleFolderSelect(id: string, name: string) {
    const config = { id, name };
    storeFolder(config);
    setFolder(config);
  }

  function finish() {
    localStorage.setItem(ONBOARD_KEY, 'true');
    onComplete();           // flip App state so the / route renders CategorySelect
    navigate('/', { replace: true });
  }

  const isLastStep = step === STEPS - 1;

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="px-4 pt-10 pb-2 flex flex-col items-center gap-2">
        <img src={LOGO_PATH} alt="PSI" className="w-16 h-16 rounded-2xl bg-white p-1 shrink-0" />
        <p className="text-xs text-accent uppercase tracking-widest font-mono">Doc Vault</p>
      </header>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i === step ? 'bg-accent w-6' : i < step ? 'bg-accent opacity-40' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 flex flex-col justify-center gap-6">
        {step === 0 && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">{t('onboard_step1_title')}</h1>
              <p className="text-gray-400 text-sm">{t('onboard_step1_desc')}</p>
            </div>
            <div className="bg-surface rounded-2xl p-1 flex gap-1">
              <button
                type="button"
                onClick={() => switchLanguage('en')}
                className={`flex-1 py-5 rounded-xl text-sm font-semibold transition-colors ${
                  i18n.language === 'en' ? 'bg-accent text-ink' : 'text-gray-400'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => switchLanguage('vi')}
                className={`flex-1 py-5 rounded-xl text-sm font-semibold transition-colors ${
                  i18n.language === 'vi' ? 'bg-accent text-ink' : 'text-gray-400'
                }`}
              >
                🇻🇳 Tiếng Việt
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">{t('onboard_step2_title')}</h1>
              <p className="text-gray-400 text-sm">{t('onboard_step2_desc')}</p>
            </div>
            {user ? (
              <div className="bg-surface rounded-2xl p-4 flex items-center gap-3">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-accent shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{user.name}</p>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
                <span className="text-accent text-xl shrink-0">✓</span>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => login()}
                  className="w-full bg-white text-ink font-semibold py-4 rounded-2xl text-sm flex items-center justify-center gap-3 active:opacity-80"
                >
                  <GoogleIcon />
                  {t('sign_in_google')}
                </button>
                {loginError && (
                  <p className="text-red-400 text-xs px-1 break-all">{loginError}</p>
                )}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">{t('onboard_step3_title')}</h1>
              <p className="text-gray-400 text-sm">{t('onboard_step3_desc')}</p>
            </div>
            {user ? (
              <div className="space-y-2">
                <FolderPicker
                  accessToken={user.accessToken}
                  selectedFolderId={folder?.id ?? ''}
                  selectedFolderName={folder?.name ?? ''}
                  onSelect={handleFolderSelect}
                />
                {folder && (
                  <p className="text-xs text-gray-500 px-1">{t('folder_hint')}</p>
                )}
              </div>
            ) : (
              <div className="bg-surface rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">{t('onboard_step3_no_account')}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 pt-4 space-y-3">
        <button
          type="button"
          onClick={isLastStep ? finish : () => setStep(s => s + 1)}
          className="w-full bg-accent text-ink font-bold py-4 rounded-2xl text-base active:opacity-80"
        >
          {isLastStep ? t('onboard_done') : t('onboard_next')}
        </button>
        {/* Skip is shown on Google step only — last step's primary button already finishes */}
        {step === 1 && (
          <button
            type="button"
            onClick={finish}
            className="w-full text-gray-500 text-sm py-2 active:text-gray-300"
          >
            {t('onboard_skip')}
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
