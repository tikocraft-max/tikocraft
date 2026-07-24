#!/bin/bash
IMAGES_DIR="/home/z/my-project/public/images"
STYLE="luxury editorial photography, warm brown beige cream palette, soft natural lighting, premium handcrafted, high quality, professional photography, elegant minimalist aesthetic, shallow depth of field"

generate() {
  local prompt="$1"
  local output="$2"
  local size="${3:-1024x1024}"
  if [ -f "$output" ]; then echo "SKIP: $output"; return 0; fi
  echo "Generating: $output"
  for attempt in 1 2 3; do
    if z-ai image -p "$prompt" -o "$output" -s "$size" 2>&1 | grep -q "completed"; then
      echo "  OK: $output"; sleep 3; return 0
    fi
    echo "  Retry $attempt"; sleep 8
  done
  echo "  FAILED: $output"
}

# Hero image for book nooks page — magical bookshelf diorama
generate "Miniature magical book nook diorama inserted between books on a wooden shelf, tiny glowing windows in miniature castle, warm amber light, intricate handpainted details, cozy alley scene with tiny lamp posts, books flanking the diorama, $STYLE" "$IMAGES_DIR/booknook-hero.png" "1344x768"

# Book nook collection cover
generate "Collection of three miniature book nook dioramas displayed on shelf between vintage books, each showing different scene - cozy street, enchanted forest, magical library, warm internal lighting, intricate 3D diorama craft, $STYLE" "$IMAGES_DIR/collection-booknooks.png" "1024x1024"

# Individual book nook products
generate "Single book nook miniature diorama of a cozy Parisian street at dusk, tiny illuminated shop windows, miniature cobblestone path, handpainted facade, warm glow from within, displayed between leather books on shelf, $STYLE" "$IMAGES_DIR/booknook-1.png" "1024x1024"

generate "Single book nook miniature diorama of an enchanted forest with tiny fairy lights, miniature trees and mushrooms, magical glow, handpainted fantasy scene, displayed between books, $STYLE" "$IMAGES_DIR/booknook-2.png" "1024x1024"

generate "Single book nook miniature diorama of a tiny magical library interior with miniature bookshelves, warm lamp light, rolling ladder, handcrafted details, displayed between books, $STYLE" "$IMAGES_DIR/booknook-3.png" "1024x1024"

generate "Single book nook miniature diorama of a Japanese zen garden at twilight, tiny stone lantern, miniature cherry blossom tree, peaceful warm glow, handpainted, displayed between books, $STYLE" "$IMAGES_DIR/booknook-4.png" "1024x1024"

# Process/assembly shot
generate "Hands assembling a 3D DIY book nook kit on wooden workbench, tiny wooden pieces and miniature components, warm workshop lighting, craft in progress, focus on hands and tiny parts, $STYLE" "$IMAGES_DIR/booknook-process.png" "1344x768"

echo "=== Book nook images done ==="
ls -la "$IMAGES_DIR"/booknook*.png 2>&1
