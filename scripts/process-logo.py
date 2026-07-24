#!/usr/bin/env python3
"""
Remove white background from the Tikocraft logo and produce a clean
transparent PNG optimized for web use.
"""
from PIL import Image
import os

SRC = "/home/z/my-project/upload/Tikocraft_simple_brown_logo_white_background_with__delpmaspu (1).png"
OUT_DIR = "/home/z/my-project/public/images"
os.makedirs(OUT_DIR, exist_ok=True)

# Open with convert to handle JPEG-in-PNG-extension case
img = Image.open(SRC).convert("RGBA")
w, h = img.size
print(f"Original size: {w}x{h}, mode: {img.mode}")

pixels = img.load()

# Detect the white background — sample corners to find threshold
# White is (255, 255, 255). We treat anything very close to white as background.
# Use a luminance threshold with tolerance so anti-aliased edges soften naturally.
WHITE_THRESHOLD = 235  # any pixel where R, G, B all >= this is "white-ish"

# Two-pass approach for clean edges:
# Pass 1 — fully white pixels become 100% transparent
# Pass 2 — near-white (anti-aliased) pixels get alpha proportional to how non-white they are

def luminance(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # Skip already-transparent pixels
        if a == 0:
            continue
        lum = luminance(r, g, b)
        if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
            # Fully white → fully transparent
            pixels[x, y] = (r, g, b, 0)
        elif lum >= 230:
            # Near-white (anti-aliased edge) — partial transparency
            # The closer to pure white, the more transparent
            distance_from_white = 255 - max(r, g, b)
            new_alpha = min(255, distance_from_white * 6)
            if new_alpha < 25:
                new_alpha = 0
            pixels[x, y] = (r, g, b, new_alpha)

# Save full-res transparent PNG (backup)
full_out = os.path.join(OUT_DIR, "logo-full.png")
img.save(full_out, "PNG", optimize=True)
print(f"Saved full-res: {full_out} ({os.path.getsize(full_out)//1024} KB)")

# Find the non-transparent bounding box and crop tightly
bbox = img.getbbox()
if bbox:
    print(f"Cropping to bbox: {bbox}")
    img_cropped = img.crop(bbox)
else:
    img_cropped = img

# Save main web logo (max width 600px, keep aspect)
max_w = 600
if img_cropped.width > max_w:
    ratio = max_w / img_cropped.width
    new_size = (max_w, int(img_cropped.height * ratio))
    img_web = img_cropped.resize(new_size, Image.LANCZOS)
else:
    img_web = img_cropped

web_out = os.path.join(OUT_DIR, "logo.png")
img_web.save(web_out, "PNG", optimize=True)
print(f"Saved web logo: {web_out} ({os.path.getsize(web_out)//1024} KB, {img_web.width}x{img_web.height})")

# Also save a smaller version for navbar (max height 80px)
max_h_nav = 80
if img_cropped.height > max_h_nav:
    ratio = max_h_nav / img_cropped.height
    new_size = (int(img_cropped.width * ratio), max_h_nav)
    img_nav = img_cropped.resize(new_size, Image.LANCZOS)
else:
    img_nav = img_cropped

nav_out = os.path.join(OUT_DIR, "logo-nav.png")
img_nav.save(nav_out, "PNG", optimize=True)
print(f"Saved nav logo: {nav_out} ({os.path.getsize(nav_out)//1024} KB, {img_nav.width}x{img_nav.height})")

# Also a white/cream-tinted version for dark backgrounds (footer/contact sections)
# Create a cream-tinted version by replacing dark pixels with cream color
img_light = img_cropped.copy()
light_pixels = img_light.load()
CREAM = (250, 246, 240)  # #FAF6F0
for y in range(img_light.height):
    for x in range(img_light.width):
        r, g, b, a = light_pixels[x, y]
        if a > 0:
            # Replace with cream, keep original alpha
            light_pixels[x, y] = (CREAM[0], CREAM[1], CREAM[2], a)

max_h_light = 100
if img_light.height > max_h_light:
    ratio = max_h_light / img_light.height
    new_size = (int(img_light.width * ratio), max_h_light)
    img_light_resized = img_light.resize(new_size, Image.LANCZOS)
else:
    img_light_resized = img_light

light_out = os.path.join(OUT_DIR, "logo-cream.png")
img_light_resized.save(light_out, "PNG", optimize=True)
print(f"Saved cream-tinted logo: {light_out} ({os.path.getsize(light_out)//1024} KB, {img_light_resized.width}x{img_light_resized.height})")

print("=== Logo processing complete ===")
