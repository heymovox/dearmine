import { Link } from 'react-router-dom'
import { Heart, PenLine, Send, Sparkles } from 'lucide-react'
import { BRAND, OCCASIONS, formatINRShort } from '../../shared'
import { usePlans, useTemplates } from '../../api/hooks'
import Reveal from '../../components/Reveal'
import TemplateCard from '../components/TemplateCard'
import { Card, Container, LinkButton, Spinner, useDocumentTitle } from '../ui'
const STEPS = [
  {
    icon: Sparkles,
    title: 'Pick a design',
    body: 'Choose from 40 romantic templates — birthdays, anniversaries, proposals and more.',
  },
  {
    icon: PenLine,
    title: 'Make it personal',
    body: 'Add your photos, your words, a letter and even background music. Preview it live.',
  },
  {
    icon: Send,
    title: 'Share the link',
    body: 'Publish and send one private link. No app for them to install — it just opens.',
  },
]

export default function LandingPage() {
  useDocumentTitle('')
  const featured = useTemplates({ featured: true })
  const plans = usePlans()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-burgundy">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(215,160,167,0.28),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(181,40,77,0.35),transparent_55%)]" />
        <Container className="relative grid gap-10 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-cream/90">
              <Heart className="h-3.5 w-3.5 text-rose-gold" aria-hidden />
              {BRAND.tagline}
            </span>
            <h1 className="font-display text-hero text-cream">
              Turn your feelings into a{' '}
              {/* Caveat has a small x-height, so it is nudged up in size to sit
                  optically level with the serif lead-in at hero scale. */}
              <span className="font-hand text-[1.08em] leading-[1.05] text-rose-gradient">website made just for them</span>
            </h1>
            <p className="max-w-xl text-base text-cream/80">{BRAND.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton to="/register" size="lg">
                Create your surprise
              </LinkButton>
              <LinkButton to="/templates" variant="outline" size="lg" className="border-white/30 bg-white/10 text-cream hover:bg-white/20">
                Browse templates
              </LinkButton>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-cream/70">
              <span>No app needed</span>
              <span>Create free, pay to publish</span>
              <span>Hosted for up to 2 years</span>
            </div>
          </div>

          <div className="relative">
            <div className="rotate-2 rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <div className="overflow-hidden rounded-[1.5rem] bg-burgundy-deep">
                <img
                  src="/images/photo-placeholder.svg"
                  alt="Example of a personalized surprise website"
                  className="h-72 w-full object-cover sm:h-96"
                  loading="lazy"
                />
              </div>
              <p className="px-2 py-2 text-center text-xs text-cream/70">
                Example preview — your own photos and words go here.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Occasions */}
      <section className="border-b border-burgundy/10 bg-cream">
        <Container className="flex flex-wrap items-center justify-center gap-3 py-8">
          <span className="text-sm text-ink/60">Made for every occasion:</span>
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion.key}
              to={`/templates?occasion=${occasion.key}`}
              className="rounded-full border border-burgundy/15 bg-white px-4 py-1.5 text-sm text-ink/80 transition-colors hover:border-romantic/40 hover:text-romantic"
            >
              {occasion.label}
            </Link>
          ))}
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-cream py-20">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-display text-ink">Three steps, one unforgettable link</h2>
              <p className="mt-3 text-sm text-ink/70">
                You do not need design skills. Pick a template, type your words, and we handle the rest.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <Card className="h-full">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-romantic/12 text-romantic">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-xl text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-ink/70">{step.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured templates */}
      <section className="bg-white py-20">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-display text-ink">Featured templates</h2>
              <p className="mt-2 text-sm text-ink/70">A few favourites from the collection of 40.</p>
            </div>
            <Link to="/templates" className="text-sm font-medium text-romantic hover:underline">
              See all templates →
            </Link>
          </div>

          {featured.isLoading ? (
            <Spinner label="Loading templates…" />
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(featured.data ?? []).slice(0, 6).map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Pricing teaser */}
      <section className="bg-cream py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-display text-ink">Simple, one-time pricing</h2>
            <p className="mt-3 text-sm text-ink/70">
              Create and preview for free. Pay once when you are ready to share.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(plans.data ?? []).map((plan) => (
              <Card key={plan.id} className={plan.isFeatured ? 'border-romantic/40 ring-2 ring-romantic/20' : ''}>
                <h3 className="font-display text-2xl text-ink">{plan.name}</h3>
                <p className="mt-1 text-3xl font-semibold text-romantic">{formatINRShort(plan.pricePaise)}</p>
                <p className="mt-2 text-sm text-ink/70">{plan.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-ink/80">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-gold" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <LinkButton to="/pricing" variant="secondary">
              Compare plans
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-burgundy py-20">
        <Container className="text-center">
          <h2 className="font-display text-display text-cream">
            Someone you love deserves this today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cream/80">
            Start with a free account. You can build the whole surprise before deciding on a plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton to="/register" size="lg">
              Get started free
            </LinkButton>
            <LinkButton to="/demo" variant="outline" size="lg" className="border-white/30 bg-white/10 text-cream hover:bg-white/20">
              See a live example
            </LinkButton>
          </div>
        </Container>
      </section>
    </div>
  )
}
