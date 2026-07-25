// ============================================================
// Client-side media processing utilities
// - Images: resize + compress to base64
// - Videos: validate size, convert to base64 (with size warning)
// ============================================================

const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.82;
const MAX_IMAGE_SIZE_BYTES = 600 * 1024; // 600KB after compression

// Videos can be larger but we still cap to avoid DB bloat
const MAX_VIDEO_SIZE_BYTES = 8 * 1024 * 1024; // 8MB upload limit
const COMPRESSED_VIDEO_SIZE_BYTES = 4 * 1024 * 1024; // warn if > 4MB after

/**
 * Process an image File: resize, compress, and convert to base64 data URL.
 */
export async function processImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (JPEG, PNG, or WebP)");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image is too large. Please use an image under 10MB");
  }

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
    const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = IMAGE_QUALITY;
  let result = canvas.toDataURL("image/jpeg", quality);

  while (result.length > MAX_IMAGE_SIZE_BYTES * 1.37 && quality > 0.3) {
    quality -= 0.1;
    result = canvas.toDataURL("image/jpeg", quality);
  }

  return result;
}

/**
 * Process a video File: validate size, convert to base64 data URL.
 * Videos are NOT compressed (browser can't easily compress video).
 * We just validate size and return the data URL.
 *
 * For large videos, we recommend using a YouTube/Vimeo URL instead.
 */
export async function processVideoFile(file: File): Promise<string> {
  if (!file.type.startsWith("video/")) {
    throw new Error("Please select a video file (MP4, WebM, or MOV)");
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `Video is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
        "Maximum is 8MB. For larger videos, please upload to YouTube/Vimeo and paste the URL."
    );
  }

  const dataUrl = await readFileAsDataURL(file);

  if (dataUrl.length > COMPRESSED_VIDEO_SIZE_BYTES * 1.37) {
    // Warn but allow — it's under the hard limit
    console.warn(
      `[video] Large video (${(dataUrl.length / 1024 / 1024).toFixed(1)}MB base64). ` +
        "Consider using a YouTube/Vimeo URL for better performance."
    );
  }

  return dataUrl;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/**
 * Check if a string is a base64 data URL (vs a regular path/URL)
 */
export function isDataUrl(str: string): boolean {
  return str.startsWith("data:");
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
