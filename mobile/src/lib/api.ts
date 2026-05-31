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

function getStoredAuth(): { accessToken: string; folderId: string } | null {
  try {
    const userRaw   = localStorage.getItem('doc-vault-google-user');
    const folderRaw = localStorage.getItem('doc-vault-root-folder');
    if (!userRaw || !folderRaw) return null;
    const user   = JSON.parse(userRaw)   as { accessToken: string };
    const folder = JSON.parse(folderRaw) as { id: string };
    if (!user.accessToken || !folder.id) return null;
    return { accessToken: user.accessToken, folderId: folder.id };
  } catch {
    return null;
  }
}

export async function uploadDocPhotos(
  category: DocCategory,
  photos: File[],
  docDate?: string,
): Promise<{ uploaded: UploadResult[] }> {
  const auth = getStoredAuth();
  if (!auth) throw new Error('Not signed in or no folder selected');

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
