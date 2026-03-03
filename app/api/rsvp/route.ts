import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/rsvp — create or update an RSVP (public)
export async function POST(req: NextRequest) {
  try {
    const { name, mobile, attending, guests, ref, relation, _hp } = await req.json();

    // Honeypot: bots fill hidden fields; silently return fake success
    if (_hp) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (!name?.trim() || !mobile?.trim() || attending === undefined) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const rsvp = await prisma.rsvp.upsert({
      where: { mobile: mobile.trim() },
      update: {
        name: name.trim(),
        attending,
        guests: guests ?? 1,
        ...(ref !== undefined && { ref: ref || null }),
        ...(relation !== undefined && { relation: relation || null }),
      },
      create: {
        name: name.trim(),
        mobile: mobile.trim(),
        attending,
        guests: guests ?? 1,
        ref: ref || null,
        relation: relation || null,
      },
    });

    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error.', details: (error as Error).message }, { status: 500 });
  }
}

// GET /api/rsvp?mobile=xx — public: look up a single RSVP by mobile
// GET /api/rsvp            — admin: fetch all RSVPs (requires session)
export async function GET(req: NextRequest) {
  try {
    const mobile = new URL(req.url).searchParams.get('mobile');

    if (mobile) {
      const rsvp = await prisma.rsvp.findUnique({ where: { mobile: mobile.trim() } });
      return NextResponse.json(rsvp ?? null);
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const all = await prisma.rsvp.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/rsvp — admin: update relation on an existing RSVP (requires session)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id, relation } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Provide id.' }, { status: 400 });
    }

    const updated = await prisma.rsvp.update({
      where: { id },
      data: { relation: relation || null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Server error.', details: (error as Error).message }, { status: 500 });
  }
}
