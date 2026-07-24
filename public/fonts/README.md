# Fonts Directory

## Singsong.otf — Custom Font

The Tikocraft website is configured to use **Singsong.otf** as the primary display font for all headings and brand text.

### How to add your Singsong.otf font

1. **Place the font file here:**
   ```
   /home/z/my-project/public/fonts/Singsong.otf
   ```

2. **The font is already wired up** in `src/app/globals.css`:
   ```css
   @font-face {
     font-family: "Singsong";
     src: url("/fonts/Singsong.otf") format("opentype");
     font-weight: normal;
     font-style: normal;
     font-display: swap;
   }
   ```

3. **It's used in the `.font-display` utility class:**
   ```css
   .font-display {
     font-family: "Singsong", var(--font-display), "Cormorant Garamond", Georgia, serif;
   }
   ```

### Until you upload Singsong.otf

The site automatically falls back to **Cormorant Garamond** (an elegant serif from Google Fonts) for all display text. The visual quality remains high — Cormorant Garamond is a similar luxury editorial serif that pairs beautifully with the brown / beige / cream palette.

### After you upload Singsong.otf

Just refresh the page — the custom font will load automatically. No code changes needed.
