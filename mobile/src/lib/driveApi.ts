const DRIVE_API = 'https://www.googleapis.com/drive/v3';

export interface DriveFolder {
  id: string;
  name: string;
  parentId?: string;
}

export async function listFolders(accessToken: string, parentId = 'root'): Promise<DriveFolder[]> {
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
  );
  const res = await fetch(
    `${DRIVE_API}/files?q=${q}&fields=files(id,name,parents)&orderBy=name&pageSize=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Drive API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.files ?? []).map((f: { id: string; name: string; parents?: string[] }) => ({
    id: f.id,
    name: f.name,
    parentId,
  }));
}

export async function getFolderName(accessToken: string, folderId: string): Promise<string> {
  if (folderId === 'root') return 'My Drive';
  const res = await fetch(`${DRIVE_API}/files/${folderId}?fields=name`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return folderId;
  const data = await res.json();
  return data.name ?? folderId;
}

export async function createFolder(
  accessToken: string,
  name: string,
  parentId: string,
): Promise<DriveFolder> {
  const res = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  if (!res.ok) throw new Error(`Create folder failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return { id: data.id, name: data.name, parentId };
}
