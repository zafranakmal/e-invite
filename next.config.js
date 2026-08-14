/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    // AVIF lands ~20-30% under WebP. It costs more transform time on a cold
    // miss, which the TTL below means we pay once rather than every 60s.
    formats: ['image/avif', 'image/webp'],
    // Default is 60 SECONDS. /_next/image derives its cache lifetime from the
    // upstream response, and for an imported asset that is already immutable,
    // so there is nothing to be gained by re-transforming.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Trimmed from the 8 defaults — every entry is a variant Vercel generates
    // and bills for, and the widths between these were never being chosen.
    deviceSizes: [390, 640, 828, 1080, 1200, 1920],
  },

  async headers() {
    // 'unsafe-inline' on script-src is required because most pages here are
    // statically prerendered at build time, which is incompatible with
    // per-request CSP nonces (Next.js's hydration scripts need one or the
    // other). There's no script-injection vector in this app to exploit it
    // (no dangerouslySetInnerHTML, all user content rendered as escaped JSX).
    // 'unsafe-eval' is added in dev only — Next's Fast Refresh/HMR runtime
    // uses eval() and doesn't exist in the production build.
    const isDev = process.env.NODE_ENV !== 'production';
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      // No fonts.googleapis.com / fonts.gstatic.com: next/font self-hosts every
      // face at build time, so both origins are now unreachable by design.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'interest-cohort=()',
            ].join(', '),
          },
        ],
      },
      // Header sets merge, so the block above still applies here. This is the
      // half of the /api/ rule in app/robots.ts that actually bites: robots.txt
      // only asks a crawler not to fetch, and JSON responses have no <head> to
      // put a meta tag in. GET /api/wishes returns guest names.
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      // Everything the app imports from assets/ lands in /_next/static/media/
      // with a content hash and gets `immutable` for free. public/static/ is
      // for the two files that can't take a hashed name — the audio track and
      // the QR the registry offers as a download — so they get the same
      // treatment by hand. Safe only because their content is frozen: to
      // change either one, change the filename with it.
      {
        source: '/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;
