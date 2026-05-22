import { Router } from 'express';
import { getAllRows } from '../services/sheets';

const router = Router();

router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase().trim();
  const category = String(req.query.category ?? '').toLowerCase().trim();
  const year = String(req.query.year ?? '').trim();
  const month = String(req.query.month ?? '').trim();

  const rows = await getAllRows();

  const filtered = rows.filter((row) => {
    if (category && row['category'] !== category) return false;
    if (year && !row['docDate'].startsWith(year)) return false;
    if (month && row['docDate'].slice(4, 6) !== month.padStart(2, '0')) return false;
    if (q && !row['extractedText'].toLowerCase().includes(q)) return false;
    return true;
  });

  res.json({
    total: filtered.length,
    results: filtered.map((r) => ({
      fileId: r['fileId'],
      driveUrl: r['driveUrl'],
      category: r['category'],
      docDate: r['docDate'],
      uploadedAt: r['uploadedAt'],
      snippet: q
        ? extractSnippet(r['extractedText'], q)
        : r['extractedText'].slice(0, 120),
      ocrConfidence: r['ocrConfidence'],
    })),
  });
});

function extractSnippet(text: string, query: string, radius = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

export default router;
