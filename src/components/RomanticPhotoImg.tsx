import React, { useState, useEffect } from 'react';

interface RomanticPhotoImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  photoIndex?: number;
  fallbackSrc?: string;
}

export const RomanticPhotoImg: React.FC<RomanticPhotoImgProps> = ({
  src,
  fallbackSrc,
  photoIndex,
  alt = 'Love Memory',
  className = '',
  loading = 'lazy',
  ...rest
}) => {
  // Compute candidate URLs if photoIndex is present or extractable from src
  const candidates = React.useMemo(() => {
    let index = photoIndex;

    if (index === undefined && typeof src === 'string') {
      const match = src.match(/(\d+)\.(?:jpe?g|png|webp)/i);
      if (match) {
        index = parseInt(match[1], 10);
      }
    }

    if (index !== undefined && index > 0) {
      return [
        // Standard user upload target in assets/images/
        `/assets/images/${index}.jpeg`,
        `/assets/images/${index}.jpg`,
        `/assets/images/${index}.png`,
        `/assets/images/${index}.webp`,
        // Also support filenames with space after period "1. jpeg"
        `/assets/images/${index}. jpeg`,
        `/assets/images/${index}. jpg`,
        // Fallback to provided src or fallbackSrc
        src || '',
        fallbackSrc || '',
      ].filter(Boolean);
    }

    return [src || '', fallbackSrc || ''].filter(Boolean);
  }, [src, fallbackSrc, photoIndex]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [candidates]);

  const handleError = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentSrc = candidates[currentIndex] || fallbackSrc || src || '';

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      {...rest}
    />
  );
};
