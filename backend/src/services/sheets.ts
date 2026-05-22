import { google } from 'googleapis';
import { config } from '../config';
import { DocRecord } from '../types';

const HEADER = ['fileId', 'driveUrl', 'category', 'docDate', 'uploadedAt', 'extractedText', 'normalizedData', 'ocrConfidence'];
const SHEET_NAME = 'docs';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: config.googleServiceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function appendDocRecord(record: Partial<DocRecord> & { fileId: string }): Promise<void> {
  const sheets = getSheets();
  const row = [
    record.fileId,
    record.driveUrl ?? '',
    record.category ?? '',
    record.docDate ?? '',
    record.uploadedAt ?? new Date().toISOString(),
    record.extractedText ?? '',
    record.normalizedData ?? '',
    record.ocrConfidence != null ? String(record.ocrConfidence) : '',
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.sheetId,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

export async function updateOcrColumns(fileId: string, extractedText: string, confidence?: number): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${SHEET_NAME}!A:A`,
  });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === fileId);
  if (rowIndex === -1) return;

  // Columns: extractedText=F (col 6), normalizedData=G (col 7), ocrConfidence=H (col 8)
  const targetRow = rowIndex + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.sheetId,
    range: `${SHEET_NAME}!F${targetRow}:H${targetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[extractedText, '', confidence != null ? String(confidence) : '']],
    },
  });
}

export async function getAllRows(): Promise<Record<string, string>[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${SHEET_NAME}!A:H`,
  });
  const [header, ...rows] = res.data.values ?? [];
  if (!header) return [];
  const keys = (header as string[]).length > 0 ? (header as string[]) : HEADER;
  return rows.map((row) => {
    const obj: Record<string, string> = {};
    keys.forEach((k, i) => {
      obj[k] = (row as string[])[i] ?? '';
    });
    return obj;
  });
}

export async function getFileIdsWithNoOcr(): Promise<string[]> {
  const rows = await getAllRows();
  return rows.filter((r) => !r['extractedText']).map((r) => r['fileId']);
}
