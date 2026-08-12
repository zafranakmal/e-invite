import type { MetadataRoute } from 'next';

// Deliberately permissive. The site is hidden from Google by the `noindex`
// meta tag in app/layout.tsx, NOT by robots.txt. Two reasons it has to be this
// way round, both easy to get backwards:
//
//   1. facebookexternalhit serves Facebook AND Instagram DM link previews, and
//      it honours robots.txt. `Disallow: /` would kill the previews this site
//      is shared with.
//   2. Google never fetches a URL it is disallowed from, so it would never see
//      the noindex tag — and the bare URL could still be listed, title-less.
//      Blocking the crawl and noindexing are mutually exclusive; you have to
//      let Google in for the noindex to be honoured.
//
// /api/ is the one worthwhile disallow: GET /api/wishes returns guest names and
// JSON can't carry a meta tag. next.config.js also sends X-Robots-Tag on those
// routes, which is the real fix — robots.txt only stops the fetch, the header
// stops the listing.
//
// /dashboard and /sign-in are deliberately NOT disallowed. They inherit the
// root layout's noindex, and disallowing them would re-create the trap in (2).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
  };
}
