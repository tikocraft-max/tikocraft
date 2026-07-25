// ============================================================
// Client-side image processing utility
// Resizes + compresses uploaded images to a reasonable size
// before converting to base64 data URLs for storage.
// ============================================================

const MAX_WIDTH = 1200; // max width in pixels
const MAX_HEIGHT = 1200; // max height in pixels
const QUALITY = 0.82; // JPEG quality (0-1)
const MAX_FILE_SIZE_BYTES = 600 * 1024; // 600KB max after compression

/**
 * Process an image File: resize, compress, and convert to base64 data URL.
 * Returns a Promise that resolves to the base64 string.
 */
export async function processImageFile(file: File): Promise<string> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (JPEG, PNG, or WebP)");
  }

  // Validate file size (before processing — reject huge files)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image is too large. Please use an image under 10MB");
  }

  // Read the file as a data URL
  const dataUrl = await readFileAsDataURL(file);

  // Load it into an Image element to get dimensions
  const img = await loadImage(dataUrl);

  // Calculate new dimensions (maintain aspect ratio, fit within max bounds)
  let { width, height } = img;
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Draw to canvas at new size
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");

  // Use white background for transparent PNGs (so they don't get black bg)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to JPEG with compression
  let quality = QUALITY;
  let result = canvas.toDataURL("image/jpeg", quality);

  // If still too large, reduce quality iteratively
  while (result.length > MAX_FILE_SIZE_BYTES * 1.37 && quality > 0.3) {
    // 1.37 ≈ base64 overhead factor
    quality -= 0.1;
    result = canvas.toDataURL("image/jpeg", quality);
  }

  return result;
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
