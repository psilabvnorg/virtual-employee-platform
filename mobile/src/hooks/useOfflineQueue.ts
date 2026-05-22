import { openDB } from 'idb';
import { useEffect, useState, useCallback } from 'react';
import { DocCategory, uploadDocPhotos, UploadResult } from '../lib/api';

interface QueuedUpload {
  id: number;
  category: DocCategory;
  docDate: string;
  photoDataUrls: string[];
  photoNames: string[];
  photoTypes: string[];
}

const DB_NAME = 'doc-vault-queue';
const STORE = 'pending-uploads';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    },
  });
}

async function dataUrlToFile(dataUrl: string, name: string, type: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name, { type });
}

export function useOfflineQueue() {
  const [queueCount, setQueueCount] = useState(0);
  const [draining, setDraining] = useState(false);

  const refreshCount = useCallback(async () => {
    const db = await getDb();
    const count = await db.count(STORE);
    setQueueCount(count);
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const enqueue = useCallback(
    async (category: DocCategory, docDate: string, photos: File[]) => {
      const photoDataUrls: string[] = [];
      const photoNames: string[] = [];
      const photoTypes: string[] = [];

      for (const photo of photos) {
        const dataUrl = await fileToDataUrl(photo);
        photoDataUrls.push(dataUrl);
        photoNames.push(photo.name);
        photoTypes.push(photo.type);
      }

      const db = await getDb();
      await db.add(STORE, { category, docDate, photoDataUrls, photoNames, photoTypes });
      await refreshCount();
    },
    [refreshCount],
  );

  const drainQueue = useCallback(async (): Promise<UploadResult[]> => {
    if (draining) return [];
    setDraining(true);
    const db = await getDb();
    const all: QueuedUpload[] = await db.getAll(STORE);
    const results: UploadResult[] = [];

    for (const item of all) {
      try {
        const files = await Promise.all(
          item.photoDataUrls.map((url, i) => dataUrlToFile(url, item.photoNames[i], item.photoTypes[i])),
        );
        const res = await uploadDocPhotos(item.category, files, item.docDate);
        results.push(...res.uploaded);
        await db.delete(STORE, item.id);
      } catch (err) {
        console.error('[queue] Failed to drain item', item.id, err);
      }
    }

    setDraining(false);
    await refreshCount();
    return results;
  }, [draining, refreshCount]);

  // Auto-drain when coming back online
  useEffect(() => {
    const handle = () => drainQueue().catch(console.error);
    window.addEventListener('online', handle);
    return () => window.removeEventListener('online', handle);
  }, [drainQueue]);

  return { queueCount, enqueue, drainQueue, draining };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
