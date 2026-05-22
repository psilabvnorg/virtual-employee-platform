import { Router } from 'express';
import { runOcr } from '../services/ocr';
import { updateOcrColumns, getAllRows } from '../services/sheets';
import { runNightlyOcrBatch } from '../services/scheduler';

const router = Router();

// Manually trigger OCR for specific file IDs
router.post('/trigger', async (req, res) => {
  const { fileIds } = req.body as { fileIds: string[] };
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    res.status(400).json({ error: 'fileIds array required' });
    return;
  }

  const allRows = await getAllRows();
  const urlMap = Object.fromEntries(allRows.map((r) => [r['fileId'], r['driveUrl']]));

  const results: { fileId: string; status: string; error?: string }[] = [];

  for (const fileId of fileIds) {
    const url = urlMap[fileId];
    if (!url) {
      results.push({ fileId, status: 'not_found' });
      continue;
    }
    try {
      const ocrResult = await runOcr(fileId, url);
      await updateOcrColumns(fileId, ocrResult.text, ocrResult.confidence);
      results.push({ fileId, status: 'done' });
    } catch (err) {
      results.push({ fileId, status: 'error', error: String(err) });
    }
  }

  res.json({ results });
});

// Manually trigger the full nightly batch
router.post('/batch', async (_req, res) => {
  res.json({ message: 'Batch OCR started in background' });
  runNightlyOcrBatch().catch((err) => console.error('[ocr/batch] Error:', err));
});

export default router;
