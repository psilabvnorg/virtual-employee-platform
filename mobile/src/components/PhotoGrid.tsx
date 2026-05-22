import React from 'react';

interface Props {
  photos: File[];
  onRemove?: (index: number) => void;
}

export function PhotoGrid({ photos, onRemove }: Props) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {photos.map((photo, i) => {
        const url = URL.createObjectURL(photo);
        return (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-surface">
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
              onLoad={() => URL.revokeObjectURL(url)}
            />
            {onRemove && (
              <button
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white text-xs font-bold leading-none"
                aria-label="Remove photo"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
