type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodic cleanup so the map doesn't grow unbounded over the site's lifetime.
setInterval(() => {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}, 5 * 60 * 1000).unref();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { ok: boolean } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false };
  }

  bucket.count += 1;
  return { ok: true };
}

export function getClientIp(req: Request): string {
  // Set by Cloudflare itself from the actual edge connection — it strips/overwrites
  // any client-supplied value, so unlike X-Forwarded-For it can't be spoofed by the
  // client UNLESS the origin can be reached without going through Cloudflare at all
  // (nginx must be restricted to Cloudflare's IP ranges for this guarantee to hold).
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  // Fallback for non-Cloudflare access — the leftmost entry is client-controlled and
  // not trustworthy on its own, kept only so local/dev requests still get a stable key.
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
