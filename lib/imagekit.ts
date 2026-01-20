/**
 * ImageKit URL transformation utility
 * Use this instead of Next.js Image component for ImageKit images
 */

export interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
  focus?: 'auto' | 'center' | 'top' | 'left' | 'bottom' | 'right' | 'face' | 'faces';
  blur?: number; // 1-100
  sharpen?: number; // 1-100
  contrast?: number; // -100 to 100
  brightness?: number; // -100 to 100
}

/**
 * Transform an ImageKit URL with the given options
 * @param imageUrl - The original ImageKit URL
 * @param options - Transformation options
 * @returns Transformed ImageKit URL
 */
export function transformImageKitUrl(
  imageUrl: string,
  options: ImageKitTransformOptions = {}
): string {
  // If it's not an ImageKit URL, return as-is
  if (!imageUrl || !imageUrl.includes('ik.imagekit.io')) {
    return imageUrl;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop,
    focus = 'auto',
    blur,
    sharpen,
    contrast,
    brightness,
  } = options;

  // Build transformation string
  const transformations: string[] = [];

  if (width) transformations.push(`w-${width}`);
  if (height) transformations.push(`h-${height}`);
  if (crop) {
    const cropMap: Record<string, string> = {
      maintain_ratio: 'c-maintain_ratio',
      force: 'c-force',
      at_least: 'c-at_least',
      at_max: 'c-at_max',
    };
    transformations.push(cropMap[crop] || 'c-maintain_ratio');
  } else if (width && height) {
    // Default to maintain_ratio when both width and height are specified
    transformations.push('c-maintain_ratio');
  }
  if (quality !== 'auto') transformations.push(`q-${quality}`);
  if (format !== 'auto') transformations.push(`f-${format}`);
  if (focus !== 'auto') transformations.push(`fo-${focus}`);
  if (blur) transformations.push(`bl-${blur}`);
  if (sharpen) transformations.push(`sh-${sharpen}`);
  if (contrast) transformations.push(`e-contrast-${contrast}`);
  if (brightness) transformations.push(`e-brightness-${brightness}`);

  // If no transformations, return original URL
  if (transformations.length === 0) {
    return imageUrl;
  }

  // Add transformation to URL
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}tr=${transformations.join(',')}`;
}

/**
 * Get responsive image URLs for different screen sizes
 * @param imageUrl - The original ImageKit URL
 * @param sizes - Array of width sizes
 * @returns Object with srcSet and sizes attributes
 */
export function getResponsiveImageKitUrl(
  imageUrl: string,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
): { srcSet: string; sizes: string } {
  const srcSet = sizes
    .map((width) => {
      const transformedUrl = transformImageKitUrl(imageUrl, {
        width,
        quality: 'auto',
        format: 'auto',
        crop: 'maintain_ratio',
      });
      return `${transformedUrl} ${width}w`;
    })
    .join(', ');

  return {
    srcSet,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };
}

/**
 * Get optimized image URL for a specific use case
 * Optimized for cost-effectiveness and performance:
 * - Uses 16:9 aspect ratio (standard for listings)
 * - Quality optimized per use case
 * - Format auto (WebP/AVIF when supported)
 * - Maintains aspect ratio to avoid distortion
 */
export const imageKitPresets = {
  // Thumbnail: Small, fast loading (4:3 ratio for better preview)
  thumbnail: (url: string) =>
    transformImageKitUrl(url, {
      width: 300,
      height: 225, // 4:3 ratio
      quality: 75, // Lower quality for thumbnails
      format: 'auto',
      crop: 'maintain_ratio',
    }),
  // Card: Listing cards in lists (16:9 ratio)
  card: (url: string) =>
    transformImageKitUrl(url, {
      width: 640,
      height: 360, // 16:9 ratio
      quality: 80, // Balanced quality/size
      format: 'auto',
      crop: 'maintain_ratio',
    }),
  // Gallery: Main image in listing details (16:9 ratio)
  gallery: (url: string) =>
    transformImageKitUrl(url, {
      width: 1280,
      height: 720, // 16:9 ratio
      quality: 85, // Good quality for detail view
      format: 'auto',
      crop: 'maintain_ratio',
    }),
  // Lightbox: Full screen view (16:9 ratio, max 1920px)
  lightbox: (url: string) =>
    transformImageKitUrl(url, {
      width: 1920,
      height: 1080, // 16:9 ratio
      quality: 90, // High quality for zoom
      format: 'auto',
      crop: 'maintain_ratio',
    }),
};

































