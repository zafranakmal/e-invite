import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/sign-up
// Body: { name, email, password }
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'name, email and password are required.' }, { status: 400 });
    }

    const data = await auth.api.signUpEmail({
      body: {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      }
    })
    return NextResponse.json(data, { status: 201 });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
