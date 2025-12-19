'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { imageKitPresets, transformImageKitUrl } from '@/lib/imagekit';

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export function ImageGallery({ images, title = 'Listing' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const originalImage = images[selectedIndex] || '/placeholder-room.jpg';
  const currentImage = originalImage.includes('ik.imagekit.io')
    ? imageKitPresets.gallery(originalImage)
    : originalImage;
  const lightboxImage = originalImage.includes('ik.imagekit.io')
    ? imageKitPresets.lightbox(originalImage)
    : originalImage;
  const hasMultipleImages = images.length > 1;

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedIndex, images.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultipleImages) {
      goToNext();
    }
    if (isRightSwipe && hasMultipleImages) {
      goToPrevious();
    }
  };

  // Click outside to close lightbox
  const handleLightboxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === lightboxRef.current) {
      setIsLightboxOpen(false);
      setIsZoomed(false);
    }
  };

  if (images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-grey-100 to-grey-200 flex items-center justify-center">
        <div className="text-center text-grey-400">
          <Grid3x3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="relative w-full">
        {/* Main Image Display */}
        <div
          className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] bg-grey-100 cursor-pointer group overflow-hidden"
          onClick={() => setIsLightboxOpen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="button"
          tabIndex={0}
          aria-label="Open image gallery in full screen"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsLightboxOpen(true);
            }
          }}
        >
          <img
            src={currentImage}
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay with controls hint */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-3 text-white">
              <Maximize2 className="w-6 h-6" />
              <span className="font-semibold text-lg">Click to view full screen</span>
            </div>
          </div>

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
              {selectedIndex + 1} / {images.length}
            </div>
          )}

          {/* Navigation Arrows (Desktop) */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-large opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-grey-900" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-large opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-grey-900" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {hasMultipleImages && images.length > 1 && (
          <div className="w-full bg-white p-4 border-t border-grey-200">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'relative flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border-2 transition-all duration-200',
                    selectedIndex === index
                      ? 'border-primary-500 shadow-medium scale-105'
                      : 'border-grey-200 hover:border-primary-300 hover:scale-105'
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image.includes('ik.imagekit.io') ? imageKitPresets.thumbnail(image) : image}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedIndex === index && (
                    <div className="absolute inset-0 bg-primary-500/20 border-2 border-primary-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleLightboxClick}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setIsLightboxOpen(false);
              setIsZoomed(false);
            }}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full text-white transition-all duration-200 hover:scale-110"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Image Container */}
          <div
            ref={imageRef}
            className={cn(
              'relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center transition-transform duration-300',
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={cn(
                'relative w-full h-full transition-transform duration-300',
                isZoomed ? 'scale-150' : 'scale-100'
              )}
            >
              <img
                src={lightboxImage}
                alt={`${title} - Image ${selectedIndex + 1} (full screen)`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Zoom Indicator */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
              {isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
              <ZoomIn className="w-4 h-4 inline-block ml-2" />
            </div>
          </div>

          {/* Navigation Controls */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-full text-white transition-all duration-200 hover:scale-110 z-50"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-full text-white transition-all duration-200 hover:scale-110 z-50"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full text-white text-base font-semibold">
                {selectedIndex + 1} of {images.length}
              </div>

              {/* Thumbnail Navigation (Bottom) */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(index);
                        setIsZoomed(false);
                      }}
                      className={cn(
                        'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                        selectedIndex === index
                          ? 'border-white scale-110'
                          : 'border-white/50 hover:border-white/80 hover:scale-105'
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <img
                        src={image.includes('ik.imagekit.io') ? imageKitPresets.thumbnail(image) : image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
