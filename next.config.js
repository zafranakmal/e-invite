/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' https: data:",
      "font-src 'self' https://fonts.gstatic.com",
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
    ];
  },
};

module.exports = nextConfig;
