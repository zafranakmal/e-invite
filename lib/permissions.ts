import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

// Two roles, one difference. An admin is the couple: full run of the
// dashboard, plus the right to delete records and hand out logins. An editor
// is a helper: same screens, same add/edit powers, but nothing they touch can
// be removed and they never see the Team tab.
//
// This module is imported by both the server (lib/auth.ts) and the browser
// (lib/auth-client.ts), so it must stay free of any server-only imports.
export const ADMIN_ROLE = 'admin';
export const EDITOR_ROLE = 'editor';

export type Role = typeof ADMIN_ROLE | typeof EDITOR_ROLE;

export const ROLE_LABELS: Record<Role, string> = {
  [ADMIN_ROLE]: 'Admin',
  [EDITOR_ROLE]: 'Editor',
};

const ac = createAccessControl(defaultStatements);

// These statements only govern better-auth's own user-management endpoints —
// who may create, list or remove logins. Deleting wedding records (RSVPs,
// wishes, registry items) is our own concern and is gated in the API routes.
export const roles = {
  [ADMIN_ROLE]: ac.newRole(adminAc.statements),
  [EDITOR_ROLE]: ac.newRole({ user: [], session: [] }),
};

/**
 * better-auth stores a user's roles as one comma-separated string, so a plain
 * equality check would miss `"admin,editor"`.
 */
export function isAdmin(role?: string | null): boolean {
  return (role ?? '').split(',').includes(ADMIN_ROLE);
}
