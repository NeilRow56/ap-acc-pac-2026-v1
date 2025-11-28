'use client'

import { zodResolver } from '@hookform/resolvers/zod'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

import { authClient } from '@/lib/auth-client'
import { FormInput } from '@/components/form/form-base'
import { LoadingSwap } from '@/components/shared/loading-swap'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50)
})

export function CreateOrganizationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: ''
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      await authClient.organization.create({
        name: values.name,
        slug: values.slug
      })

      toast.success('Organization created successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to create organization')
    } finally {
      setIsLoading(false)
      router.push('/dashboard')
    }
  }

  return (
    <Card className='mx-auto w-full border-red-200 sm:max-w-md'>
      <CardHeader className='text-center'>
        <CardTitle>Welcome to WpAccPac!</CardTitle>
        <CardDescription>Create your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id='create-organization-form'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <FormInput control={form.control} name='name' label='Name' />
            <FormInput control={form.control} name='slug' label='Slug' />
            <p className='text-muted-foreground/70 text-sm'>
              Create a slug by retyping the organization name in lowercase with
              no spaces. e.g. smithpartnership
            </p>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className=''>
        <Field orientation='horizontal' className='justify-between'>
          <Button
            type='submit'
            form='create-organization-form'
            className='w-full max-w-[150px] cursor-pointer dark:bg-blue-600 dark:text-white'
            disabled={isLoading}
          >
            <LoadingSwap isLoading={isLoading}>Create</LoadingSwap>
          </Button>
          <Button
            className='border-red-500'
            type='button'
            form='create-organization-form'
            variant='outline'
            onClick={() => form.reset()}
          >
            Reset
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
