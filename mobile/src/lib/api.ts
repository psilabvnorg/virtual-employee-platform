export type DocCategory = 'invoice' | 'contract' | 'certificate' | 'government-id' | 'receipt' | 'other';

export interface UploadResult {
  fileId: string;
  url: string;
  path: string;
  error?: string;
}

export interface SearchResult {
  fileId: string;
  driveUrl: string;
  category: DocCategory;
  docDate: string;
  uploadedAt: string;
  snippet: string;
  ocrConfidence?: string;
}

async function getStoredAuth(): Promise<{ accessToken: string; folderId: string }> {
  const userRaw   = localStorage.getItem('doc-vault-google-user');
  const folderRaw = localStorage.getItem('doc-vault-root-folder');
  if (!userRaw || !folderRaw) throw new Error('Not signed in or no folder selected');
  const user   = JSON.parse(userRaw)   as { accessToken: string; refreshToken?: string; expiresAt?: number };
  const folder = JSON.parse(folderRaw) as { id: string };
  if (!user.accessToken || !folder.id) throw new Error('Not signed in or no folder selected');

  // Refresh if token expires within the next 5 minutes
  if (user.refreshToken && user.expiresAt && Date.now() > user.expiresAt - 5 * 60 * 1000) {
    try {
      const { refreshAccessToken } = await import('../hooks/useGoogleAuth');
      const { accessToken, expiresAt } = await refreshAccessToken(user.refreshToken);
      const updated = { ...user, accessToken, expiresAt };
      localStorage.setItem('doc-vault-google-user', JSON.stringify(updated));
      return { accessToken, folderId: folder.id };
    } catch {
      throw new Error('Session expired. Please sign in again in Settings.');
    }
  }

  return { accessToken: user.accessToken, folderId: folder.id };
}

export async function uploadDocPhotos(
  category: DocCategory,
  photos: File[],
  docDate?: string,
): Promise<{ uploaded: UploadResult[] }> {
  const auth = await getStoredAuth();

  const { uploadFile, findOrCreateFolder } = await import('./driveApi');

  const categoryFolderId = await findOrCreateFolder(auth.accessToken, category, auth.folderId);
  const date = docDate ?? new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const uploaded: UploadResult[] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const ext   = photo.type === 'image/png' ? 'png' : 'jpg';
    const name  = `${category}_${date}_${Date.now()}_${i + 1}.${ext}`;
    const result = await uploadFile(auth.accessToken, photo, name, categoryFolderId);
    uploaded.push({ fileId: result.id, url: result.webViewLink, path: name });
  }

  return { uploaded };
}

export async function searchDocs(_params: {
  q?: string;
  category?: string;
  year?: string;
  month?: string;
}): Promise<{ total: number; results: SearchResult[] }> {
  return { total: 0, results: [] };
}
