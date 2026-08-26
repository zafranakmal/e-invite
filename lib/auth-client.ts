import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { roles } from "@/lib/permissions"

export const authClient = createAuthClient({
    // Gives the dashboard authClient.admin.createUser / listUsers, and puts
    // `role` on the session user so the UI knows what to show.
    plugins: [adminClient({ roles })],
})
