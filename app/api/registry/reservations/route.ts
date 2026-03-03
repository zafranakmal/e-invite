import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/registry/reservations — create a reservation
export async function POST(req: NextRequest) {
  try {
    const { itemId, name, mobile } = await req.json()

    if (!itemId || !name?.trim() || !mobile?.trim()) {
      return NextResponse.json(
        { error: 'Missing fields.' },
        { status: 400 }
      )
    }

    // 1️⃣ Check if item exists
    const item = await prisma.registryItem.findUnique({
      where: { id: itemId },
      include: { reservation: true }
    })

    console.log('Checking item:', itemId, 'Found:', !!item) // Debug log

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found.' },
        { status: 404 }
      )
    }

    console.log('Item found:', item)

    // 2️⃣ Check if already reserved
    if (item.reservation || item.reserved) {
      return NextResponse.json(
        { error: 'Item already reserved.' },
        { status: 409 }
      )
    }

    // 3️⃣ Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        itemId
      }
    })

    await prisma.registryItem.update({
      where: { id: itemId },
      data: { reserved: true }
    })

    return NextResponse.json(reservation, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Server error.', details: error },
      { status: 500 }
    )
  }
}

// DELETE /api/registry/reservations — admin: clear a reservation by itemId
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) return NextResponse.json({ error: 'Provide itemId.' }, { status: 400 });

    await prisma.reservation.deleteMany({ where: { itemId } });
    await prisma.registryItem.update({
      where: { id: itemId },
      data: { reserved: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error.', details: (error as Error).message }, { status: 500 });
  }
}

// GET /api/registry/reservations?mobile=xxx — fetch by mobile
// GET /api/registry/reservations?itemId=xxx — fetch count by item
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');
    const itemId = searchParams.get('itemId');

    if (mobile) {
      const reservations = await prisma.reservation.findMany({
        where: { mobile: mobile.trim() },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(reservations);
    }

    if (itemId) {
      const count = await prisma.reservation.count({ where: { itemId } });
      return NextResponse.json({ count });
    }

    return NextResponse.json({ error: 'Provide mobile or itemId.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

