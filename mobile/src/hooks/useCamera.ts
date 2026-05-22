import { useRef, useCallback } from 'react';

export function useCamera(onPhoto: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openCamera = useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.setAttribute('capture', 'environment');
    inputRef.current.click();
  }, []);

  const openGallery = useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.removeAttribute('capture');
    inputRef.current.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files).forEach(onPhoto);
      e.target.value = '';
    },
    [onPhoto],
  );

  return { inputRef, openCamera, openGallery, handleChange };
}
