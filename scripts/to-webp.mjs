/**
 * sources/*.png|jpg  ->  assets/*.webp
 *
 * Run: node scripts/to-webp.mjs
 *
 * The PNG/JPEG masters are not kept in the working tree — assets/*.webp is what
 * the app imports, and 15MB of losslessly-stored photographs is not worth
 * carrying. They live in git history. To re-run this script, restore them first:
 *
 *   mkdir -p sources && git show 7d4e44d:public/el-bg-invitation.png > sources/el-bg-invitation.png
 *
 * (7d4e44d is the last commit before the conversion; `git show <sha>:<path>`
 * for each file in MANIFEST below, all of which were in public/ at that point.)
 *
 * Only the files actually referenced by the app are listed. Anything not in
 * MANIFEST is either orphaned or must stay in its original format (see the
 * notes at the bottom of this file).
 *
 * `maxEdge` is the long edge to resample to before encoding. It is set from the
 * largest size each image is ever displayed at, doubled for retina — a 1409px
 * source for a card that renders ~300px wide is 2.5x more pixels than any
 * device asks for. Full-bleed backgrounds keep their native size.
 *
 * q82 is the pick for the artwork: below it the scalloped lace edges and the
 * doily borders start to smear, and those borders are the whole design. QR
 * codes get q92 — lossy artifacts on a QR can break a scan.
 */
import { mkdir, readdir, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'sources';
const OUT = 'assets';

const MANIFEST = [
  // Full-bleed backgrounds — native size, they cover the viewport.
  { file: 'el-bg-invitation.png' },
  { file: 'hero-sunflower-field.png' },
  { file: 'el-bg-itinerary.jpg' },
  { file: 'el-bg-registry.jpg' },

  // Card artwork — capped, see above.
  { file: 'el-itinerary-card.png', maxEdge: 1200 },
  { file: 'el-questions-card.png', maxEdge: 1200 },
  { file: 'el-registry-card.png', maxEdge: 1200 },
  { file: 'el-invitation-card-blank.png' },
  { file: 'el-thankyou-heart.png' },
  { file: 'el-dresscode.png' },
  { file: 'el-countdown-heading.png' },

  // Lockups. The footer logo renders at 56px, 32px, and as a CSS mask at
  // ~6.5rem — 1000px square was never needed.
  { file: 'wedding-lockup.png' },
  { file: 'el-footer-logo.png', maxEdge: 512 },

  // QR. Displayed at 180px on /registry and ~11vw in the gift section, so 600px
  // is already 1.6x the retina requirement; the modules stay square at that size.
  { file: 'anis-qr.png', maxEdge: 600, quality: 92 },
];

const DEFAULT_QUALITY = 82;

await mkdir(OUT, { recursive: true });

let before = 0;
let after = 0;

for (const { file, maxEdge, quality = DEFAULT_QUALITY } of MANIFEST) {
  const from = path.join(SRC, file);
  const to = path.join(OUT, file.replace(/\.(png|jpe?g)$/i, '.webp'));

  const pipeline = sharp(from);
  if (maxEdge) {
    // `fit: inside` + `withoutEnlargement` so this only ever shrinks.
    pipeline.resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true });
  }
  await pipeline.webp({ quality, effort: 6 }).toFile(to);

  const [a, b] = await Promise.all([stat(from), stat(to)]);
  const meta = await sharp(to).metadata();
  before += a.size;
  after += b.size;
  console.log(
    `${file.padEnd(32)} ${String((a.size / 1024) | 0).padStart(5)}KB -> ` +
      `${String((b.size / 1024) | 0).padStart(4)}KB  q${quality}  ${meta.width}x${meta.height}`
  );
}

console.log(
  `\ntotal ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB ` +
    `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`
);

// Warn if anything in assets/ is no longer produced by the manifest, so a
// renamed source doesn't leave a stale twin behind.
const stale = (await readdir(OUT)).filter(
  (f) => !MANIFEST.some(({ file }) => file.replace(/\.(png|jpe?g)$/i, '.webp') === f)
);
if (stale.length) console.log(`\nnot in manifest (delete by hand): ${stale.join(', ')}`);

/*
 * Deliberately not converted:
 *
 * - public/static/qr-bank-download.jpeg — the target of a `download` link. The
 *   guest saves it and hands it to a banking app; those are reliably fine with
 *   JPEG and not reliably fine with WebP. 86KB, fetched only on click.
 * - app/icon.png, app/apple-icon.png, app/opengraph-image.jpg — Next's file
 *   conventions, which expect those exact formats.
 */
