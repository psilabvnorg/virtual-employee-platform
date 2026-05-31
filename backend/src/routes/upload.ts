import { Router } from 'express';
import multer from 'multer';
import { getStorageAdapter } from '../services/storage';
import { appendDocRecord } from '../services/sheets';
import { DocCategory } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const VALID_CATEGORIES: DocCategory[] = ['invoice', 'contract', 'certificate', 'government-id', 'receipt', 'other'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

router.post('/', upload.array('photos', 20), async (req, res) => {
  const category = req.body.category as DocCategory;
  const docDate: string = req.body.docDate ?? todayIso();
  const files = req.files as Express.Multer.File[];

  // User-supplied overrides from the mobile app Settings
  const userToken = (req.headers['x-user-token'] as string) || undefined;
  const rootFolderId = (req.headers['x-root-folder-id'] as string) || undefined;
  const skipSheets = req.headers['x-skip-sheets'] === '1';

  if (!VALID_CATEGORIES.includes(category)) {
    res.status(400).json({ error: `Invalid category. Valid: ${VALID_CATEGORIES.join(', ')}` });
    return;
  }
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const adapter = getStorageAdapter();
  const results = [];

  for (const file of files) {
    try {
      const result = await adapter.upload({
        buffer: file.buffer,
        mimeType: file.mimetype,
        category,
        docDate,
        originalName: file.originalname,
        userToken,
        rootFolderId,
      });

      if (!skipSheets) {
        await appendDocRecord({
          fileId: result.fileId,
          driveUrl: result.url,
          category,
          docDate,
          uploadedAt: new Date().toISOString(),
        });
      }

      results.push(result);
    } catch (err) {
      console.error('Upload failed for file:', file.originalname, err);
      results.push({ error: String(err), originalName: file.originalname });
    }
  }

  res.json({ uploaded: results });
});

export default router;
