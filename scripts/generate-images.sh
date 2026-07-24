#!/bin/bash
# Generate all images sequentially with delays to avoid rate limiting

IMAGES_DIR="/home/z/my-project/public/images"
mkdir -p "$IMAGES_DIR"

STYLE="luxury editorial photography, warm brown beige cream palette, soft natural lighting, premium home decor, high quality, professional photography, elegant minimalist aesthetic"

generate() {
  local prompt="$1"
  local output="$2"
  local size="${3:-1024x1024}"
  
  if [ -f "$output" ]; then
    echo "SKIP (exists): $output"
    return 0
  fi
  
  echo "Generating: $output"
  for attempt in 1 2 3; do
    if z-ai image -p "$prompt" -o "$output" -s "$size" 2>&1 | grep -q "completed"; then
      echo "  OK: $output"
      sleep 3
      return 0
    fi
    echo "  Retry $attempt for $output"
    sleep 10
  done
  echo "  FAILED: $output"
}

generate "Luxurious modern living room interior with cream walls, beige sofa with brown cushions, handcrafted ceramic vases on wooden console, large window with soft natural light, woven textiles, organic shapes, editorial interior design magazine photography, warm earthy tones, $STYLE" "$IMAGES_DIR/hero.png" "1440x720"

generate "Collection of handcrafted ceramic vases in earthy brown beige cream tones, organic shapes, displayed on wooden shelf, minimalist styling, studio photography, $STYLE" "$IMAGES_DIR/collection-ceramics.png" "1024x1024"

generate "Folded linen throws and woven textiles in cream beige brown colors, natural fibers, handwoven texture, on rustic wooden surface, $STYLE" "$IMAGES_DIR/collection-textiles.png" "1024x1024"

generate "Elegant bronze and brass table lamp with warm amber glow, sculptural base, on wooden side table with beige wall background, $STYLE" "$IMAGES_DIR/collection-lighting.png" "1024x1024"

generate "Handcrafted wooden chair with woven seat, natural oak finish, in minimalist room with beige walls and cream textile, $STYLE" "$IMAGES_DIR/collection-furniture.png" "1024x1024"

generate "Single handcrafted ceramic vase in warm terracotta brown, organic curved form, on cream pedestal with soft shadow, isolated product photography, $STYLE" "$IMAGES_DIR/product-1.png" "1024x1024"

generate "Handwoven seagrass basket with leather handles, natural beige tones, on cream background, product photography, $STYLE" "$IMAGES_DIR/product-2.png" "1024x1024"

generate "Handcarved wooden bowl in walnut brown, organic irregular shape, on cream linen surface, overhead product photography, $STYLE" "$IMAGES_DIR/product-3.png" "1024x1024"

generate "Soft cream linen throw blanket folded with fringed edges, on wooden surface, natural lighting, cozy minimal styling, $STYLE" "$IMAGES_DIR/product-4.png" "1024x1024"

generate "Bronze candleholder with single lit candle, sculptural form, warm glow, on beige stone surface, dark moody background, $STYLE" "$IMAGES_DIR/product-5.png" "1024x1024"

generate "Abstract sculptural decor object in matte beige ceramic, organic modernist form, on wooden plinth, gallery styling, $STYLE" "$IMAGES_DIR/product-6.png" "1024x1024"

generate "Artisan craftsman hands shaping clay on pottery wheel in warm lit atelier workshop, focus on hands and clay, brown earthy tones, documentary photography, $STYLE" "$IMAGES_DIR/atelier-1.png" "864x1152"

generate "Cozy artisan workshop interior with wooden workbench, tools hanging on wall, ceramic pieces drying on shelf, warm window light, $STYLE" "$IMAGES_DIR/atelier-2.png" "1344x768"

generate "Texture detail of handwoven natural fiber textile in cream beige tones, macro photography showing intricate weave, $STYLE" "$IMAGES_DIR/texture-1.png" "1344x768"

generate "Wide shot of luxury home decor showroom with curated collection of vases textiles and furniture, warm earthy palette, museum gallery lighting, $STYLE" "$IMAGES_DIR/showroom.png" "1440x720"

echo "=== Done ==="
ls -la "$IMAGES_DIR"
