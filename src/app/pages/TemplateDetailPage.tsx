import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Heart } from 'lucide-react'
import {
  OCCASIONS,
  PALETTES,
  TEMPLATE_CATALOG,
  exampleContent,
  getPalette,
  getTemplateByComponentKey,
  occasionLabel,
} from '../../shared'
import { previewPhotosFor } from '../components/previewAssets'
import { useAuth } from '../../api/AuthContext'
import { useTemplate } from '../../api/hooks'
import { api } from '../../api/client'
import type { ProjectDTO } from '../../api/types'
import { TemplateRenderer } from '../../templates'
import { Button, Container, LinkButton, Spinner, useDocumentTitle } from '../ui'

export default function TemplateDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: template, isLoading, isError } = useTemplate(slug)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [palette, setPalette] = useState<string | null>(null)
  const [occasion, setOccasion] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useDocumentTitle(template ? template.name : 'Template')

  const meta = template ? getTemplateByComponentKey(template.componentKey) : undefined
  const activePalette = palette ?? meta?.palette ?? 'midnight'
  const activeOccasion = occasion ?? template?.occasions[0] ?? 'BIRTHDAY'

  const payload = useMemo(() => {
    if (!template) return null
    const key = template.componentKey
    const photos = meta?.sections.includes('gallery') ? previewPhotosFor(key) : []
    return {
      templateKey: key,
      templateSlug: template.slug,
      content: exampleContent(activeOccasion as never),
      design: {
        palette: activePalette,
        font: 'cormorant',
        animation: meta?.animation ?? 'balanced',
        coverPhotoId: null,
        sections: {},
      },
      assets: photos.map((url, index) => ({
        id: `preview-${index}`,
        type: 'PHOTO' as const,
        url,
        caption: '',
        sortOrder: index,
      })),
      meta: {
        title: 'Example surprise',
        recipientName: 'Alex',
        creatorName: 'Sam',
        nickname: 'A',
        occasion: activeOccasion,
        occasionDate: null,
      },
    }
  }, [template, meta, activePalette, activeOccasion])

  const useThisTemplate = async () => {
    if (!template) return
    if (!user) {
      navigate('/register', { state: { from: `/templates/${template.slug}` } })
      return
    }
    setCreating(true)
    setError(null)
    try {
      const project = await api.post<ProjectDTO>('/projects', {
        templateId: template.id,
        occasion: activeOccasion,
        projectTitle: `${template.name} for my love`,
      })
      navigate(`/editor/${project.id}`)
    } catch {
      setError('We could not start a project with this template. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (isLoading) return <Spinner label="Loading template…" />
  if (isError || !template || !payload) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-3xl text-ink">Template not found</h1>
        <div className="mt-6">
          <LinkButton to="/templates" variant="secondary">
            Back to templates
          </LinkButton>
        </div>
      </Container>
    )
  }

  const catalogEntry = TEMPLATE_CATALOG.find((t) => t.componentKey === template.componentKey)

  return (
    <div className="bg-cream pb-16">
      {/* Sticky action bar */}
      <div className="sticky top-16 z-30 border-b border-burgundy/10 bg-cream/95 backdrop-blur">
        <Container className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/templates" className="text-ink/60 hover:text-romantic" aria-label="Back to templates">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-display text-xl text-ink">{template.name}</h1>
              <p className="text-xs text-ink/60">
                {template.category.name} ·{' '}
                {template.requiredPlan === 'mini' ? 'Included free' : `Requires ${template.requiredPlan} plan`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeOccasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="rounded-full border border-burgundy/15 bg-white px-3 py-1.5 text-sm text-ink"
              aria-label="Preview occasion"
            >
              {OCCASIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button onClick={useThisTemplate} loading={creating}>
              <Heart className="h-4 w-4" aria-hidden /> Use this template
            </Button>
          </div>
        </Container>
      </div>

      <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        {/* Live preview */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-ink/50">Palette</span>
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                title={p.name}
                aria-label={`Preview with ${p.name} palette`}
                aria-pressed={activePalette === p.id}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${
                  activePalette === p.id ? 'scale-110 border-romantic' : 'border-white'
                }`}
                style={{ backgroundImage: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-3xl border border-burgundy/10 shadow-[0_20px_60px_-30px_rgba(74,16,37,0.6)]">
            <div className="max-h-[75vh] overflow-y-auto">
              <TemplateRenderer payload={payload} mode="preview" />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink/50">
            Live preview with clearly-labelled example content. Your photos and words replace these.
          </p>
        </div>

        {/* Details */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-burgundy/10 bg-white p-6">
            <h2 className="font-display text-lg text-ink">About this design</h2>
            <p className="mt-2 text-sm text-ink/75">{template.description}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Category</dt>
                <dd className="text-ink">{template.category.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Best for</dt>
                <dd className="text-right text-ink">
                  {template.occasions.map((o) => occasionLabel(o)).join(', ')}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Plan</dt>
                <dd className="text-ink">
                  {template.requiredPlan === 'mini' ? 'Any plan' : `${template.requiredPlan} or higher`}
                </dd>
              </div>
            </dl>
          </div>

          {catalogEntry && (
            <div className="rounded-3xl border border-burgundy/10 bg-white p-6">
              <h2 className="font-display text-lg text-ink">What you can add</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/75">
                {catalogEntry.sections
                  .filter((s) => !['hero', 'footer'].includes(s))
                  .slice(0, 10)
                  .map((section) => (
                    <li key={section} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-romantic" aria-hidden />
                      <span className="capitalize">{section.replace(/-/g, ' ')}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div
            className="rounded-3xl p-6 text-cream"
            style={{
              backgroundImage: `linear-gradient(135deg, ${getPalette(activePalette).colors[0]}, ${
                getPalette(activePalette).colors[1]
              })`,
            }}
          >
            <h2 className="font-display text-lg">Ready to make it yours?</h2>
            <p className="mt-1 text-sm text-cream/85">
              Create the project for free, personalise everything, and publish when it feels right.
            </p>
            <div className="mt-4">
              <Button onClick={useThisTemplate} loading={creating} className="bg-white text-burgundy hover:bg-white/90">
                Start with this template
              </Button>
            </div>
          </div>
        </aside>
      </Container>
    </div>
  )
}
