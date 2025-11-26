import { auth } from '@/lib/auth'
import { getOrganizations } from '@/server-actions/organizations'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import Link from 'next/link'
import { CreateOrganizationForm } from './_components/create-organization-form'

export default async function DashboardPage() {
  const organizations = await getOrganizations()
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
    <div className='flex h-screen flex-col items-center justify-center gap-2'>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline'>Create Organization</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to get started.
            </DialogDescription>
          </DialogHeader>
          <CreateOrganizationForm />
        </DialogContent>
      </Dialog>

      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold'>Organizations</h2>
        {organizations.map(organization => (
          <Button asChild key={organization.id} variant='outline'>
            <Link href={`/dashboard/organization/${organization.slug}`}>
              {organization.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
