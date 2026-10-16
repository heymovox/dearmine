import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { OCCASIONS } from '../../shared'
import { useCategories, useTemplates } from '../../api/hooks'
import TemplateCard from '../components/TemplateCard'
import { Container, EmptyState, Input, Spinner, useDocumentTitle } from '../ui'

export default function TemplatesPage() {
  useDocumentTitle('Templates')
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')

  const category = params.get('category') ?? undefined
  const occasion = params.get('occasion') ?? undefined

  const categories = useCategories()
  const templates = useTemplates({ category, occasion, search: search || undefined })

  const update = (key: string, value?: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl text-ink">Choose a template</h1>
        <p className="mt-2 text-sm text-ink/70">
          40 designs for birthdays, anniversaries, proposals and everything in between.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="pl-10"
              aria-label="Search templates"
            />
          </div>
          <select
            value={occasion ?? ''}
            onChange={(e) => update('occasion', e.target.value || undefined)}
            className="rounded-2xl border border-burgundy/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-romantic focus:outline-none"
            aria-label="Filter by occasion"
          >
            <option value="">All occasions</option>
            {OCCASIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update('category', undefined)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              !category ? 'bg-romantic text-cream' : 'border border-burgundy/15 bg-white text-ink/75 hover:text-romantic'
            }`}
          >
            All
          </button>
          {(categories.data ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update('category', c.slug)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                category === c.slug
                  ? 'bg-romantic text-cream'
                  : 'border border-burgundy/15 bg-white text-ink/75 hover:text-romantic'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {templates.isLoading ? (
          <Spinner label="Loading templates…" />
        ) : templates.isError ? (
          <EmptyState title="We could not load templates" description="Please refresh the page and try again." />
        ) : (templates.data ?? []).length === 0 ? (
          <EmptyState
            title="No templates match those filters"
            description="Try a different occasion or clear your search."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(templates.data ?? []).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
