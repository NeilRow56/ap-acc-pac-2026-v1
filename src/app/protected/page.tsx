// import { ReturnButton } from '@/components/shared/return-button'
// import { UserTable } from '@/components/users/user-table'
// import { auth } from '@/lib/auth'
// import { headers } from 'next/headers'
// import { redirect } from 'next/navigation'
// import React from 'react'

// export default async function AdministratorPage() {
//   const session = await auth.api.getSession({
//     headers: await headers()
//   })

//   if (!session) redirect('/auth/sign-in')
//   return (
//     <div>
//       {session.user.email === 'admin@wpaccpac.org' ? (
//         <div className='container mx-auto max-w-5xl space-y-8 px-8 py-16'>
//           <div className='space-y-4'>
//             <ReturnButton href='/profile' label='Profile' />

//             <h1 className='text-3xl font-bold'>Admin - User Table</h1>

//             <p className='rounded-md bg-green-600 p-2 text-lg font-bold text-white'>
//               ACCESS GRANTED
//             </p>
//           </div>

//           <div className='w-full overflow-x-auto'>
//             <UserTable />
//           </div>
//         </div>
//       ) : (
//         <div className='container mx-auto max-w-5xl space-y-8 px-8 py-16'>
//           <div className='space-y-4'>
//             <ReturnButton href='/profile' label='Profile' />

//             <h1 className='text-3xl font-bold'>Admin - User Table</h1>

//             <p className='rounded-md bg-red-600 p-2 text-lg font-bold text-white'>
//               FORBIDDEN
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { ArrowLeftIcon } from 'lucide-react'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignOutButton } from '../auth/_components/sign-out-button'

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect('/auth')

  const role = session.user.role

  return (
    <div className='container mx-auto max-w-5xl space-y-8 px-8 py-16'>
      <div className='space-y-4'>
        <Button size='icon' asChild>
          <Link href='/'>
            <ArrowLeftIcon />
          </Link>
        </Button>
        <h1 className='text-3xl font-bold'>Profile</h1>
        <div className='flex items-center gap-2'>
          {session.user.role === 'admin' && (
            <Button size='sm' asChild>
              <Link href='/dashboard'>Admin Dashboard</Link>
            </Button>
          )}

          <SignOutButton />
        </div>

        {session.user.image ? (
          <Image
            src={session.user.image}
            alt='User Image'
            className='border-primary size-24 rounded-md border object-cover'
          />
        ) : (
          <div className='border-primary bg-primary text-primary-foreground flex size-24 items-center justify-center rounded-md border'>
            <span className='text-lg font-bold uppercase'>
              {session.user.name.slice(0, 2)}
            </span>
          </div>
        )}

        <pre className='overflow-clip text-sm'>
          {JSON.stringify(session, null, 2)}
        </pre>
        <div className='space-y-4 rounded-b-md border border-t-8 border-blue-600 p-4'>
          <h2 className='text-2xl font-bold'>Update User</h2>
          Update user form
        </div>
      </div>
      <div>User Role: {role}</div>
    </div>
  )
}
