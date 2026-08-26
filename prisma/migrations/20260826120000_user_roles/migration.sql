-- Logins can now be handed out from the dashboard, so a user needs a role.
-- New rows default to "editor": same dashboard, no delete buttons.
ALTER TABLE "user" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'editor';

-- Everyone who already had a login is the couple, and keeps full access.
UPDATE "user" SET "role" = 'admin';

-- The rest of what better-auth's admin plugin expects. Unused today (nobody
-- is banned and impersonation is never called), but the plugin reads these
-- columns on every sign-in, so they have to exist.
ALTER TABLE "user" ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN "banReason" TEXT;
ALTER TABLE "user" ADD COLUMN "banExpires" TIMESTAMP(3);
ALTER TABLE "session" ADD COLUMN "impersonatedBy" TEXT;
