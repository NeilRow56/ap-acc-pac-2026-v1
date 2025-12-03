import VerifyChangeEmail from '@/components/emails/change-email'
import ForgotPasswordEmail from '@/components/emails/reset-password'
import VerifyEmail from '@/components/emails/verify-email'
import sendOrganizationInviteEmail from '@/components/emails/organization-invite-email'

import { db } from '@/db'
import { member } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'
import { admin as adminPlugin } from 'better-auth/plugins/admin'
import { nextCookies } from 'better-auth/next-js'

import { ac, roles } from '@/lib/permissions'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

// --- Origin Helpers ---
function normalize(origin: string) {
  return origin.replace(/\/$/, '').toLowerCase()
}

function detectOrigin(req: Request): string | null {
  const o = req.headers.get('origin')
  if (o && o !== 'null') return normalize(o)

  const r = req.headers.get('referer')
  if (r) {
    try {
      return normalize(new URL(r).origin)
    } catch {}
  }

  const host = req.headers.get('host')
  return host ? `https://${host}` : null
}

// --- Allowed Origins (final) ---
const STATIC_ALLOWED = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.BETTER_AUTH_URL
]
  .filter(Boolean)
  .map(o => normalize(o!))

const allowedOriginsFn = (origin: string | null | undefined, req: Request) => {
  const detected = detectOrigin(req) || origin
  if (!detected) return true

  const n = normalize(detected)

  // Allow localhost
  if (n.startsWith('http://localhost')) return true

  // Allow exact env URLs
  if (STATIC_ALLOWED.includes(n)) return true

  // Allow all Vercel preview deployments
  if (n.endsWith('.vercel.app')) return true

  console.warn('[better-auth] Blocked origin:', n)
  return false
}

// =======================
//        AUTH
// =======================
export const auth = betterAuth({
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: 'Verify your email',
        react: VerifyEmail({ username: user.name, verifyUrl: url })
      })
    }
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: 'Reset your password',
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email
        })
      })
    }
  },

  user: {
    deleteUser: { enabled: true },

    additionalFields: {
      role: { type: ['user', 'admin', 'owner'], input: false },
      isSuperUser: {
        type: 'boolean' as const,
        default: false as boolean
      }
    },

    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: user.email,
          subject: 'Reset your email',
          react: VerifyChangeEmail({ newEmail, verifyUrl: url })
        })
      }
    }
  },

  session: {
    expiresIn: 60 * 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      secure: true,
      sameSite: 'none'
    }
  },

  database: drizzleAdapter(db, { provider: 'pg' }),

  // ❗ Required for Vercel previews
  trustHost: true,
  allowedOrigins: allowedOriginsFn,

  url: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.NEXT_PUBLIC_APP_URL!,
    process.env.BETTER_AUTH_URL!,
    '*.vercel.app'
  ],

  plugins: [
    organization({
      sendInvitationEmail: async data => {
        const inviteLink = `${process.env.BETTER_AUTH_URL}/organization/invites/${data.id}`

        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: data.email,
          subject: "You've been invited",
          react: sendOrganizationInviteEmail({
            email: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink
          })
        })
      }
    }),

    nextCookies(),

    adminPlugin({
      defaultRole: 'user',
      adminRoles: ['admin', 'owner'],
      ac,
      roles
    })
  ],

  databaseHooks: {
    session: {
      create: {
        before: async userSession => {
          const membership = await db.query.member.findFirst({
            where: eq(member.userId, userSession.userId),
            orderBy: desc(member.createdAt),
            columns: { organizationId: true }
          })

          return {
            data: {
              ...userSession,
              activeOrganizationId: membership?.organizationId ?? null
            }
          }
        }
      }
    }
  }
})

export type Session = typeof auth.$Infer.Session
