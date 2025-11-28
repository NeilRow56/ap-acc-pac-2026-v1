'use server'

import { db } from '@/db'
import { user } from '@/db/schema/index.ts'
import { auth } from '@/lib/auth'
import { eq, inArray, not } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const signUp = async (email: string, password: string, name: string) => {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password
      }
    })

    return {
      success: true,
      message: 'Signed up successfully.'
    }
  } catch (error) {
    const e = error as Error

    return {
      success: false,
      message: e.message || 'An unknown error occurred.'
    }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: true
      }
    })

    return {
      success: true,
      message: 'Signed in successfully.'
    }
  } catch (error) {
    const e = error as Error

    return {
      success: false,
      message: e.message || 'An unknown error occurred.'
    }
  }
}

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/auth')
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id)
  })

  if (!currentUser) {
    redirect('/auth')
  }

  return {
    ...session,
    currentUser
  }
}

export const getCurrentUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/auth')
  }

  const userId = session.session.userId

  return {
    ...session,
    userId
  }
}

export async function getUserDetails(id: string) {
  const userDetails = await db.select().from(user).where(eq(user.id, id))

  return userDetails[0]
}
