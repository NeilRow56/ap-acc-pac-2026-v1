import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    return (
      <div className='p-12 text-red-500'>
        Not yet authenticated. Please check your emails and verify your account
      </div>
    )
  }
  return (
    <div className='p-12'>
      <h1>Welcome {session.user.name}</h1>
    </div>
  )
}
