# Doc Vault — Mobile PWA (X)

Installable progressive web app for capturing and searching documents.

## Setup

```bash
npm install
npm run dev   # dev server on port 5174 (proxies /api → localhost:3001)
```

Open on mobile browser or Chrome DevTools → Toggle device toolbar.

## User flow

1. **Category Select** `/` — pick document type (Invoice, Contract, Certificate, Gov ID, Receipt, Other)
2. **Capture** `/capture/:category` — take photos with camera or pick from gallery. Multiple photos per document.
3. **Upload** `/upload` — review photos, set document date, upload. If offline: queued to IndexedDB, auto-uploaded on reconnect.
4. **OCR** — after upload, tap "Run OCR Now" or leave it (runs nightly at 2 AM via backend scheduler)
5. **Search** `/search` — full-text search across extracted text, filter by category and year

## PWA install

- Android: Chrome → menu → "Add to Home Screen"
- iOS: Safari → Share → "Add to Home Screen"

## Offline support

Photos captured offline are stored in IndexedDB and auto-uploaded when connectivity returns.
A badge on the Upload page shows the count of queued photos.

## Environment

The Vite dev server proxies `/api/*` → `http://localhost:3001`.
For production, point `VITE_API_BASE` to your backend URL and update `src/lib/api.ts`.
