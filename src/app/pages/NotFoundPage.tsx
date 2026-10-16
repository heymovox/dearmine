import { Link } from 'react-router-dom'
import { Container, LinkButton, useDocumentTitle } from '../ui'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-display text-6xl text-romantic">404</p>
      <h1 className="font-display text-3xl text-ink">We could not find that page</h1>
      <p className="max-w-md text-sm text-ink/70">
        The link may be broken, or the surprise you are looking for may have been unpublished.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <LinkButton to="/">Back home</LinkButton>
        <Link to="/templates" className="text-sm text-romantic hover:underline">
          Browse templates
        </Link>
      </div>
    </Container>
  )
}
