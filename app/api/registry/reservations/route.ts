import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { denyIfNotAdmin } from '@/lib/require-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// POST /api/registry/reservations — create a reservation
export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`reservations:${getClientIp(req)}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  try {
    const { itemId, name, mobile } = await req.json()

    if (!itemId || !name?.trim() || !mobile?.trim()) {
      return NextResponse.json(
        { error: 'Missing fields.' },
        { status: 400 }
      )
    }

    // A gift takes up to maxReservations guests. Counting and inserting in one
    // transaction keeps two guests submitting at once from overshooting the cap.
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.registryItem.findUnique({
        where: { id: itemId },
        select: { id: true, maxReservations: true },
      })

      if (!item) return { status: 404 as const, error: 'Item not found.' }

      const taken = await tx.reservation.count({ where: { itemId } })
      if (taken >= item.maxReservations) {
        return { status: 409 as const, error: 'This gift is fully reserved.' }
      }

      const reservation = await tx.reservation.create({
        data: {
          name: name.trim(),
          mobile: mobile.trim(),
          itemId
        }
      })

      await tx.registryItem.update({
        where: { id: itemId },
        data: { reserved: taken + 1 >= item.maxReservations }
      })

      return { status: 201 as const, reservation }
    })

    if (result.status !== 201) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result.reservation, { status: 201 })

  } catch (error) {
    console.error('Reservation POST error:', error)
    return NextResponse.json(
      { error: 'Server error.' },
      { status: 500 }
    )
  }
}

// DELETE /api/registry/reservations — admin: clear reservations.
// { reservationId } drops one guest; { itemId } drops every guest on that gift.
export async function DELETE(req: NextRequest) {
  try {
    const denied = await denyIfNotAdmin(req);
    if (denied) return denied;

    const { itemId, reservationId } = await req.json();
    if (!itemId && !reservationId) {
      return NextResponse.json({ error: 'Provide itemId or reservationId.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      let targetItemId = itemId;

      if (reservationId) {
        const existing = await tx.reservation.findUnique({
          where: { id: reservationId },
          select: { itemId: true },
        });
        if (!existing) return;
        targetItemId = existing.itemId;
        await tx.reservation.delete({ where: { id: reservationId } });
      } else {
        await tx.reservation.deleteMany({ where: { itemId } });
      }

      // Freeing a slot can reopen an item that was full.
      const item = await tx.registryItem.findUnique({
        where: { id: targetItemId },
        select: { maxReservations: true },
      });
      if (!item) return;

      const taken = await tx.reservation.count({ where: { itemId: targetItemId } });
      await tx.registryItem.update({
        where: { id: targetItemId },
        data: { reserved: taken >= item.maxReservations },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reservation DELETE error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
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
      const { ok } = rateLimit(`reservations-lookup:${getClientIp(req)}`, { limit: 5, windowMs: 60_000 });
      if (!ok) {
        return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
      }

      const reservations = await prisma.reservation.findMany({
        where: { mobile: mobile.trim() },
        orderBy: { createdAt: 'desc' },
        select: { itemId: true },
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

