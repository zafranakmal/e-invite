import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const UPLOAD_PATH_RE = /^\/uploads\/[A-Za-z0-9_.-]+$/;

// imageUrl may be an http(s) link or a path produced by our own /api/upload endpoint
function isSafeImageUrl(value: string): boolean {
  return UPLOAD_PATH_RE.test(value) || isSafeHttpUrl(value);
}

// POST /api/registry/ — create a registry item (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { name, description, url, imageUrl, price } = await req.json();

    if (!name?.trim() || !imageUrl?.trim() || !price) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    if ((url?.trim() && !isSafeHttpUrl(url.trim())) || !isSafeImageUrl(imageUrl.trim())) {
      return NextResponse.json({ error: 'url must be an http(s) link and imageUrl must be an http(s) link or an uploaded image.' }, { status: 400 });
    }

    const reservation = await prisma.registryItem.create({
      data: {name: name.trim(), description: description?.trim() || '', url: url?.trim() || '', imageUrl: imageUrl.trim(), price: price},
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Registry POST error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
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
    console.error('Registry DELETE error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id, name, description, url, imageUrl, price } = await req.json();

    if (!id || !name?.trim() || !imageUrl?.trim() || !price) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    if ((url?.trim() && !isSafeHttpUrl(url.trim())) || !isSafeImageUrl(imageUrl.trim())) {
      return NextResponse.json({ error: 'url must be an http(s) link and imageUrl must be an http(s) link or an uploaded image.' }, { status: 400 });
    }

    const updatedItem = await prisma.registryItem.update({
      where: { id },
      data: { name: name.trim(), description: description?.trim() || '', url: url?.trim() || '', imageUrl: imageUrl.trim(), price: price },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Registry PUT error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}