# Doc Vault — Backend Service (Y)

Node.js/Express backend for document capture, OCR, and search.

## Setup

```bash
cp .env.example .env
# Fill in: GOOGLE_SERVICE_ACCOUNT_JSON, DRIVE_ROOT_FOLDER_ID, SHEET_ID, OCR_API_URL, OCR_API_KEY
npm install
npm run dev   # dev server on port 3001
```

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Upload photos (`multipart/form-data`: `category`, `photos[]`, `docDate`) |
| POST | `/ocr/trigger` | Trigger OCR for specific files (`{ fileIds: string[] }`) |
| POST | `/ocr/batch` | Manually run nightly batch OCR |
| GET | `/search` | Search docs (`?q=&category=&year=&month=`) |
| GET | `/health` | Health check |

## Google Drive folder structure

```
ROOT_FOLDER/
└── {category}/
    └── {YYYY}/
        └── {MM}/
            └── {YYYYMMDD}_{uuid}.jpg
```

## Google Sheet columns

`fileId | driveUrl | category | docDate | uploadedAt | extractedText | normalizedData | ocrConfidence`

## Storage adapters

Set `STORAGE_ADAPTER` env var to switch backends:
- `google-drive` (active)
- `s3` (stub — implement `S3Adapter.ts`)
- `sftp` (stub — implement `SFTPAdapter.ts`)
- `azure` (stub — implement `AzureBlobAdapter.ts`)

## Normalization

`src/services/normalize.ts` contains per-category prompt templates with `{{raw_text}}` placeholder.
Wire up an LLM call in `normalize()` to enable structured extraction.

## Nightly OCR batch

Cron runs at 2:00 AM. All files with no `extractedText` in the sheet are processed.
Trigger manually: `POST /ocr/batch`
