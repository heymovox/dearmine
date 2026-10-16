import { Link, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { BRAND } from '../../shared'
import { usePublicPage } from '../../api/hooks'
import { ApiError } from '../../api/client'
import { TemplateRenderer } from '../../templates'
import { Button, useDocumentTitle } from '../ui'

export default function PublicSurprisePage() {
  const { publicId } = useParams<{ publicId: string }>()
  const { data, isLoading, error } = usePublicPage(publicId)

  useDocumentTitle(data?.payload?.meta?.title ? `${data.payload.meta.title}` : 'A surprise for you')

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-burgundy text-cream">
        <Heart className="h-8 w-8 animate-pulse text-rose-gold" aria-hidden />
        <p className="text-sm text-cream/80">Opening your surprise…</p>
      </div>
    )
  }

  if (error || !data) {
    const status = error instanceof ApiError ? error.status : 0
    const message =
      error instanceof ApiError
        ? error.message
        : 'This surprise could not be found.'

    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-5 bg-burgundy px-6 text-center text-cream">
        <Heart className="h-9 w-9 text-rose-gold" aria-hidden />
        <h1 className="font-display text-3xl sm:text-4xl">
          {status === 410 ? 'This surprise has ended' : 'Surprise not found'}
        </h1>
        <p className="max-w-md text-sm text-cream/80">{message}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="outline" className="border-white/30 bg-white/10 text-cream hover:bg-white/20">
              Make your own surprise
            </Button>
          </Link>
          <a href={`mailto:${BRAND.supportEmail}`} className="text-xs text-cream/70 hover:underline">
            Need help?
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-cream">
      <TemplateRenderer payload={data.payload} mode="live" />
      <div className="border-t border-burgundy/10 bg-cream py-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-ink/50 hover:text-romantic">
          <Heart className="h-3.5 w-3.5" aria-hidden />
          Made with {BRAND.name}
        </Link>
      </div>
    </div>
  )
}
