import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/registry/ — create a registry item (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { name, description, url, imageUrl, price } = await req.json();

    if (!name?.trim() || !description?.trim() || !imageUrl?.trim() || !price) {
      console.log('Validation failed:', { name, description, url, imageUrl, price });
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const reservation = await prisma.registryItem.create({
      data: {name: name.trim(), description: description.trim(), url: url.trim(), imageUrl: imageUrl.trim(), price: price},
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error.', details: error }, { status: 500 });
  }
}

// GET /api/registry/
// Public: returns items without reservation details
// Admin (session): returns items including who reserved each
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const items = await prisma.registryItem.findMany({
      orderBy: { createdAt: 'asc' },
      ...(session ? { include: { reservation: { select: { name: true, mobile: true } } } } : {}),
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Provide item ID.' }, { status: 400 });
    }

    await prisma.registryItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error.', details: error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id, name, description, url, imageUrl, price } = await req.json();

    if (!id || !name?.trim() || !description?.trim() || !url?.trim() || !imageUrl?.trim() || !price) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const updatedItem = await prisma.registryItem.update({
      where: { id },
      data: { name: name.trim(), description: description.trim(), url: url.trim(), imageUrl: imageUrl.trim(), price: price },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Server error.', details: error }, { status: 500 });
  }
}