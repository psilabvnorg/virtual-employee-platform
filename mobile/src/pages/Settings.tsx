import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth, getStoredUser, GoogleUser } from '../hooks/useGoogleAuth';
import { FolderPicker } from '../components/FolderPicker';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

const FOLDER_KEY = 'doc-vault-root-folder';

export interface FolderConfig {
  id: string;
  name: string;
}

export function getStoredFolder(): FolderConfig | null {
  try {
    const raw = localStorage.getItem(FOLDER_KEY);
    return raw ? (JSON.parse(raw) as FolderConfig) : null;
  } catch {
    return null;
  }
}

export function storeFolder(folder: FolderConfig): void {
  localStorage.setItem(FOLDER_KEY, JSON.stringify(folder));
}

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<GoogleUser | null>(getStoredUser);
  const [folder, setFolder] = useState<FolderConfig | null>(getStoredFolder);
  const { queueCount, drainQueue, draining } = useOfflineQueue();

  useEffect(() => {
    // Refresh from storage in case another tab updated it
    setUser(getStoredUser());
    setFolder(getStoredFolder());
  }, []);

  const { login, logout } = useGoogleAuth((newUser) => {
    setUser(newUser);
  });

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

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="px-4 pt-5 pb-4">
        <p className="text-xs text-accent uppercase tracking-widest font-mono mb-1">Doc Vault</p>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </header>

      <div className="flex-1 px-4 space-y-4 overflow-y-auto pb-8">
        {/* Google Account */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">Google Account</p>
          {user ? (
            <div className="bg-surface rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-accent"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{user.name}</p>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-muted text-gray-300 py-2.5 rounded-xl text-sm font-medium active:opacity-70"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => login()}
              className="w-full bg-white text-ink font-semibold py-4 rounded-2xl text-sm flex items-center justify-center gap-3 active:opacity-80"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          )}
        </section>

        {/* Drive Folder */}
        {user && (
          <section>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">Storage Root Folder</p>
            <FolderPicker
              accessToken={user.accessToken}
              selectedFolderId={folder?.id ?? ''}
              selectedFolderName={folder?.name ?? ''}
              onSelect={handleFolderSelect}
            />
            {folder && (
              <p className="text-xs text-gray-600 mt-2 px-1">
                New uploads will go into this folder, organized by category / year / month.
              </p>
            )}
          </section>
        )}

        {/* Offline Queue */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">Offline Queue</p>
          <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{queueCount} pending upload{queueCount !== 1 ? 's' : ''}</p>
              <p className="text-gray-500 text-xs mt-0.5">Saved offline, will upload automatically</p>
            </div>
            {queueCount > 0 && (
              <button
                onClick={() => drainQueue()}
                disabled={draining}
                className="bg-accent text-ink text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {draining ? 'Uploading…' : 'Upload Now'}
              </button>
            )}
          </div>
        </section>

        {/* App info */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">About</p>
          <div className="bg-surface rounded-2xl p-4 space-y-1">
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Backend" value={window.location.origin.replace('5174', '3001')} />
            <InfoRow label="OCR" value="Nightly at 02:00" />
          </div>
        </section>
      </div>

      <nav className="border-t border-muted flex">
        <button onClick={() => navigate('/')} className="flex-1 py-4 text-sm text-gray-400">
          Capture
        </button>
        <button onClick={() => navigate('/search')} className="flex-1 py-4 text-sm text-gray-400">
          Search
        </button>
        <button className="flex-1 py-4 text-sm text-accent font-medium" disabled>
          Settings
        </button>
      </nav>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-300 text-xs font-mono truncate max-w-[55%] text-right">{value}</span>
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
