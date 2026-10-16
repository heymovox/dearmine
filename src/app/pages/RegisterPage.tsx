import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { registerSchema } from '../../shared'
import { useAuth, errorMessage } from '../../api/AuthContext'
import { Button, Card, Container, Field, Input, StatusMessage, useDocumentTitle } from '../ui'

type FormValues = { name: string; email: string; password: string; acceptTerms: boolean }

export default function RegisterPage() {
  useDocumentTitle('Create your account')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', acceptTerms: false },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      const res = await registerUser(values.name, values.email, values.password)
      navigate(res.devVerifyToken ? `/verify-email?token=${res.devVerifyToken}` : '/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'We could not create your account'))
    }
  })

  return (
    <Container className="flex justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-3xl text-ink">Start your first surprise</h1>
        <p className="mt-1 text-sm text-ink/70">Free to create and preview. Pay only when you publish.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          {error && <StatusMessage tone="error">{error}</StatusMessage>}

          <Field label="Your name" error={errors.name?.message} required>
            <Input autoComplete="name" placeholder="Your name" {...register('name')} />
          </Field>

          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
          </Field>

          <Field
            label="Password"
            hint="At least 8 characters"
            error={errors.password?.message}
            required
          >
            <Input type="password" autoComplete="new-password" placeholder="••••••••" {...register('password')} />
          </Field>

          <label className="flex items-start gap-2 text-sm text-ink/80">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-burgundy/30" {...register('acceptTerms')} />
            <span>
              I agree to use LoveSurprise responsibly and to only share photos and words I have the right to use.
            </span>
          </label>
          {errors.acceptTerms && <span className="text-xs font-medium text-red-600">{errors.acceptTerms.message}</span>}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-romantic hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </Container>
  )
}
