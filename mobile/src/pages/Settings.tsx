import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGoogleAuth, getStoredUser, GoogleUser } from '../hooks/useGoogleAuth';
import { FolderPicker } from '../components/FolderPicker';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { LOGO_PATH } from '../lib/branding';

const FOLDER_KEY = 'doc-vault-root-folder';
const SHEETS_KEY = 'doc-vault-sheets-enabled';

function isSheetsOn(): boolean {
  return localStorage.getItem(SHEETS_KEY) === 'true';
}

export interface FolderConfig { id: string; name: string; }

export function getStoredFolder(): FolderConfig | null {
  try {
    const raw = localStorage.getItem(FOLDER_KEY);
    return raw ? (JSON.parse(raw) as FolderConfig) : null;
  } catch { return null; }
}

export function storeFolder(folder: FolderConfig): void {
  localStorage.setItem(FOLDER_KEY, JSON.stringify(folder));
}

export default function Settings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<GoogleUser | null>(getStoredUser);
  const [folder, setFolder] = useState<FolderConfig | null>(getStoredFolder);
  const [loginError, setLoginError] = useState('');
  const [sheetsEnabled, setSheetsEnabled] = useState(isSheetsOn);
  const { queueCount, drainQueue, draining } = useOfflineQueue();

  function toggleSheets() {
    const next = !sheetsEnabled;
    setSheetsEnabled(next);
    localStorage.setItem(SHEETS_KEY, String(next));
  }

  useEffect(() => {
    setUser(getStoredUser());
    setFolder(getStoredFolder());
  }, []);

  const { login, logout } = useGoogleAuth(
    (newUser) => { setUser(newUser); setLoginError(''); },
    (msg) => { if (msg !== 'browser_closed') setLoginError(msg); },
  );

  function handleLogout() {
    logout();
    setUser(null);
    setFolder(null);
    localStorage.removeItem(FOLDER_KEY);
  }

  function handleFolderSelect(id: string, name: string) {
    const config = { id, name };
    storeFolder(config);
    setFolder(config);
  }

  function switchLanguage(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem('doc-vault-lang', lang);
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="px-4 pt-5 pb-4 flex items-center gap-3">
        <img src={LOGO_PATH} alt="PSI" className="w-10 h-10 rounded-xl bg-white p-0.5 shrink-0" />
        <div>
          <p className="text-xs text-accent uppercase tracking-widest font-mono mb-0.5">{t('app_name')}</p>
          <h1 className="text-2xl font-bold text-white">{t('settings_title')}</h1>
        </div>
      </header>

      <div className="flex-1 px-4 space-y-4 overflow-y-auto pb-24">

        {/* Language */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">{t('language')}</p>
          <div className="bg-surface rounded-2xl p-1 flex gap-1">
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                i18n.language === 'en' ? 'bg-accent text-ink' : 'text-gray-400'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('vi')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                i18n.language === 'vi' ? 'bg-accent text-ink' : 'text-gray-400'
              }`}
            >
              🇻🇳 Tiếng Việt
            </button>
          </div>
        </section>

        {/* Google Account */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">{t('google_account')}</p>
          {user ? (
            <div className="bg-surface rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-accent" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{user.name}</p>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="w-full bg-muted text-gray-300 py-2.5 rounded-xl text-sm font-medium active:opacity-70">
                {t('sign_out')}
              </button>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => login()} className="w-full bg-white text-ink font-semibold py-4 rounded-2xl text-sm flex items-center justify-center gap-3 active:opacity-80">
                <GoogleIcon />
                {t('sign_in_google')}
              </button>
              {loginError && (
                <p className="mt-2 text-red-400 text-xs px-1 break-all">{loginError}</p>
              )}
            </>
          )}
        </section>

        {/* Drive Folder */}
        {user && (
          <section>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">{t('storage_folder')}</p>
            <FolderPicker accessToken={user.accessToken} selectedFolderId={folder?.id ?? ''} selectedFolderName={folder?.name ?? ''} onSelect={handleFolderSelect} />
            {folder && <p className="text-xs text-gray-600 mt-2 px-1">{t('folder_hint')}</p>}
          </section>
        )}

        {/* Server Features */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">{t('server_features')}</p>
          <div className="bg-surface rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{t('sheets_db')}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-snug">
                  {sheetsEnabled ? t('sheets_db_hint_on') : t('sheets_db_hint_off')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sheetsEnabled}
                aria-label={t('sheets_db')}
                onClick={toggleSheets}
                className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  sheetsEnabled ? 'bg-accent' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    sheetsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Offline Queue */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">{t('offline_queue')}</p>
          <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{t('pending', { count: queueCount })}</p>
              <p className="text-gray-500 text-xs mt-0.5">{t('saved_offline')}</p>
            </div>
            {queueCount > 0 && (
              <button type="button" onClick={() => drainQueue()} disabled={draining} className="bg-accent text-ink text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50">
                {draining ? t('uploading_btn') : t('upload_now')}
              </button>
            )}
          </div>
        </section>

        {/* About */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">{t('about')}</p>
          <div className="bg-surface rounded-2xl p-4">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 text-sm">{t('version')}</span>
              <span className="text-gray-300 text-xs font-mono">1.0.0</span>
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-ink border-t border-muted flex safe-bottom z-10">
        <button type="button" onClick={() => navigate('/')} className="flex-1 py-4 text-sm text-gray-400">{t('nav_capture')}</button>
        <button type="button" onClick={() => navigate('/search')} className="flex-1 py-4 text-sm text-gray-400">{t('nav_search')}</button>
        <button type="button" className="flex-1 py-4 text-sm text-accent font-medium" disabled>{t('nav_settings')}</button>
      </nav>
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
