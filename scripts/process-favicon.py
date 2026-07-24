#!/usr/bin/env python3
"""
Process the Tikocraft logo image:
1. Remove white background → transparent PNG
2. Generate favicon sizes (16, 32, 48, 180, 512)
3. Update logo variants for navbar/footer

Uses the Tikocraft logo file as the source.
"""
from PIL import Image
import os

# Use the Tikocraft logo as the source (it's the actual brand mark)
SRC = "/home/z/my-project/upload/Tikocraft_simple_brown_logo_white_background_with__delpmaspu (1).png"
OUT_DIR = "/home/z/my-project/public"
IMG_DIR = "/home/z/my-project/public/images"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

# Open and convert to RGBA
img = Image.open(SRC).convert("RGBA")
w, h = img.size
print(f"Original size: {w}x{h}, mode: {img.mode}")

pixels = img.load()

# ============================================================
# Remove white background — two-pass for clean anti-aliased edges
# ============================================================
WHITE_THRESHOLD = 235

def luminance(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
        lum = luminance(r, g, b)
        if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
            # Fully white → fully transparent
            pixels[x, y] = (r, g, b, 0)
        elif lum >= 230:
            # Near-white (anti-aliased edge) → partial transparency
            distance_from_white = 255 - max(r, g, b)
            new_alpha = min(255, distance_from_white * 6)
            if new_alpha < 25:
                new_alpha = 0
            pixels[x, y] = (r, g, b, new_alpha)

# Crop tightly to the non-transparent content
bbox = img.getbbox()
if bbox:
    print(f"Cropping to bbox: {bbox}")
    img = img.crop(bbox)
else:
    print("No bbox found, keeping full image")

print(f"After crop: {img.size}")

# ============================================================
# Create a square version (padded with transparent) for favicons
# Favicons look best when square
# ============================================================
max_dim = max(img.width, img.height)
square = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
offset = ((max_dim - img.width) // 2, (max_dim - img.height) // 2)
square.paste(img, offset, img)

# ============================================================
# Generate favicon files
# ============================================================

# favicon.ico (multi-size: 16, 32, 48)
ico_path = os.path.join(OUT_DIR, "favicon.ico")
square.resize((48, 48), Image.LANCZOS).save(
    ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)]
)
print(f"Saved favicon.ico ({os.path.getsize(ico_path)//1024} KB)")

# favicon-32x32.png
fav32 = square.resize((32, 32), Image.LANCZOS)
fav32_path = os.path.join(OUT_DIR, "favicon-32x32.png")
fav32.save(fav32_path, "PNG", optimize=True)
print(f"Saved favicon-32x32.png ({os.path.getsize(fav32_path)} bytes)")

# favicon-16x16.png
fav16 = square.resize((16, 16), Image.LANCZOS)
fav16_path = os.path.join(OUT_DIR, "favicon-16x16.png")
fav16.save(fav16_path, "PNG", optimize=True)
print(f"Saved favicon-16x16.png ({os.path.getsize(fav16_path)} bytes)")

# apple-touch-icon.png (180x180 — for iOS home screen)
apple = square.resize((180, 180), Image.LANCZOS)
apple_path = os.path.join(OUT_DIR, "apple-touch-icon.png")
apple.save(apple_path, "PNG", optimize=True)
print(f"Saved apple-touch-icon.png ({os.path.getsize(apple_path)//1024} KB)")

# android-chrome-512x512.png (for Android home screen / PWA)
android = square.resize((512, 512), Image.LANCZOS)
android_path = os.path.join(OUT_DIR, "android-chrome-512x512.png")
android.save(android_path, "PNG", optimize=True)
print(f"Saved android-chrome-512x512.png ({os.path.getsize(android_path)//1024} KB)")

# logo-mark.png (256x256 — square logo for general use)
logo_mark = square.resize((256, 256), Image.LANCZOS)
logo_mark_path = os.path.join(IMG_DIR, "logo-mark.png")
logo_mark.save(logo_mark_path, "PNG", optimize=True)
print(f"Saved logo-mark.png ({os.path.getsize(logo_mark_path)//1024} KB)")

# ============================================================
# Update logo variants (for navbar/footer)
# ============================================================

# logo.png (web — max width 600px)
max_w = 600
if img.width > max_w:
    ratio = max_w / img.width
    img_web = img.resize((max_w, int(img.height * ratio)), Image.LANCZOS)
else:
    img_web = img
img_web.save(os.path.join(IMG_DIR, "logo.png"), "PNG", optimize=True)
print(f"Updated logo.png ({img_web.size})")

# logo-nav.png (navbar — max height 80px)
max_h_nav = 80
if img.height > max_h_nav:
    ratio = max_h_nav / img.height
    img_nav = img.resize((int(img.width * ratio), max_h_nav), Image.LANCZOS)
else:
    img_nav = img
img_nav.save(os.path.join(IMG_DIR, "logo-nav.png"), "PNG", optimize=True)
print(f"Updated logo-nav.png ({img_nav.size})")

# logo-cream.png (cream-tinted for dark backgrounds — footer, dark sections)
img_light = img.copy()
light_pixels = img_light.load()
CREAM = (250, 246, 240)
for y in range(img_light.height):
    for x in range(img_light.width):
        r, g, b, a = light_pixels[x, y]
        if a > 0:
            light_pixels[x, y] = (CREAM[0], CREAM[1], CREAM[2], a)

max_h_light = 100
if img_light.height > max_h_light:
    ratio = max_h_light / img_light.height
    img_light_resized = img_light.resize((int(img_light.width * ratio), max_h_light), Image.LANCZOS)
else:
    img_light_resized = img_light
img_light_resized.save(os.path.join(IMG_DIR, "logo-cream.png"), "PNG", optimize=True)
print(f"Updated logo-cream.png ({img_light_resized.size})")

# logo-full.png (backup — full resolution transparent)
img.save(os.path.join(IMG_DIR, "logo-full.png"), "PNG", optimize=True)
print(f"Updated logo-full.png ({img.size})")

print("\n=== Favicon + logo processing complete ===")
print("All favicons are transparent (no white background).")
