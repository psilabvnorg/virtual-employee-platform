import axios from 'axios';
import { config } from '../config';
import { OcrResult } from '../types';

export async function runOcr(fileId: string, fileUrl: string): Promise<OcrResult> {
  const res = await axios.post(
    config.ocrApiUrl,
    { url: fileUrl },
    {
      headers: {
        Authorization: `Bearer ${config.ocrApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30_000,
    },
  );

  const text: string = res.data?.text ?? res.data?.result ?? JSON.stringify(res.data);
  const confidence: number | undefined = res.data?.confidence;
  return { fileId, text, confidence };
}
