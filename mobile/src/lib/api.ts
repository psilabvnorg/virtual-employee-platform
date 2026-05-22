export const API_BASE = '/api';

export type DocCategory = 'invoice' | 'contract' | 'certificate' | 'government-id' | 'receipt' | 'other';

export interface UploadResult {
  fileId: string;
  url: string;
  path: string;
  error?: string;
  originalName?: string;
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

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const raw = localStorage.getItem('doc-vault-google-user');
    if (raw) {
      const user = JSON.parse(raw) as { accessToken: string };
      if (user.accessToken) headers['X-User-Token'] = user.accessToken;
    }
    const folderRaw = localStorage.getItem('doc-vault-root-folder');
    if (folderRaw) {
      const folder = JSON.parse(folderRaw) as { id: string };
      if (folder.id) headers['X-Root-Folder-Id'] = folder.id;
    }
  } catch {
    // ignore parse errors
  }
  return headers;
}

export async function uploadDocPhotos(
  category: DocCategory,
  photos: File[],
  docDate?: string,
): Promise<{ uploaded: UploadResult[] }> {
  const form = new FormData();
  form.append('category', category);
  if (docDate) form.append('docDate', docDate);
  for (const photo of photos) form.append('photos', photo);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function triggerOcr(fileIds: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/ocr/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ fileIds }),
  });
  if (!res.ok) throw new Error(`OCR trigger failed: ${res.statusText}`);
}

export async function searchDocs(params: {
  q?: string;
  category?: string;
  year?: string;
  month?: string;
}): Promise<{ total: number; results: SearchResult[] }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.category) qs.set('category', params.category);
  if (params.year) qs.set('year', params.year);
  if (params.month) qs.set('month', params.month);

  const res = await fetch(`${API_BASE}/search?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}
