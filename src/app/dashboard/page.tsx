import { auth } from '@/lib/auth'
import { getOrganizations } from '@/server-actions/organizations'
import { headers } from 'next/headers'
import { db } from '@/db'
import { count } from 'drizzle-orm'

import { EmptyState } from '@/components/shared/empty-state'
import { AddOrganizationButton } from './_components/add-organization-button'
import { Suspense } from 'react'
import { SkeletonArray } from '@/components/shared/skeleton'
import { SkeletonCustomerCard } from '@/components/shared/skeleton-customer-card'
import OrganizationsTable from './_components/organizations-table'
import { organization } from '@/db/schema'

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

  type Result = { count: number }
  const dbCount = await db.select({ count: count() }).from(organization)

  const arr: Result[] = dbCount

  const total: number = arr.reduce((sum, result) => sum + result.count, 0)

  if (organizations.length === 0) {
    return (
      <>
        <div className='mx-auto mt-24 flex max-w-6xl flex-col gap-2'>
          <EmptyState
            title='Organizations'
            description='You have no organizations yet. Click on the button below to create your first organization'
          />
        </div>

        <div className='- mt-12 flex w-full justify-center'>
          <AddOrganizationButton />
        </div>
      </>
    )
  }
  return (
    <>
      <div className='container mx-auto max-w-2xl py-10'>
        <Suspense
          fallback={
            <SkeletonArray amount={3}>
              <SkeletonCustomerCard />
            </SkeletonArray>
          }
        >
          <OrganizationsTable organizations={organizations} total={total} />
        </Suspense>
      </div>
    </>
  )
}
