#!/usr/bin/env python3
"""Build app/icon.png and app/apple-icon.png from the A&Z monogram.

Run by hand, like build-og-image.py:

    python3 scripts/build-icons.py

Both icons use the mask-and-fill trick the site already uses for this artwork
in app/registry/registry.module.css — el-footer-logo is solid white on
transparent, so its alpha is the mask and the fill is ink.

The two icons carry the SAME mark but not the same crop, because the monogram
does not survive being shrunk whole. It's a wide calligraphic ligature with a
long hairline swash sweeping off the bottom-right, and that swash is what kills
it: it inflates the bounding box by ~15% of the height, so fitting it into a
square shrinks the letterforms, and its hairline is the first thing to
disappear into antialiasing. Downscaled whole, the mark retains 10.1% solid ink
at 180px but 0.0% at 16px — nothing but haze.

So the tab icon trims the swash (SWASH_TRIM) and thickens what's left
(DILATE) before downscaling. Those two moves together are what make it read;
neither alone is enough. The apple icon keeps the mark entire — at 180px the
swash is the best part of it.

Requires Pillow. No system fonts, nothing platform-specific.
"""

from PIL import Image, ImageFilter

SRC_MONOGRAM = 'assets/el-footer-logo.webp'  # 512x512, alpha

INK = (44, 34, 24)        # --c-ink  #2c2218, matching registry.module.css
GROUND = (240, 232, 220)  # --c-bg   #f0e8dc

# 180px is the size iOS asks for. Opaque and square-cornered: iOS composites
# transparency to black and applies its own rounded-rect mask, so a transparent
# icon comes out as a black tile.
APPLE_SIZE = 180
APPLE_PAD = 18

# 64, not 32: leaves headroom for 2x bookmark bars while still reducing cleanly
# to the 16px favicon browsers paint in the tab.
ICON_SIZE = 64
ICON_PAD = 2

# Keep the top 85% of the mark. That lands just below the Z, dropping the
# swash's trailing sweep while leaving every letterform whole. Cropping the
# WIDTH instead is tempting and wrong — it clips the Z's top bar, which is load
# bearing at small sizes.
SWASH_TRIM = 0.85

# Stroke weight, as a MaxFilter kernel on the alpha before downscaling. 5 is
# the most that holds: at 7+ the counters of the & start closing up and the
# mark reads as a blob.
DILATE = 5


def load_mark():
    """The monogram, trimmed to its ink."""
    art = Image.open(SRC_MONOGRAM).convert('RGBA')
    return art.crop(art.getbbox())


def render(alpha, size, pad):
    """Fill an alpha mask with ink and centre it on the cream ground."""
    art = Image.new('RGBA', alpha.size, INK + (0,))
    art.putalpha(alpha)
    art.thumbnail((size - pad * 2, size - pad * 2), Image.LANCZOS)
    canvas = Image.new('RGB', (size, size), GROUND)
    canvas.paste(art, ((size - art.width) // 2, (size - art.height) // 2), art)
    return canvas, art.size


def build_apple():
    mark = load_mark()
    canvas, (w, h) = render(mark.getchannel('A'), APPLE_SIZE, APPLE_PAD)
    canvas.save('app/apple-icon.png', 'PNG', optimize=True)
    print(f'app/apple-icon.png: {APPLE_SIZE}x{APPLE_SIZE}, full mark {w}x{h}')


def build_icon():
    mark = load_mark()
    alpha = mark.crop((0, 0, mark.width, round(mark.height * SWASH_TRIM))).getchannel('A')
    alpha = alpha.filter(ImageFilter.MaxFilter(DILATE))
    alpha = alpha.crop(alpha.getbbox())  # re-trim: the cut changed the bounds
    canvas, (w, h) = render(alpha, ICON_SIZE, ICON_PAD)
    canvas.save('app/icon.png', 'PNG', optimize=True)
    print(f'app/icon.png: {ICON_SIZE}x{ICON_SIZE}, trimmed mark {w}x{h}')


if __name__ == '__main__':
    build_apple()
    build_icon()
