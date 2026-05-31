import React, { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DocCategory } from '../lib/api';
import { useOcr } from '../hooks/useOcr';
import { LoadingOverlay } from '../components/LoadingOverlay';

async function pickPhoto(source: CameraSource): Promise<{ dataUrl: string; file: File } | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source,
    });
    if (!photo.dataUrl) return null;
    const blob = await (await fetch(photo.dataUrl)).blob();
    const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
    return { dataUrl: photo.dataUrl, file };
  } catch {
    return null;
  }
}

export default function Capture() {
  const { category } = useParams<{ category: DocCategory }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dataUrl, setDataUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [picking, setPicking] = useState(false);
  const { scan, reset, text, progress, scanning, error } = useOcr();

  const handleCapture = useCallback(async (source: CameraSource) => {
    flushSync(() => setPicking(true));
    const result = await pickPhoto(source);
    setPicking(false);
    if (!result) return;
    setDataUrl(result.dataUrl);
    setPhotoFile(result.file);
    reset();
  }, [reset]);

  function handleRetake() {
    setDataUrl('');
    setPhotoFile(null);
    reset();
    handleCapture(CameraSource.Prompt);
  }

  function handleNext() {
    if (!photoFile) return;
    navigate('/upload', { state: { category, photos: [photoFile] } });
  }

  if (picking) return <LoadingOverlay />;

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button type="button" onClick={() => navigate('/')} className="text-gray-400 text-lg leading-none">
          ←
        </button>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{category}</p>
          <h1 className="text-xl font-bold text-white">{photoFile ? t('review') : t('scan_document')}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4">
        {photoFile ? (
          <>
            <img src={dataUrl} alt="Captured document" className="w-full rounded-2xl object-contain max-h-72" />

            <button
              type="button"
              onClick={() => scan(photoFile)}
              disabled={scanning}
              className="mt-4 w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('extracting')} {progress > 0 ? `${progress}%` : ''}
                </>
              ) : t('extract_text')}
            </button>

            {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

            {text && (
              <div className="mt-3 bg-surface rounded-2xl p-4 mb-4">
                <p className="text-xs text-blue-400 uppercase tracking-widest font-mono mb-2">{t('extracted_text')}</p>
                <pre className="text-white text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-52 overflow-y-auto">
                  {text}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center px-4">
            <span className="text-6xl">📄</span>
            <p className="text-gray-400 text-sm">{t('waiting_camera')}</p>
            <button
              type="button"
              onClick={() => handleCapture(CameraSource.Camera)}
              className="w-full bg-accent text-ink font-bold py-5 rounded-2xl text-lg active:opacity-80"
            >
              {t('take_photo')}
            </button>
            <button
              type="button"
              onClick={() => handleCapture(CameraSource.Photos)}
              className="w-full bg-surface text-white font-semibold py-5 rounded-2xl text-lg active:opacity-80 border border-muted"
            >
              {t('choose_gallery')}
            </button>
          </div>
        )}
      </div>

      {photoFile && (
        <div className="px-4 pb-6 pt-3 safe-bottom flex gap-3">
          <button type="button" onClick={handleRetake} className="flex-1 bg-surface text-white font-semibold py-4 rounded-2xl text-sm active:opacity-80">
            {t('retake')}
          </button>
          <button type="button" onClick={handleNext} className="flex-1 bg-accent text-ink font-bold py-4 rounded-2xl text-sm active:opacity-80">
            {t('upload')}
          </button>
        </div>
      )}
    </div>
  );
}
