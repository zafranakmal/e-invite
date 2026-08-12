import type { Metadata } from 'next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Amiri:ital,wght@0,400;0,700;1,400&family=Pinyon+Script&family=Bellefair&family=Belleza&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
