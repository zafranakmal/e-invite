import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/permissions';

/**
 * Guard for the destructive endpoints. Returns a response to hand straight
 * back to the caller, or null when the request may proceed.
 *
 * Editors are signed in and can add and edit like anyone else — deleting is
 * the one thing reserved for admins, so a 403 here is not a bug.
 */
export async function denyIfNotAdmin(req: NextRequest): Promise<NextResponse | null> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Only an admin can delete records.' }, { status: 403 });
  }
  return null;
}
