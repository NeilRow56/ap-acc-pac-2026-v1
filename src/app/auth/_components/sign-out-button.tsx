'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

export const SignOutButton = () => {
  const router = useRouter()

  return (
    <Button
      className='cursor-pointer bg-blue-600'
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success('You’ve logged out. See you soon!')
              router.push('/auth')
            }
          }
        })
      }
    >
      Sign out
    </Button>
  )
}
