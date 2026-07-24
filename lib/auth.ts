import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        // Public registration is intentionally disabled — this is a 2-admin site.
        // To add another admin later: temporarily set this to false, redeploy,
        // sign up via POST /api/auth/sign-up/email, then set back to true and redeploy.
        disableSignUp: true,
    },
});
