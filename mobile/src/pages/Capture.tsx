import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocCategory } from '../lib/api';
import { useCamera } from '../hooks/useCamera';
import { PhotoGrid } from '../components/PhotoGrid';

export default function Capture() {
  const { category } = useParams<{ category: DocCategory }>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);

  const addPhoto = useCallback((file: File) => {
    setPhotos((prev) => [...prev, file]);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const { inputRef, openCamera, openGallery, handleChange } = useCamera(addPhoto);

  function handleNext() {
    if (photos.length === 0) return;
    navigate('/upload', { state: { category, photos } });
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col safe-top">
      <header className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button onClick={() => navigate('/')} className="text-gray-400 text-lg leading-none">
          ←
        </button>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{category}</p>
          <h1 className="text-xl font-bold text-white">Add Photos</h1>
        </div>
      </header>

      <div className="flex-1 px-4 overflow-y-auto">
        <div className="flex gap-3">
          <button
            onClick={openCamera}
            className="flex-1 bg-accent text-ink font-semibold py-4 rounded-2xl text-sm active:opacity-80 transition-opacity"
          >
            📷 Camera
          </button>
          <button
            onClick={openGallery}
            className="flex-1 bg-surface text-white font-semibold py-4 rounded-2xl text-sm active:opacity-80 transition-opacity"
          >
            🖼 Gallery
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />

        {photos.length > 0 ? (
          <>
            <p className="text-xs text-gray-500 mt-4 mb-1">{photos.length} photo{photos.length > 1 ? 's' : ''} added</p>
            <PhotoGrid photos={photos} onRemove={removePhoto} />
          </>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center gap-3 text-gray-600">
            <span className="text-5xl">📄</span>
            <p className="text-sm">Take or pick photos of your document.<br />Multiple pages supported.</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-4 safe-bottom">
        <button
          onClick={handleNext}
          disabled={photos.length === 0}
          className="w-full bg-accent text-ink font-bold py-4 rounded-2xl text-base disabled:opacity-30 active:opacity-80 transition-opacity"
        >
          Next: Review & Upload ({photos.length})
        </button>
      </div>
    </div>
  );
}
