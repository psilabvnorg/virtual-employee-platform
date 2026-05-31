# Doc Vault — Mobile App Documentation

**App Name**: Doc Vault  
**App ID**: `com.psi.docvault`  
**Tech Stack**: React 18 + TypeScript + Capacitor 8 + Tailwind CSS  
**Platforms**: Android (via Capacitor), PWA (browser)  
**Languages**: English, Vietnamese  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Authentication (Google OAuth 2.0 + PKCE)](#3-authentication-google-oauth-20--pkce)
4. [Google Drive Integration](#4-google-drive-integration)
5. [Navigation & Screens](#5-navigation--screens)
6. [State Management & Storage](#6-state-management--storage)
7. [Offline Queue](#7-offline-queue)
8. [Camera & OCR](#8-camera--ocr)
9. [Internationalization (i18n)](#9-internationalization-i18n)
10. [Build & Deployment](#10-build--deployment)
11. [Key Dependencies](#11-key-dependencies)
12. [Architecture Decisions](#12-architecture-decisions)

---

## 1. Project Overview

Doc Vault is a **mobile document management application** that lets users:

- Capture photos of physical documents using the device camera
- Organize documents into categories (Invoice, Contract, Certificate, Government ID, Receipt, Other)
- Upload documents directly to the user's own **Google Drive** folder
- Extract text from documents using on-device **OCR (Tesseract.js)**
- Work **offline** — uploads queue locally and sync automatically when connectivity returns
- Switch the UI language between **English and Vietnamese**

The app uses **no proprietary cloud backend** for storage — all files go directly into the authenticated user's Google Drive. Authentication is handled via Google OAuth 2.0 with PKCE, making it suitable for mobile use without a server-side client secret.

---

## 2. Project Structure

```
mobile/
├── src/
│   ├── pages/                  # Route-level page components
│   │   ├── Onboard.tsx         # 3-step onboarding (language → sign in → folder pick)
│   │   ├── CategorySelect.tsx  # Main hub: choose document category
│   │   ├── Capture.tsx         # Camera / gallery capture screen
│   │   ├── Upload.tsx          # Review, date-edit, and upload screen
│   │   ├── Search.tsx          # Drive document search screen
│   │   └── Settings.tsx        # Account, folder, language, queue settings
│   ├── components/             # Reusable UI components
│   │   ├── FolderPicker.tsx    # Interactive Google Drive folder browser
│   │   ├── PhotoGrid.tsx       # 3-column photo preview grid
│   │   ├── DocCard.tsx         # Search result card component
│   │   └── LoadingOverlay.tsx  # Full-screen loading indicator
│   ├── hooks/                  # Custom React hooks
│   │   ├── useGoogleAuth.ts    # Google OAuth 2.0 + PKCE authentication
│   │   ├── useCamera.ts        # Camera / file input management
│   │   ├── useOcr.ts           # Tesseract.js OCR in worker thread
│   │   └── useOfflineQueue.ts  # IndexedDB offline upload queue
│   ├── lib/                    # Utility modules
│   │   ├── driveApi.ts         # Google Drive API v3 wrapper functions
│   │   ├── api.ts              # High-level upload orchestration
│   │   ├── i18n.ts             # i18next config + all translation strings
│   │   └── branding.ts         # App color/branding constants
│   ├── App.tsx                 # Root component, React Router routes
│   └── main.tsx                # Vite entry point
├── android/                    # Capacitor Android project
├── public/                     # Static assets (icons, logos)
├── dist/                       # Production build output (gitignored)
├── capacitor.config.ts         # Capacitor configuration
├── vite.config.ts              # Vite + PWA plugin config
├── tailwind.config.js          # Tailwind CSS config
└── package.json                # Dependencies and scripts
```

---

## 3. Authentication (Google OAuth 2.0 + PKCE)

### Overview

Authentication is implemented entirely in [`src/hooks/useGoogleAuth.ts`](src/hooks/useGoogleAuth.ts) using the **Authorization Code flow with PKCE** (Proof Key for Code Exchange). This is the recommended approach for mobile apps because it does not require a server-side client secret.

The app uses **Capacitor's in-app browser** to open Google's OAuth consent screen, then captures the redirect via a custom URI scheme deep link.

### Google OAuth Credentials

| Field | Value |
|---|---|
| Client ID | `6665982716-qu3h9qa50liccdnkfl2ipgni9ds8spug.apps.googleusercontent.com` |
| Redirect URI | `com.googleusercontent.apps.6665982716-qu3h9qa50liccdnkfl2ipgni9ds8spug:/oauth2redirect` |
| Scopes | `openid email profile https://www.googleapis.com/auth/drive` |

> **Note**: The redirect URI uses the **reverse client ID scheme** (`com.googleusercontent.apps.<client-id>`), which is the standard pattern for Android native OAuth apps.

### Authentication Flow (Step by Step)

```
User taps "Sign in with Google"
        │
        ▼
1. App generates PKCE code_verifier (random 128-char string)
   and code_challenge (SHA-256 hash, base64url-encoded)
        │
        ▼
2. App opens Capacitor browser to Google OAuth endpoint:
   https://accounts.google.com/o/oauth2/v2/auth
   ?client_id=...
   &redirect_uri=com.googleusercontent.apps...:/oauth2redirect
   &response_type=code
   &scope=openid email profile drive
   &code_challenge=...
   &code_challenge_method=S256
   &access_type=offline          ← requests refresh token
        │
        ▼
3. User authorizes in Google consent screen
        │
        ▼
4. Google redirects to custom URI scheme:
   com.googleusercontent.apps...:/oauth2redirect?code=AUTH_CODE
        │
        ▼
5. Capacitor App plugin fires "appUrlOpen" event
   handleOAuthRedirect() extracts `code` from URL
        │
        ▼
6. App POST to https://oauth2.googleapis.com/token
   with code + code_verifier (PKCE exchange, no client secret needed)
        │
        ▼
7. Google returns { access_token, refresh_token, id_token, expires_in }
        │
        ▼
8. App decodes id_token (JWT) to extract user name, email, picture
   Stores everything in localStorage under key "doc-vault-google-user"
        │
        ▼
9. User is authenticated — app proceeds to folder selection step
```

### Token Storage Schema

Stored in `localStorage` key `doc-vault-google-user`:

```json
{
  "name": "User Full Name",
  "email": "user@gmail.com",
  "picture": "https://lh3.googleusercontent.com/...",
  "accessToken": "ya29.xxx",
  "refreshToken": "1//xxx",
  "expiresAt": 1748000000000
}
```

### Automatic Token Refresh

The hook exposes a `getValidAccessToken()` helper used before every Google API call:

1. Reads the stored token and checks `expiresAt`
2. If the token expires within **5 minutes**, calls `refreshAccessToken()`
3. `refreshAccessToken()` POSTs to `https://oauth2.googleapis.com/token` with `grant_type=refresh_token`
4. Updates `accessToken` and `expiresAt` in localStorage
5. Returns the valid token to the caller

This means callers never need to handle token expiration manually — just call `getValidAccessToken()`.

### Sign Out

Calling `signOut()` from the hook:
- Removes `doc-vault-google-user` from localStorage
- Updates React state to clear the user object
- Does **not** revoke the Google token server-side (the token will expire naturally)

### Hook API

```typescript
const {
  user,                  // GoogleUser | null — current signed-in user
  loading,               // boolean — sign-in in progress
  error,                 // string | null — last error message
  signIn,                // () => Promise<void> — start OAuth flow
  signOut,               // () => void — clear local session
  getValidAccessToken,   // () => Promise<string> — auto-refreshing token getter
} = useGoogleAuth();
```

### Important Notes

- **No email/password authentication** — Google OAuth is the only sign-in method.
- The `@react-oauth/google` package is installed but **not used** — the custom PKCE implementation in `useGoogleAuth.ts` handles everything.
- On web (non-Capacitor), the `appUrlOpen` event may not fire correctly. The OAuth redirect flow is designed for the Android Capacitor build.

---

## 4. Google Drive Integration

### Overview

All file storage happens in the authenticated user's **Google Drive**. The app never stores documents on a proprietary server. There are two layers:

- **[`src/lib/driveApi.ts`](src/lib/driveApi.ts)** — low-level wrappers around the Drive API v3
- **[`src/lib/api.ts`](src/lib/api.ts)** — high-level orchestration (token refresh, folder creation, batch upload)

### driveApi.ts — Low-Level Functions

All functions accept `accessToken` as the first argument and call the Drive API directly.

#### `listFolders(accessToken, parentId?)`
Lists all folders inside a given parent folder (defaults to Drive root).  
Endpoint: `GET https://www.googleapis.com/drive/v3/files`  
Query filter: `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`

#### `getFolderName(accessToken, folderId)`
Returns the display name of a folder by its Drive file ID.  
Endpoint: `GET https://www.googleapis.com/drive/v3/files/{folderId}?fields=name`

#### `createFolder(accessToken, name, parentId?)`
Creates a new folder with the given name inside the specified parent.  
Endpoint: `POST https://www.googleapis.com/drive/v3/files`  
Body: `{ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }`

#### `findOrCreateFolder(accessToken, name, parentId?)`
Idempotent — searches for an existing folder by name inside `parentId`. If found, returns it. If not found, calls `createFolder()`. Use this instead of `createFolder()` to avoid duplicate folders on retry.

#### `uploadFile(accessToken, file, name, parentId?)`
Uploads a file (e.g., a JPEG photo) using Drive's **multipart upload** endpoint.  
Endpoint: `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`  
Returns: `{ id, name, webViewLink }` — the `webViewLink` is the shareable Drive URL.

### api.ts — High-Level Upload Orchestration

#### `uploadDocPhotos(category, photos, docDate)`

The main function called from the Upload screen. It:

1. Reads `doc-vault-google-user` and `doc-vault-root-folder` from localStorage
2. Calls `getValidAccessToken()` to ensure token is fresh
3. Calls `findOrCreateFolder()` for the category subfolder under the root
4. Uploads each photo with a deterministic filename:
   ```
   {category}_{YYYYMMDD}_{timestamp}_{index}.{ext}
   Example: invoice_20260531_1748700000000_0.jpg
   ```
5. Returns an array of `{ fileId, webViewLink }` for each uploaded file
6. If the network is unavailable, enqueues the upload to IndexedDB instead (see [Offline Queue](#7-offline-queue))

### Folder Hierarchy in Google Drive

When a user selects a root folder (e.g., "My Documents") during onboarding, the app creates this structure automatically:

```
My Documents/               ← user-selected root folder
├── invoice/
├── contract/
├── certificate/
├── government-id/
├── receipt/
└── other/
```

Category subfolders are created **on demand** (first upload to that category) using `findOrCreateFolder()`.

### FolderPicker Component

[`src/components/FolderPicker.tsx`](src/components/FolderPicker.tsx) is an interactive Drive folder browser:

- Starts at Drive root, lists all folders using `listFolders()`
- Allows drilling into subfolders (breadcrumb navigation)
- Has an inline "New Folder" creation form
- Emits the selected `{ id, name }` to the parent via callback
- Used in both the Onboarding screen (Step 3) and the Settings screen

### Google Sheets (Planned)

The Settings screen has a toggle for "Server Features" (Google Sheets logging). This feature is **not yet implemented** — the toggle exists but the upload does not write to Sheets.

### API Authorization

All Drive API requests use the standard Bearer token header:
```
Authorization: Bearer {accessToken}
```

No API key is needed — the access token granted during OAuth is sufficient.

---

## 5. Navigation & Screens

### Route Map

The app uses **React Router v6** with `BrowserRouter`. Routes are defined in [`src/App.tsx`](src/App.tsx).

| Route | Component | Description |
|---|---|---|
| `/onboard` | `Onboard.tsx` | First-launch setup wizard |
| `/` | `CategorySelect.tsx` | Main hub — pick document category |
| `/capture/:category` | `Capture.tsx` | Camera / gallery capture |
| `/upload` | `Upload.tsx` | Review photos and upload to Drive |
| `/search` | `Search.tsx` | Search saved documents |
| `/settings` | `Settings.tsx` | Account, folder, language settings |

On first launch (no `doc-vault-onboarded` in localStorage), the app redirects to `/onboard`. After onboarding completes, it redirects to `/`.

### Screen Details

#### `/onboard` — Onboarding (3 Steps)

**Step 1 — Language**: Choose English or Vietnamese. Stored to `doc-vault-lang`.  
**Step 2 — Sign In**: Renders Google sign-in button using `useGoogleAuth`. Waits for successful auth before enabling Next.  
**Step 3 — Folder**: Renders `FolderPicker` to select or create a Drive folder. Stored to `doc-vault-root-folder`.  
On completion: sets `doc-vault-onboarded = true` and navigates to `/`.

#### `/` — Category Select

Shows 6 category tiles. Tapping a tile navigates to `/capture/:category`.  
Displays a "quick-repeat" button for the last-used category (`last-category` in localStorage).  
Bottom navigation: Capture (active), Search, Settings.

#### `/capture/:category`

Uses `useCamera` hook to open file input with `capture="environment"` for rear camera.  
Multiple photos can be selected. Each is previewed with a remove button.  
"Extract Text" button runs Tesseract.js OCR on the selected photos via `useOcr`.  
"Upload" button navigates to `/upload` passing photos via `location.state`.

#### `/upload`

Accepts photos from `location.state`.  
Allows editing the document date (YYYYMMDD format, defaults to today).  
Calls `uploadDocPhotos()` from `api.ts` on submit.  
Shows success with Drive links, or error with retry option.  
Displays offline queue count. If offline, offers "Save for Later" which enqueues to IndexedDB.

#### `/search`

Text search input + category filter pills + year dropdown.  
Calls `searchDocs()` from `api.ts` (currently stubbed — returns empty results).  
Results rendered as `DocCard` components with Drive `webViewLink`.

#### `/settings`

- Language toggle (calls `i18n.changeLanguage()` + updates localStorage)
- Google account section: shows profile photo, name, email; sign-out button
- Storage folder picker: `FolderPicker` to change root Drive folder
- Server features toggle: Sheets/OCR server (stub)
- Offline queue: shows pending count, "Upload Now" button to drain queue
- App version

---

## 6. State Management & Storage

The app uses **no centralized state management library** (no Redux, Zustand, or Context API). State lives in three places:

### localStorage (Persistent Config)

| Key | Type | Description |
|---|---|---|
| `doc-vault-onboarded` | `"true"` | Whether onboarding has been completed |
| `doc-vault-google-user` | JSON string | Google user profile + OAuth tokens |
| `doc-vault-root-folder` | JSON string | `{ id: string, name: string }` selected Drive folder |
| `doc-vault-lang` | `"en"` or `"vi"` | UI language preference |
| `doc-vault-sheets-enabled` | `"true"` / `"false"` | Server features toggle |
| `last-category` | string | Last used document category |

### IndexedDB (Offline Queue)

Database: `doc-vault-queue`  
Object store: `pending-uploads`  
Used by `useOfflineQueue` hook. See [Section 7](#7-offline-queue).

### React Component State

Each page manages its own UI state (`useState`) — loading flags, error messages, form inputs, etc. Custom hooks (`useGoogleAuth`, `useOcr`, `useOfflineQueue`, `useCamera`) encapsulate stateful logic and expose clean APIs to pages.

---

## 7. Offline Queue

### How It Works

[`src/hooks/useOfflineQueue.ts`](src/hooks/useOfflineQueue.ts) manages a queue of failed or deferred uploads using **IndexedDB** (via the `idb` library).

When `api.ts` detects the network is unavailable (`navigator.onLine === false`), it enqueues the upload instead of calling the Drive API:

1. Converts `File` objects to **data URLs** (base64 strings) for serialization
2. Stores the data URLs + metadata (category, date, folder ID) to IndexedDB
3. Returns immediately with a "queued offline" result

### Auto-Drain

The hook registers a `window.addEventListener('online', ...)` listener. When the device comes back online:
1. All entries in `pending-uploads` are read
2. Each is converted back from data URL to a `Blob`
3. `uploadDocPhotos()` is called for each entry
4. Successfully uploaded entries are deleted from IndexedDB

### Manual Drain

The Settings screen shows a "Upload Now" button that calls the drain function manually — useful if auto-drain didn't fire or for immediate retry.

### Queue Count

The `queueCount` value from `useOfflineQueue()` is displayed in the Settings screen and the Upload screen so users always know how many documents are pending.

---

## 8. Camera & OCR

### Camera Hook (`useCamera.ts`)

[`src/hooks/useCamera.ts`](src/hooks/useCamera.ts) wraps a hidden `<input type="file" capture="environment" accept="image/*" multiple>` element.

- `openCamera()` — programmatically triggers the file input
- `photos` — array of selected `File` objects
- `removePhoto(index)` — removes a single photo
- `reset()` — clears all selected photos

On Android (Capacitor), the `capture="environment"` attribute opens the rear camera directly. In PWA mode, it opens the file picker.

> **Note**: The app does not use the `@capacitor/camera` plugin for photo capture — it relies on the standard HTML file input approach, which works in both Capacitor and browser contexts.

### OCR Hook (`useOcr.ts`)

[`src/hooks/useOcr.ts`](src/hooks/useOcr.ts) uses **Tesseract.js v7** to run OCR in a Web Worker thread so the UI stays responsive.

```typescript
const { extractText, ocrText, progress, loading, error } = useOcr();

// Extract text from a File object
await extractText(photoFile);
// ocrText now contains the extracted string
// progress goes from 0 to 100 during processing
```

- Supports multiple languages (configured in `useOcr.ts`)
- `progress` (0–100) is displayed as a progress bar in the Capture screen
- `error` contains a human-readable message if OCR fails
- Resets state between calls via `reset()`

The extracted text is displayed to the user in the Capture screen. It is **not** automatically uploaded — it is informational only (for the user to verify document content before uploading).

---

## 9. Internationalization (i18n)

### Setup

[`src/lib/i18n.ts`](src/lib/i18n.ts) initializes i18next with inline translation resources (no external JSON files):

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: { en: { translation: { ... } }, vi: { translation: { ... } } },
  lng: localStorage.getItem('doc-vault-lang') || 'en',
  fallbackLng: 'en',
});
```

### Adding Translations

To add or modify a string, edit the `resources` object in `i18n.ts`. Both `en` and `vi` keys must be updated.

```typescript
// In i18n.ts resources:
en: { translation: { my_new_key: 'My English text' } },
vi: { translation: { my_new_key: 'Văn bản tiếng Việt của tôi' } },
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
// In JSX:
<span>{t('my_new_key')}</span>
```

### Changing Language

```typescript
import i18n from '../lib/i18n';
i18n.changeLanguage('vi');          // Switch to Vietnamese
localStorage.setItem('doc-vault-lang', 'vi');  // Persist the choice
```

---

## 10. Build & Deployment

### Development

```bash
cd mobile
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
```

The Vite dev server proxies `/api/*` to `http://localhost:3001` for backend development.

### Production Build

```bash
npm run build        # Compile TypeScript + bundle with Vite → dist/
```

### Android Build (Capacitor)

```bash
npm run build                   # Build web assets first
npx cap sync android            # Copy dist/ to android/app/src/main/assets/public
npx cap open android            # Open Android Studio
# In Android Studio: Build → Generate Signed APK / Build Bundle
```

### PWA

The app includes `vite-plugin-pwa` for Progressive Web App support. However, the service worker is **disabled when running inside Capacitor** to prevent stale cache issues. It is active only for browser/PWA deployments.

### Environment Notes

- No `.env` file is required — OAuth credentials are hardcoded in `useGoogleAuth.ts`
- The Google OAuth client must have the redirect URI `com.googleusercontent.apps.6665982716-qu3h9qa50liccdnkfl2ipgni9ds8spug:/oauth2redirect` registered in Google Cloud Console under **Authorized redirect URIs** for the Android client type

---

## 11. Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.3.1 | UI framework |
| `react-router-dom` | 6.27.0 | Client-side routing |
| `@capacitor/core` | 8.3.4 | Native mobile bridge |
| `@capacitor/android` | 8.3.4 | Android platform |
| `@capacitor/browser` | 8.0.3 | In-app browser for OAuth |
| `@capacitor/app` | 8.1.0 | App lifecycle + deep link handling |
| `@capacitor/camera` | 8.2.0 | Installed (not used — HTML input used instead) |
| `@capacitor/filesystem` | 8.1.2 | Native filesystem access |
| `tesseract.js` | 7.0.0 | Client-side OCR |
| `idb` | 8.0.0 | IndexedDB wrapper (offline queue) |
| `i18next` | 26.3.0 | Internationalization |
| `react-i18next` | 17.0.8 | React bindings for i18next |
| `tailwindcss` | 3.4.13 | Utility-first CSS |
| `vite` | 5.4.8 | Build tool |
| `vite-plugin-pwa` | 0.20.5 | PWA support |
| `typescript` | 5.6.2 | Type checking |

---

## 12. Architecture Decisions

### Why PKCE instead of a backend auth server?

PKCE eliminates the need for a backend server to hold a client secret. On mobile, the authorization code is exchanged directly with Google using the `code_verifier`, so even if the code is intercepted, it cannot be exchanged without the verifier. This keeps the app fully client-side.

### Why localStorage instead of Capacitor SecureStorage?

The current implementation stores OAuth tokens in `localStorage` for simplicity. For production hardening, tokens (especially `refreshToken`) should be migrated to `@capacitor-community/secure-storage-plugin` or Android Keystore to prevent extraction by other apps on a rooted device.

### Why no Redux/Zustand?

The app's data flows are simple and linear — each screen reads from localStorage and writes back. There is no shared mutable state that needs synchronization across multiple simultaneous components. Local `useState` + `localStorage` is sufficient and reduces bundle size.

### Why IndexedDB for the offline queue instead of localStorage?

Photo files can be several megabytes. `localStorage` has a ~5MB size limit per origin and stores only strings. `IndexedDB` supports binary data and has much larger storage quotas (typically hundreds of MB), making it appropriate for queuing photo uploads.

### Why Tesseract.js (client-side OCR) instead of a server API?

Client-side OCR means the document contents never leave the device before the user explicitly uploads. This is a privacy-friendly default. The Settings screen has a toggle to enable "Server OCR" (a backend endpoint) for higher accuracy, but client-side is the default.

### Why direct Google Drive API instead of a file proxy backend?

Files go directly from the user's device to their own Google Drive account. The app never sees or stores document content. This is both simpler (no file storage infrastructure) and more privacy-preserving.
