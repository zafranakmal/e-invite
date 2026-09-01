import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';

/* Self-hosted: the woff2 files live in assets/fonts/ and are emitted into
 * /_next/static/media with a content hash, served from our own origin
 * `immutable`. That removes two third-party handshakes (fonts.googleapis.com
 * for the CSS, then fonts.gstatic.com for the files) from the critical path,
 * and with them the Google origins in the CSP.
 *
 * These are vendored rather than fetched through next/font/google on purpose.
 * `next/font/google` downloads from Google *at build time*, so the deploy host
 * needs outbound HTTPS to fonts.googleapis.com — ours doesn't have it, and the
 * build failed with ETIMEDOUT. Committed files make the build hermetic.
 *
 * Each file is the latin subset only, straight from the same gstatic URLs
 * next/font/google would have used. Cormorant Garamond ships as a variable
 * font (wght 300–700, one file per style), which is why there are two files
 * where there were four weights. To refresh any of them, re-fetch
 * https://fonts.googleapis.com/css2?family=<Family>&display=swap with a
 * browser user agent and take the woff2 from the latin @font-face block. */
const cormorant = localFont({
  src: [
    { path: '../assets/fonts/cormorant-garamond-latin.woff2', weight: '300 700', style: 'normal' },
    { path: '../assets/fonts/cormorant-garamond-latin-italic.woff2', weight: '300 700', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-body',
  adjustFontFallback: 'Times New Roman',
});

const pinyon = localFont({
  src: '../assets/fonts/pinyon-script-latin-400.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-script',
  adjustFontFallback: 'Times New Roman',
});

const bellefair = localFont({
  src: '../assets/fonts/bellefair-latin-400.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
  adjustFontFallback: 'Times New Roman',
});

const belleza = localFont({
  src: '../assets/fonts/belleza-latin-400.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-credit',
});

const fontVars = [cormorant, pinyon, bellefair, belleza].map((f) => f.variable).join(' ');

// FontAwesome injects its CSS at runtime by default, which makes icons flash at
// a huge size before hydration. Importing the stylesheet above and turning the
// injection off keeps them sized correctly on first paint.
config.autoAddCss = false;

// Hardcoded because this isn't on Vercel — there's no VERCEL_URL to fall back
// to, and without metadataBase Next resolves the Open Graph image against
// http://localhost:3000 in production, which silently breaks every preview.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anissufea.zafranakmal.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // `default` is the guest-facing title — the browser tab and, since openGraph
  // doesn't override it, the bold line in a WhatsApp preview. `template` only
  // applies to routes that set a title of their own, i.e. the admin pages,
  // which would otherwise inherit the wedding title on their tabs.
  title: {
    default: 'Wedding Reception of Anis & Zafran',
    template: '%s | Anis & Zafran',
  },
  // The load-bearing facts sit in the first 62 characters — WhatsApp truncates
  // a preview at roughly two lines. The reception time and the registry are
  // left out on purpose: those are the two facts that differ between the ?p=
  // and ?t= variants (lib/invite-variant.ts), so a forwarded card can never
  // reveal which invitation a guest was sent.
  description:
    'Wedding Reception of Anis & Zafran - Sabtu, 31 Oktober 2026. Grand Ballroom, BoraOmbak Putrajaya.',

  // Kept out of search results: the registry prints a bank account number and
  // the gift section links four parents' mobile numbers. `noindex` is the only
  // lever that hides the page from Google WITHOUT breaking WhatsApp/Instagram
  // previews — social scrapers ignore this tag. See app/robots.ts for why
  // robots.txt must stay permissive. Inherited by every route: /registry
  // exports no metadata at all, and the /sign-in and /dashboard layouts set
  // only a title, so this object still reaches them.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },

  openGraph: {
    type: 'website',
    // One canonical share identity, so every audience variant (?p=, ?t=)
    // and every ?ref= link previews identically.
    url: '/',
    siteName: 'Anis & Zafran',
    locale: 'ms_MY',
    // title/description are inherited from the fields above, and `images` is
    // deliberately absent so app/opengraph-image.jpg supplies it — Next only
    // injects the file-based image when openGraph doesn't own an `images` key.
    // That file convention is what gives us real og:image:width/height (which
    // decide large card vs small thumbnail), a content hash that busts
    // WhatsApp's un-purgeable per-URL cache, and twitter:card for free.
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
