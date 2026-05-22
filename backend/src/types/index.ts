export type DocCategory =
  | 'invoice'
  | 'contract'
  | 'certificate'
  | 'government-id'
  | 'receipt'
  | 'other';

export interface DocRecord {
  fileId: string;
  driveUrl: string;
  category: DocCategory;
  docDate: string;       // YYYYMMDD
  uploadedAt: string;    // ISO timestamp
  extractedText: string;
  normalizedData: string;
  ocrConfidence?: number;
}

export interface UploadResult {
  fileId: string;
  url: string;
  path: string;
}

export interface OcrResult {
  fileId: string;
  text: string;
  confidence?: number;
}
