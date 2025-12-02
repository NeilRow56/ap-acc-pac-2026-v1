import VerifyChangeEmail from '@/components/emails/change-email'
import ForgotPasswordEmail from '@/components/emails/reset-password'
import VerifyEmail from '@/components/emails/verify-email'
import { db } from '@/db'
import { betterAuth } from 'better-auth'
import { ac, roles } from '@/lib/permissions'
import { organization } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin as adminPlugin } from 'better-auth/plugins/admin'
import { nextCookies } from 'better-auth/next-js'

import { Resend } from 'resend'
import sendOrganizationInviteEmail from '@/components/emails/organization-invite-email'
import { desc, eq } from 'drizzle-orm'
import { member } from '@/db/schema'

const resend = new Resend(process.env.RESEND_API_KEY as string)

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: 'Verify your email',
        react: VerifyEmail({ username: user.name, verifyUrl: url })
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: 'Reset your password',
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email
        })
      })
    },
    requireEmailVerification: true
  },
  user: {
    deleteUser: {
      enabled: true
    },

    additionalFields: {
      role: {
        type: ['user', 'admin', 'owner'],
        input: false
      },
      isSuperUser: { type: 'boolean', default: false }
    },

    changeEmail: {
      enabled: true,
      async sendChangeEmailVerification({ user, newEmail, url }) {
        resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: user.email,
          subject: 'Reset your email',
          react: VerifyChangeEmail({ newEmail, verifyUrl: url })
        })
      }
    }
  },

  session: {
    expiresIn: 30 * 24 * 60 * 60 * 2, // 60 days - default is 7 days
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  database: drizzleAdapter(db, {
    provider: 'pg'

    // session, user and verification table names already match the database names
  }),

  trustedOrigins: [process.env.VERCEL_URL!],

  secret: process.env.BETTER_AUTH_SECRET!,
  url: process.env.BETTER_AUTH_URL, // important
  allowedOrigins: process.env.BETTER_AUTH_ALLOWED_ORIGINS?.split(','),

  plugins: [
    organization({
      sendInvitationEmail: async data => {
        const inviteLink = `${process.env.BETTER_AUTH_URL}/organization/invites/${data.id}`
        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: data.email,
          subject: "You've been invited to join our organization",
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
      adminRoles: ['admin', 'owner'], // MUST BE THIS
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
              activeOrganizationId: membership?.organizationId
            }
          }
        }
      }
    }
  }
})

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN'
export type Session = typeof auth.$Infer.Session
