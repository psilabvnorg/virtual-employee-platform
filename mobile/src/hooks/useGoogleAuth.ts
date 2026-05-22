import { useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

const STORAGE_KEY = 'doc-vault-google-user';

export function getStoredUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GoogleUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: GoogleUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

async function fetchUserInfo(accessToken: string): Promise<{ name: string; email: string; picture: string }> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user info');
  return res.json();
}

export function useGoogleAuth(onSuccess: (user: GoogleUser) => void) {
  const login = useGoogleLogin({
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    onSuccess: async (response) => {
      try {
        const info = await fetchUserInfo(response.access_token);
        const user: GoogleUser = { ...info, accessToken: response.access_token };
        storeUser(user);
        onSuccess(user);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    },
    onError: (err) => console.error('Google login error:', err),
  });

  const logout = useCallback(() => {
    googleLogout();
    clearUser();
  }, []);

  return { login, logout };
}
