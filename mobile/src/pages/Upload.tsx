import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DocCategory, uploadDocPhotos, triggerOcr, UploadResult } from '../lib/api';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { PhotoGrid } from '../components/PhotoGrid';

interface LocationState {
  category: DocCategory;
  photos: File[];
}

type Stage = 'review' | 'uploading' | 'done' | 'error';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

export default function Upload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, photos } = (location.state ?? {}) as Partial<LocationState>;
  const [docDate, setDocDate] = useState(todayIso());
  const [stage, setStage] = useState<Stage>('review');
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [ocrTriggered, setOcrTriggered] = useState(false);
  const { enqueue, queueCount } = useOfflineQueue();

  if (!category || !photos) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center">
        <button onClick={() => navigate('/')} className="text-accent">
          ← Back to start
        </button>
      </div>
    );
  }

  async function handleUpload() {
    setStage('uploading');
    setProgress(0);

    if (!navigator.onLine) {
      await enqueue(category!, docDate, photos!);
      setStage('done');
      return;
    }

    try {
      const result = await uploadDocPhotos(category!, photos!, docDate);
      const ids = result.uploaded.filter((r) => r.fileId).map((r) => r.fileId);
      setUploadedIds(ids);
      setProgress(100);
      setStage('done');
    } catch (err) {
      setError(String(err));
      setStage('error');
    }
  }

  async function handleOcr() {
    if (uploadedIds.length === 0) return;
    try {
      await triggerOcr(uploadedIds);
      setOcrTriggered(true);
    } catch (err) {
      alert(`OCR trigger failed: ${err}`);
    }
  }

  if (stage === 'uploading') {
    return (
      <div className="min-h-dvh bg-ink flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-medium">Uploading {photos.length} photo{photos.length > 1 ? 's' : ''}…</p>
      </div>
    );
  }

  if (stage === 'done') {
    const wasQueued = !navigator.onLine || uploadedIds.length === 0;
    return (
      <div className="min-h-dvh bg-ink flex flex-col safe-top">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
          <span className="text-6xl">{wasQueued ? '📦' : '✅'}</span>
          <h2 className="text-2xl font-bold text-white">
            {wasQueued ? 'Queued for upload' : 'Uploaded!'}
          </h2>
          <p className="text-sm text-gray-400">
            {wasQueued
              ? `${photos.length} photo${photos.length > 1 ? 's' : ''} saved offline. Will upload when back online.`
              : `${photos.length} photo${photos.length > 1 ? 's' : ''} uploaded to ${category}.`}
          </p>

          {!wasQueued && !ocrTriggered && (
            <button
              onClick={handleOcr}
              className="w-full max-w-xs bg-accent text-ink font-bold py-4 rounded-2xl text-base active:opacity-80"
            >
              Run OCR Now
            </button>
          )}
          {ocrTriggered && (
            <p className="text-sm text-accent">OCR job started — results will appear in search.</p>
          )}
          {!wasQueued && !ocrTriggered && (
            <p className="text-xs text-gray-600">Or leave it — OCR runs automatically tonight at 2 AM.</p>
          )}
        </div>

        <div className="px-4 pb-8 safe-bottom flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-surface text-white font-semibold py-4 rounded-2xl text-sm"
          >
            New Document
          </button>
          <button
            onClick={() => navigate('/search')}
            className="flex-1 bg-surface text-white font-semibold py-4 rounded-2xl text-sm"
          >
            Search Docs
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-dvh bg-ink flex flex-col items-center justify-center px-6 gap-5 text-center">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-xl font-bold text-white">Upload Failed</h2>
        <p className="text-sm text-gray-400">{error}</p>
        <button
          onClick={() => setStage('review')}
          className="bg-accent text-ink font-bold px-8 py-4 rounded-2xl"
        >
          Try Again
        </button>
        <button
          onClick={() => enqueue(category, docDate, photos).then(() => navigate('/'))}
          className="text-sm text-gray-500 underline underline-offset-2"
        >
          Save offline instead
        </button>
      </div>
    );
  }

  // review stage
  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg">
          ←
        </button>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{category}</p>
          <h1 className="text-xl font-bold text-white">Review & Upload</h1>
        </div>
        {queueCount > 0 && (
          <span className="ml-auto bg-accent text-ink text-xs font-bold px-2 py-0.5 rounded-full">
            {queueCount} queued
          </span>
        )}
      </header>

      <div className="flex-1 px-4 overflow-y-auto">
        <label className="block mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Document Date</span>
          <input
            type="date"
            value={`${docDate.slice(0, 4)}-${docDate.slice(4, 6)}-${docDate.slice(6, 8)}`}
            onChange={(e) => setDocDate(e.target.value.replace(/-/g, ''))}
            className="mt-1 w-full bg-surface text-white rounded-xl px-4 py-3 text-base border border-muted focus:border-accent outline-none"
          />
        </label>

        <p className="text-xs text-gray-500 mb-1">{photos.length} photo{photos.length > 1 ? 's' : ''}</p>
        <PhotoGrid photos={photos} />
      </div>

      <div className="px-4 pb-8 pt-4 safe-bottom">
        <button
          onClick={handleUpload}
          className="w-full bg-accent text-ink font-bold py-4 rounded-2xl text-base active:opacity-80"
        >
          {navigator.onLine ? 'Upload Now' : 'Save Offline (upload later)'}
        </button>
      </div>
    </div>
  );
}
