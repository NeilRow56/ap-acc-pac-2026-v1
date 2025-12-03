'use client'

import { Button } from '@/components/ui/button'

import { signOut } from '@/lib/sign-out'

import { useState } from 'react'

export const SignOutButton = () => {
  const [isPending] = useState(false)
  // const router = useRouter()

  // async function handleClick() {
  //   await authClient.signOut({
  //     fetchOptions: {
  //       onRequest: () => {
  //         setIsPending(true)
  //       },
  //       onResponse: () => {
  //         setIsPending(false)
  //       },
  //       onError: ctx => {
  //         toast.error(ctx.error.message)
  //       },
  //       onSuccess: () => {
  //         toast.success('You’ve logged out. See you soon!', {
  //           duration: 5000
  //         })
  //         router.push('/auth')
  //       }
  //     }
  //   })
  // }

  return (
    <Button
      onClick={() => signOut().catch(console.error)}
      size='sm'
      className='bg-red-500'
      disabled={isPending}
    >
      Sign out
    </Button>
  )
}
