import { createAuthClient } from 'better-auth/react'
import {
  adminClient,
  inferAdditionalFields,
  organizationClient
} from 'better-auth/client/plugins'
import { ac, roles } from '@/lib/permissions'
import { auth } from './auth'
export const authClient = createAuthClient({
  baseURL: '', // <-- keep empty string
  fetchOptions: {
    credentials: 'include'
  },
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles
      // roles: {
      //   admin,
      //   owner,
      //   user
      // }
    }),
    organizationClient()
  ]
})
