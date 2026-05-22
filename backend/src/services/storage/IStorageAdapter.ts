import { DocCategory, DocRecord, UploadResult } from '../../types';

export interface UploadOptions {
  buffer: Buffer;
  mimeType: string;
  category: DocCategory;
  docDate: string; // YYYYMMDD
  originalName: string;
  // Per-request overrides supplied by the authenticated mobile user
  userToken?: string;    // OAuth access token — use user's Drive instead of service account
  rootFolderId?: string; // User-selected root folder — overrides DRIVE_ROOT_FOLDER_ID
}

export interface IStorageAdapter {
  upload(opts: UploadOptions): Promise<UploadResult>;
  list(category?: DocCategory, year?: string, month?: string): Promise<DocRecord[]>;
}
