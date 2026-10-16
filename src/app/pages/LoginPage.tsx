import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loginSchema } from '../../shared'
import { useAuth, errorMessage } from '../../api/AuthContext'
import { Button, Card, Container, Field, Input, StatusMessage, useDocumentTitle } from '../ui'

type FormValues = { email: string; password: string }

export default function LoginPage() {
  useDocumentTitle('Log in')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'We could not sign you in'))
    }
  })

  return (
    <Container className="flex justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-3xl text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/70">Sign in to keep building your surprises.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          {error && <StatusMessage tone="error">{error}</StatusMessage>}

          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
          </Field>

          <Field label="Password" error={errors.password?.message} required>
            <Input type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
          </Field>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-romantic hover:underline">
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          New here?{' '}
          <Link to="/register" className="font-medium text-romantic hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </Container>
  )
}
