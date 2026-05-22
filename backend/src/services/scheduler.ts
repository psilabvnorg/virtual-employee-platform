import cron from 'node-cron';
import { getFileIdsWithNoOcr, getAllRows, updateOcrColumns } from './sheets';
import { runOcr } from './ocr';
import { getEmployee } from '../employees/registry';
import { ProcessResult } from '../employees/base/BaseEmployee';
import { EmployeeRecord } from '../employees/base/BaseRouter';

async function runNightlyOcrBatch(): Promise<void> {
  console.log('[scheduler] Starting nightly OCR batch...');
  const fileIds = await getFileIdsWithNoOcr();
  if (fileIds.length === 0) {
    console.log('[scheduler] No files pending OCR.');
    return;
  }

  const allRows = await getAllRows();
  const docMap = Object.fromEntries(
    allRows.map((r) => [r['fileId'], { driveUrl: r['driveUrl'], category: r['category'] }])
  );

  let processed = 0;
  for (const fileId of fileIds) {
    const doc = docMap[fileId];
    if (!doc) continue;
    try {
      const result = await runOcr(fileId, doc.driveUrl);
      await updateOcrColumns(fileId, result.text, result.confidence);
      processed++;
      console.log(`[scheduler] OCR done: ${fileId}`);

      // Hand off to the accounting employee for LLM processing
      const accounting = getEmployee('accounting');
      if (accounting && result.text) {
        try {
          const category = (doc.category as string) ?? 'other';
          const processResult = await accounting.process(result.text, category);
          console.log(`[scheduler] LLM processed: ${fileId} (confidence: ${processResult.confidence})`);
          // Record is saved by AccountingEmployee internally via processResult —
          // use the /process endpoint pattern via the router's record store instead:
          await saveAccountingRecord(fileId, doc.driveUrl, category, result.text, processResult);
        } catch (llmErr) {
          console.error(`[scheduler] LLM processing failed for ${fileId}:`, llmErr);
        }
      }
    } catch (err) {
      console.error(`[scheduler] OCR failed for ${fileId}:`, err);
    }
  }
  console.log(`[scheduler] Nightly batch complete. Processed: ${processed}/${fileIds.length}`);
}

async function saveAccountingRecord(
  fileId: string,
  driveUrl: string,
  category: string,
  ocrText: string,
  result: ProcessResult | null,
): Promise<void> {
  if (!result) return;
  const { JsonStore } = await import('./store/JsonStore');
  const { v4: uuid } = await import('uuid');
  const path = await import('path');
  const recordsPath = path.join(__dirname, '../../data/employees/accounting/records.json');
  const store = new JsonStore<EmployeeRecord>(recordsPath);
  store.add({
    id: uuid(),
    fileId,
    driveUrl,
    category,
    ocrText,
    normalizedJson: result.normalizedJson,
    suggestions: result.suggestions,
    confidence: result.confidence,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
}

export function startScheduler(): void {
  cron.schedule('0 2 * * *', () => {
    runNightlyOcrBatch().catch((err) => console.error('[scheduler] Batch error:', err));
  });
  console.log('[scheduler] Nightly OCR batch scheduled at 02:00');
}

export { runNightlyOcrBatch };
