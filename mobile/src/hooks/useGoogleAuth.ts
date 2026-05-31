import { useCallback, useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // ms timestamp
}

const STORAGE_KEY = 'doc-vault-google-user';
const CLIENT_ID = '6665982716-qu3h9qa50liccdnkfl2ipgni9ds8spug.apps.googleusercontent.com';
const REDIRECT_URI = 'com.googleusercontent.apps.6665982716-qu3h9qa50liccdnkfl2ipgni9ds8spug:/oauth2redirect';
const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive';

export function getStoredUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GoogleUser) : null;
  } catch { return null; }
}

export function storeUser(user: GoogleUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function bufToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = bufToBase64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const challenge = bufToBase64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  return { verifier, challenge };
}

let pendingOAuth: { resolve: (u: GoogleUser) => void; reject: (m: string) => void; verifier: string } | null = null;
let listenerRegistered = false;

async function handleOAuthRedirect(data: { url: string }) {
  const cb = pendingOAuth;
  pendingOAuth = null;
  if (!cb) return;

  Browser.close().catch(() => {});

  try {
    const url = new URL(data.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) { cb.reject(`OAuth error: ${error ?? 'missing code'}`); return; }

    const params = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: cb.verifier,
    });

    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!resp.ok) throw new Error(`Token exchange failed: ${await resp.text()}`);
    const tokens = await resp.json();

    const [, payload] = (tokens.id_token as string).split('.');
    const info = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

    const user: GoogleUser = {
      name: info.name ?? '',
      email: info.email ?? '',
      picture: info.picture ?? '',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    };

    storeUser(user);
    cb.resolve(user);
  } catch (err) {
    cb.reject(err instanceof Error ? err.message : String(err));
  }
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: number }> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!resp.ok) throw new Error(`Token refresh failed: ${await resp.text()}`);
  const tokens = await resp.json();
  return {
    accessToken: tokens.access_token as string,
    expiresAt: Date.now() + ((tokens.expires_in as number) ?? 3600) * 1000,
  };
}

export function useGoogleAuth(onSuccess: (user: GoogleUser) => void, onError?: (msg: string) => void) {
  useEffect(() => {
    if (listenerRegistered) return;
    listenerRegistered = true;
    App.addListener('appUrlOpen', handleOAuthRedirect);
  }, []);

  const login = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      onError?.('Sign-in only works on mobile (Android/iOS).');
      return;
    }
    try {
      const { verifier, challenge } = await generatePKCE();
      await new Promise<GoogleUser>((resolve, reject) => {
        pendingOAuth = { resolve, reject, verifier };
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        url.searchParams.set('client_id', CLIENT_ID);
        url.searchParams.set('redirect_uri', REDIRECT_URI);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', SCOPES);
        url.searchParams.set('code_challenge', challenge);
        url.searchParams.set('code_challenge_method', 'S256');
        url.searchParams.set('access_type', 'offline');
        url.searchParams.set('prompt', 'consent');
        Browser.open({ url: url.toString() });
      }).then(onSuccess);
    } catch (err) {
      pendingOAuth = null;
      onError?.(err instanceof Error ? err.message : String(err));
    }
  }, [onSuccess, onError]);

  const logout = useCallback(() => { clearUser(); }, []);

  return { login, logout };
}
