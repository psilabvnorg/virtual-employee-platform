import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

export function useOcr() {
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const scan = useCallback(async (file: File) => {
    setScanning(true);
    setProgress(0);
    setError('');
    setText('');

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data } = await worker.recognize(file);
      setText(data.text.trim());
      await worker.terminate();
    } catch (err) {
      setError(`OCR failed: ${String(err)}`);
    } finally {
      setScanning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setText('');
    setProgress(0);
    setError('');
  }, []);

  return { scan, reset, text, progress, scanning, error };
}
