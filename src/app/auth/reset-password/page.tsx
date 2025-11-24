import { Suspense } from 'react'
import { ResetPasswordForm } from './_components/reset-password-form'

import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import Loader from '@/components/shared/loader'

export default function ResetPasswordPage() {
  return (
    <div className='mt-12 flex items-center justify-center'>
      <Suspense fallback={<Loader />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
