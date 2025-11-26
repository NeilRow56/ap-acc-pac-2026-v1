import { createAuthClient } from 'better-auth/react'
import {
  adminClient,
  inferAdditionalFields,
  organizationClient
} from 'better-auth/client/plugins'
import { auth } from './auth'
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    organizationClient()
  ],
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL
})
