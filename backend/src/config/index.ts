export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  storageAdapter: (process.env.STORAGE_ADAPTER ?? 'google-drive') as
    | 'google-drive'
    | 's3'
    | 'sftp'
    | 'azure',
  googleServiceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : null,
  driveRootFolderId: process.env.DRIVE_ROOT_FOLDER_ID ?? '',
  sheetId: process.env.SHEET_ID ?? '',
  ocrApiUrl: process.env.OCR_API_URL ?? '',
  ocrApiKey: process.env.OCR_API_KEY ?? '',
};
