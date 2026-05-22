import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';
import { DocCategory, DocRecord, UploadResult } from '../../types';
import { IStorageAdapter, UploadOptions } from './IStorageAdapter';

function buildFolderPath(category: string, docDate: string): string[] {
  const year = docDate.slice(0, 4);
  const month = docDate.slice(4, 6);
  return [category, year, month];
}

function buildFilename(docDate: string, originalName: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'jpg';
  return `${docDate}_${uuidv4().slice(0, 8)}.${ext}`;
}

function getDriveClient(userToken?: string) {
  if (userToken) {
    // Use the user's OAuth token — files land in their own Drive
    const oauth2 = new OAuth2Client();
    oauth2.setCredentials({ access_token: userToken });
    return google.drive({ version: 'v3', auth: oauth2 });
  }
  // Fall back to service account
  const auth = new google.auth.GoogleAuth({
    credentials: config.googleServiceAccount,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

async function getOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string,
): Promise<string> {
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });
  return created.data.id!;
}

export class GoogleDriveAdapter implements IStorageAdapter {
  async upload(opts: UploadOptions): Promise<UploadResult> {
    const drive = getDriveClient(opts.userToken);
    const rootFolderId = opts.rootFolderId || config.driveRootFolderId;

    const segments = buildFolderPath(opts.category, opts.docDate);
    let parentId = rootFolderId;
    for (const seg of segments) {
      parentId = await getOrCreateFolder(drive, seg, parentId);
    }

    const filename = buildFilename(opts.docDate, opts.originalName);
    const stream = Readable.from(opts.buffer);

    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [parentId],
      },
      media: {
        mimeType: opts.mimeType,
        body: stream,
      },
      fields: 'id,webViewLink',
    });

    await drive.permissions.create({
      fileId: res.data.id!,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const path = `${segments.join('/')}/${filename}`;
    return {
      fileId: res.data.id!,
      url: res.data.webViewLink ?? '',
      path,
    };
  }

  async list(_category?: DocCategory, _year?: string, _month?: string): Promise<DocRecord[]> {
    return [];
  }
}
