#!/usr/bin/env python3
"""
Process the uploaded image:
1. Remove white background → transparent PNG
2. Generate favicon sizes (16x16, 32x32, 180x180, 512x512)
3. Update the logo files to use the new transparent version
"""
from PIL import Image
import os

SRC = "/home/z/my-project/upload/Make_him_bigger_than_t_4k_delpmaspu.png"
OUT_DIR = "/home/z/my-project/public"
IMG_DIR = "/home/z/my-project/public/images"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

# Open and convert to RGBA
img = Image.open(SRC).convert("RGBA")
w, h = img.size
print(f"Original size: {w}x{h}, mode: {img.mode}")

pixels = img.load()

# Remove white background
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
            pixels[x, y] = (r, g, b, 0)
        elif lum >= 230:
            distance_from_white = 255 - max(r, g, b)
            new_alpha = min(255, distance_from_white * 6)
            if new_alpha < 25:
                new_alpha = 0
            pixels[x, y] = (r, g, b, new_alpha)

# Crop to bounding box
bbox = img.getbbox()
if bbox:
    print(f"Cropping to bbox: {bbox}")
    img = img.crop(bbox)
else:
    print("No bbox found, keeping full image")

print(f"After crop: {img.size}")

# ============================================================
# Generate favicons in multiple sizes
# ============================================================

# 1. favicon.ico (multi-size ICO: 16, 32, 48)
# PIL can save .ico with multiple sizes
sizes_ico = [(16, 16), (32, 32), (48, 48)]
img_square = img.copy()
# Make it square by padding with transparent
max_dim = max(img_square.width, img_square.height)
square = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
offset = ((max_dim - img_square.width) // 2, (max_dim - img_square.height) // 2)
square.paste(img_square, offset, img_square)

ico_path = os.path.join(OUT_DIR, "favicon.ico")
square.resize((48, 48), Image.LANCZOS).save(ico_path, format="ICO", sizes=sizes_ico)
print(f"Saved favicon.ico ({os.path.getsize(ico_path)//1024} KB)")

# 2. favicon-32x32.png
fav32 = square.resize((32, 32), Image.LANCZOS)
fav32_path = os.path.join(OUT_DIR, "favicon-32x32.png")
fav32.save(fav32_path, "PNG", optimize=True)
print(f"Saved favicon-32x32.png ({os.path.getsize(fav32_path)//1024} KB)")

# 3. favicon-16x16.png
fav16 = square.resize((16, 16), Image.LANCZOS)
fav16_path = os.path.join(OUT_DIR, "favicon-16x16.png")
fav16.save(fav16_path, "PNG", optimize=True)
print(f"Saved favicon-16x16.png ({os.path.getsize(fav16_path)//1024} KB)")

# 4. apple-touch-icon.png (180x180 for iOS)
apple = square.resize((180, 180), Image.LANCZOS)
apple_path = os.path.join(OUT_DIR, "apple-touch-icon.png")
apple.save(apple_path, "PNG", optimize=True)
print(f"Saved apple-touch-icon.png ({os.path.getsize(apple_path)//1024} KB)")

# 5. android-chrome-512x512.png
android = square.resize((512, 512), Image.LANCZOS)
android_path = os.path.join(OUT_DIR, "android-chrome-512x512.png")
android.save(android_path, "PNG", optimize=True)
print(f"Saved android-chrome-512x512.png ({os.path.getsize(android_path)//1024} KB)")

# 6. Also save a square logo for the site (logo-mark.png) at 256x256
logo_mark = square.resize((256, 256), Image.LANCZOS)
logo_mark_path = os.path.join(IMG_DIR, "logo-mark.png")
logo_mark.save(logo_mark_path, "PNG", optimize=True)
print(f"Saved logo-mark.png ({os.path.getsize(logo_mark_path)//1024} KB)")

# 7. Update web logo variants with the new image (nav, cream-tinted)
# Web logo (max width 600px)
max_w = 600
if img.width > max_w:
    ratio = max_w / img.width
    new_size = (max_w, int(img.height * ratio))
    img_web = img.resize(new_size, Image.LANCZOS)
else:
    img_web = img
img_web.save(os.path.join(IMG_DIR, "logo.png"), "PNG", optimize=True)
print(f"Updated logo.png ({img_web.size})")

# Nav logo (max height 80px)
max_h_nav = 80
if img.height > max_h_nav:
    ratio = max_h_nav / img.height
    new_size = (int(img.width * ratio), max_h_nav)
    img_nav = img.resize(new_size, Image.LANCZOS)
else:
    img_nav = img
img_nav.save(os.path.join(IMG_DIR, "logo-nav.png"), "PNG", optimize=True)
print(f"Updated logo-nav.png ({img_nav.size})")

# Cream-tinted version for dark backgrounds
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
    new_size = (int(img_light.width * ratio), max_h_light)
    img_light_resized = img_light.resize(new_size, Image.LANCZOS)
else:
    img_light_resized = img_light
img_light_resized.save(os.path.join(IMG_DIR, "logo-cream.png"), "PNG", optimize=True)
print(f"Updated logo-cream.png ({img_light_resized.size})")

print("\n=== Favicon + logo processing complete ===")
