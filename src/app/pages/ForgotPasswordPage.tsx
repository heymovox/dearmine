import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { forgotPasswordSchema } from '../../shared'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { Button, Card, Container, Field, Input, StatusMessage, useDocumentTitle } from '../ui'

type FormValues = { email: string }

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset your password')
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      const res = await api.post<{ ok: boolean; devResetToken?: string }>('/auth/forgot-password', values)
      setDevToken(res.devResetToken ?? null)
      setSent(true)
    } catch (err) {
      setError(errorMessage(err, 'We could not send that email'))
    }
  })

  return (
    <Container className="flex justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-3xl text-ink">Forgot your password?</h1>
        <p className="mt-1 text-sm text-ink/70">
          Enter your email and we will send you a secure link to set a new one.
        </p>

        {sent ? (
          <div className="mt-6 flex flex-col gap-4">
            <StatusMessage tone="success">
              If an account exists for that email, a reset link is on its way.
            </StatusMessage>
            {devToken && (
              <StatusMessage tone="info">
                Development mode: no email was sent.{' '}
                <Link to={`/reset-password?token=${devToken}`} className="font-medium text-romantic underline">
                  Continue to reset your password
                </Link>
              </StatusMessage>
            )}
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            {error && <StatusMessage tone="error">{error}</StatusMessage>}
            <Field label="Email" error={errors.email?.message} required>
              <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
            </Field>
            <Button type="submit" loading={isSubmitting} className="w-full">
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink/70">
          <Link to="/login" className="font-medium text-romantic hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </Container>
  )
}
