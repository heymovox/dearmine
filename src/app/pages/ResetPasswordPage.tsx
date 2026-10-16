import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { z } from 'zod'
import { passwordSchema } from '../../shared'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { Button, Card, Container, Field, Input, StatusMessage, useDocumentTitle } from '../ui'

const formSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })

type FormValues = z.infer<typeof formSchema>

export default function ResetPasswordPage() {
  useDocumentTitle('Set a new password')
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { password: '', confirm: '' } })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await api.post('/auth/reset-password', { token, password: values.password })
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (err) {
      setError(errorMessage(err, 'We could not reset your password'))
    }
  })

  if (!token) {
    return (
      <Container className="flex justify-center py-16">
        <Card className="w-full max-w-md">
          <h1 className="font-display text-2xl text-ink">This link is incomplete</h1>
          <p className="mt-2 text-sm text-ink/70">
            Request a new reset link to continue.
          </p>
          <Link to="/forgot-password" className="mt-4 inline-block font-medium text-romantic hover:underline">
            Request a new link
          </Link>
        </Card>
      </Container>
    )
  }

  return (
    <Container className="flex justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-3xl text-ink">Set a new password</h1>
        <p className="mt-1 text-sm text-ink/70">Choose something you have not used before.</p>

        {done ? (
          <div className="mt-6">
            <StatusMessage tone="success">
              Your password has been updated. Taking you to sign in…
            </StatusMessage>
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            {error && <StatusMessage tone="error">{error}</StatusMessage>}
            <Field label="New password" hint="At least 8 characters" error={errors.password?.message} required>
              <Input type="password" autoComplete="new-password" {...register('password')} />
            </Field>
            <Field label="Confirm password" error={errors.confirm?.message} required>
              <Input type="password" autoComplete="new-password" {...register('confirm')} />
            </Field>
            <Button type="submit" loading={isSubmitting} className="w-full">
              Update password
            </Button>
          </form>
        )}
      </Card>
    </Container>
  )
}
