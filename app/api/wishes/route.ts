import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/wishes — fetch all wishes (newest first)
export async function GET() {
  try {
    const wishes = await prisma.wish.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log('Fetched wishes:', wishes);
    return NextResponse.json(wishes);
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
