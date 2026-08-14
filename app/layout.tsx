import type { Metadata } from 'next';
import { Cormorant_Garamond, Pinyon_Script, Bellefair, Belleza } from 'next/font/google';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';

/* Self-hosted at build time: the woff2 files are emitted into /_next/static and
 * served from our own origin, `immutable`. That removes two third-party
 * handshakes (fonts.googleapis.com for the CSS, then fonts.gstatic.com for the
 * files) from the critical path, and with them the Google origins in the CSP.
 *
 * Weights are the ones the stylesheets actually ask for. The <link> this
 * replaced pulled 16 variants, including Cormorant 700 and eight italics that
 * no rule references, plus Amiri — three files for a --font-arabic that was
 * declared in globals.css and used by nothing. */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body',
});

const pinyon = Pinyon_Script({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-script' });
const bellefair = Bellefair({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-display' });
const belleza = Belleza({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-credit' });

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
  // audience variants (lib/invite-variant.ts), so a forwarded card can never
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
    // One canonical share identity, so every audience variant (?p=v1|v2|v3)
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
