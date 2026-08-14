import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// A GET handler that takes no Request is a candidate for static generation,
// which would freeze the wishes list at whatever was in the database at build
// time. The caching we want is at the CDN, on the header below — not in the
// build output.
export const dynamic = 'force-dynamic';

// GET /api/wishes — fetch all wishes (newest first)
export async function GET() {
  try {
    const wishes = await prisma.wish.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Every guest loading the invitation runs this query. s-maxage collapses a
    // burst (a table of people opening the link at once) into one round trip;
    // stale-while-revalidate means nobody ever waits on the refresh.
    //
    // 10s, not minutes: this is a live wall, and a guest who scrolls down after
    // a friend posts should see it. The one case 10s would still get wrong —
    // a guest not seeing their OWN wish, which reads as "it didn't send" — is
    // handled on the client instead; see loadWishes in InvitationContent.
    return NextResponse.json(wishes, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// DELETE /api/wishes — delete a wish by id (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Provide id.' }, { status: 400 });
    await prisma.wish.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST /api/wishes — create a wish
export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`wishes:${getClientIp(req)}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  try {
    const { name, message } = await req.json();

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const wish = await prisma.wish.create({
      data: { name: name.trim(), message: message.trim() },
    });

    return NextResponse.json(wish, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
