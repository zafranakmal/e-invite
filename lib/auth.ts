import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLE, EDITOR_ROLE, roles } from "@/lib/permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        // Nobody signs themselves up. Logins are handed out from the Team tab
        // of the dashboard, which goes through the admin plugin's
        // /admin/create-user — a separate endpoint that this flag doesn't gate.
        disableSignUp: true,
    },
    plugins: [
        admin({
            roles,
            // Anyone created from the dashboard is an editor unless the form
            // says otherwise, so a slip never hands out delete rights.
            defaultRole: EDITOR_ROLE,
            adminRoles: [ADMIN_ROLE],
        }),
    ],
});
