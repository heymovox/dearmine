import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { getPalette, getTemplateByComponentKey } from '../../shared'
import type { TemplateDTO } from '../../api/types'
import { Badge } from '../ui'

/** A tasteful gradient derived from the template's real palette. */
export function paletteGradient(componentKey: string): string {
  const meta = getTemplateByComponentKey(componentKey)
  const palette = getPalette(meta?.palette)
  const [ink, accent, soft] = palette.colors
  return `linear-gradient(135deg, ${ink} 0%, ${accent} 55%, ${soft} 100%)`
}

export default function TemplateCard({ template }: { template: TemplateDTO }) {
  const meta = getTemplateByComponentKey(template.componentKey)
  const planLabel = template.requiredPlan === 'mini' ? 'Free' : template.requiredPlan

  return (
    <Link
      to={`/templates/${template.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-burgundy/10 bg-white shadow-[0_10px_40px_-24px_rgba(74,16,37,0.5)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{ backgroundImage: paletteGradient(template.componentKey) }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_60%)]" />
        <span className="relative font-display text-2xl text-white/95 drop-shadow-sm">
          {template.name}
        </span>
        {template.isFeatured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[11px] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" aria-hidden /> Popular
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-ink/60">
          <span>{template.category.name}</span>
          {meta?.animation && (
            <span className="capitalize">· {meta.animation} motion</span>
          )}
        </div>
        <h3 className="font-display text-xl text-ink">{template.name}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-ink/70">{template.tagline ?? template.description}</p>
        <div className="flex items-center justify-between pt-1">
          <Badge tone={template.requiredPlan === 'mini' ? 'neutral' : 'accent'}>
            {planLabel === 'Free' ? 'Included free' : `${planLabel[0]!.toUpperCase()}${planLabel.slice(1)} plan`}
          </Badge>
          <span className="text-sm font-medium text-romantic group-hover:underline">Preview →</span>
        </div>
      </div>
    </Link>
  )
}
