'use client'

import { startTransition, useState } from 'react'

import { DataTable } from '@/components/table-components/data-table'

import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import { Trash2 } from 'lucide-react'

import { AddCategoryButton } from './add-category-button'
import { User } from '@/db/schema/auth-schema'

import { EmptyState } from '@/components/shared/empty-state'
import { Category, columns } from './columns'
import { deleteCategory } from '@/server-actions/categories'
import ConfirmationDialog from '@/components/shared/confirmation-dialog'

type Props = {
  data: {
    id: number
    name: string
  }[]
  total: number
  user: User
}

export default function CategoriesTable({ data, total, user }: Props) {
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
  const [itemToAction, setItemToAction] = useState<Category>()

  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleRowDelete = (item: Category) => {
    setOpenConfirmationDialog(true)
    setItemToAction(item)
  }

  const handleRowEdit = (item: Category) => {
    setItemToAction(item)
    setOpen(true)
  }

  const handleConfirm = async () => {
    setOpenConfirmationDialog(false)

    if (itemToAction) {
      startTransition(async () => {
        await deleteCategory(itemToAction.id, pathname)
      })

      toast.error(`Category ${itemToAction.name} deleted`, {
        description: '',
        duration: 5000,
        icon: <Trash2 className='size-4 text-red-500' />
      })
    }
  }

  if (total === 0) {
    return (
      <>
        <div className='mx-auto flex max-w-6xl flex-col gap-2'>
          <EmptyState
            title='Categories'
            description='You have no categories yet. Click on the button below to create your first category'
          />
        </div>

        <div className='- mt-12 flex w-full justify-center'>
          <AddCategoryButton user={user} />
        </div>
      </>
    )
  }

  return (
    <div className='container mx-auto my-12 max-w-6xl'>
      <div className='mb-16 flex w-full items-center justify-between border-b border-blue-500 pb-4'>
        <span className='text-3xl font-bold'>Categories </span>

        <AddCategoryButton user={user} />
      </div>
      <DataTable
        data={data}
        columns={columns}
        onRowDelete={handleRowDelete}
        onRowEdit={handleRowEdit}
      />

      <ConfirmationDialog
        message='This action cannot be undone. This will permanently delete the
            category and remove your data from our servers.'
        open={openConfirmationDialog}
        onClose={() => setOpenConfirmationDialog(false)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
