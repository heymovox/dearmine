import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Mail, MessageCircle } from 'lucide-react'
import { BRAND, formatDate, supportRequestSchema } from '../../shared'
import { api } from '../../api/client'
import { errorMessage, useAuth } from '../../api/AuthContext'
import {
  Badge,
  Button,
  Card,
  Container,
  Field,
  Input,
  Spinner,
  StatusMessage,
  Textarea,
  useDocumentTitle,
} from '../ui'
import { useSupportRequests } from '../../api/hooks'

type FormValues = { name: string; email: string; subject: string; message: string }

export default function SupportPage() {
  useDocumentTitle('Support')
  const { user } = useAuth()
  const requests = useSupportRequests()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', subject: '', message: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await api.post('/support', values)
      setSent(true)
      reset({ name: values.name, email: values.email, subject: '', message: '' })
      await requests.refetch()
    } catch (err) {
      setError(errorMessage(err, 'We could not send your message'))
    }
  })

  return (
    <Container className="grid gap-8 py-14 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-4xl text-ink">We are here to help</h1>
        <p className="mt-2 text-sm text-ink/70">
          Tell us what is happening and we will get back to you by email, usually within one working day.
        </p>

        <Card className="mt-8">
          {sent && (
            <div className="mb-4">
              <StatusMessage tone="success">
                Thank you — your message is with us. We will reply to your email shortly.
              </StatusMessage>
            </div>
          )}
          {error && (
            <div className="mb-4">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" error={errors.name?.message}>
                <Input autoComplete="name" {...register('name')} />
              </Field>
              <Field label="Email" error={errors.email?.message} required>
                <Input type="email" autoComplete="email" {...register('email')} />
              </Field>
            </div>
            <Field label="Subject" error={errors.subject?.message} required>
              <Input placeholder="How can we help?" {...register('subject')} />
            </Field>
            <Field label="Message" hint="The more detail, the faster we can help." error={errors.message?.message} required>
              <Textarea rows={6} placeholder="Describe your question or issue…" {...register('message')} />
            </Field>
            <div>
              <Button type="submit" loading={isSubmitting}>
                Send message
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <aside className="flex flex-col gap-6">
        <Card>
          <h2 className="font-display text-lg text-ink">Other ways to reach us</h2>
          <ul className="mt-3 space-y-3 text-sm text-ink/75">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-romantic" aria-hidden />
              <a href={`mailto:${BRAND.supportEmail}`} className="hover:underline">
                {BRAND.supportEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-romantic" aria-hidden />
              Typical reply time: 1 working day
            </li>
          </ul>
        </Card>

        {user && (
          <Card>
            <h2 className="font-display text-lg text-ink">Your recent requests</h2>
            {requests.isLoading ? (
              <Spinner />
            ) : (requests.data ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-ink/60">You have not contacted support yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {(requests.data ?? []).map((request) => (
                  <li key={request.id} className="rounded-2xl border border-burgundy/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink">{request.subject}</span>
                      <Badge
                        tone={
                          request.status === 'RESOLVED' || request.status === 'CLOSED'
                            ? 'success'
                            : request.status === 'OPEN'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink/50">{formatDate(request.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </aside>
    </Container>
  )
}
