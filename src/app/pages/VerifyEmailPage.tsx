import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../api/client'
import { errorMessage, useAuth } from '../../api/AuthContext'
import { Card, Container, LinkButton, Spinner, StatusMessage, useDocumentTitle } from '../ui'

export default function VerifyEmailPage() {
  useDocumentTitle('Verify your email')
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const { refresh } = useAuth()
  const [state, setState] = useState<'working' | 'done' | 'error'>('working')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('This verification link is incomplete.')
      return
    }
    let cancelled = false
    void (async () => {
      try {
        await api.post('/auth/verify-email', { token })
        if (cancelled) return
        await refresh()
        setState('done')
      } catch (err) {
        if (cancelled) return
        setMessage(errorMessage(err, 'We could not verify this link'))
        setState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, refresh])

  return (
    <Container className="flex justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <h1 className="font-display text-3xl text-ink">Email verification</h1>
        {state === 'working' && <Spinner label="Verifying your email…" />}
        {state === 'done' && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <StatusMessage tone="success">Your email is verified. Thank you!</StatusMessage>
            <LinkButton to="/dashboard">Go to your dashboard</LinkButton>
          </div>
        )}
        {state === 'error' && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <StatusMessage tone="error">{message}</StatusMessage>
            <Link to="/dashboard" className="text-sm text-romantic hover:underline">
              Continue to dashboard
            </Link>
          </div>
        )}
      </Card>
    </Container>
  )
}
