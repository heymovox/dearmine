import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  CreditCard,
  Gift,
  Heart,
  Link2,
  Music,
  Palette,
  PenLine,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { BRAND } from '../../shared'
import { Card, Container, LinkButton, PageHeader, useDocumentTitle } from '../ui'

const STEPS = [
  {
    icon: Sparkles,
    title: 'Pick a design',
    body: 'Choose from 40 romantic templates across birthdays, anniversaries, proposals and everyday moments. Every one is fully editable.',
  },
  {
    icon: PenLine,
    title: 'Make it personal',
    body: 'Add your photos, names, a letter and background music. Preview every change live, on mobile, before you pay a single rupee.',
  },
  {
    icon: CreditCard,
    title: 'Pay once',
    body: 'When you are happy with the preview, pick a plan and pay a single time. No subscription, no monthly bill.',
  },
  {
    icon: Send,
    title: 'Share the link',
    body: 'Publish and send one private link. It opens instantly in any browser — nothing for them to install or sign up for.',
  },
]

const FEATURES = [
  { icon: Palette, title: 'Themes & colours', body: 'Switch palettes, fonts and animations to match the moment.' },
  { icon: Gift, title: 'Photos & letters', body: 'Upload memories, write a letter, and set the reveal moment.' },
  { icon: Music, title: 'Background music', body: 'Add a song that plays softly as they scroll.' },
  { icon: Heart, title: 'Built for feelings', body: 'Careful typography, soft motion and no distractions.' },
  { icon: ShieldCheck, title: 'Private by default', body: 'Unpublished surprises stay private. Only your link opens them.' },
  { icon: Link2, title: 'Works everywhere', body: 'Optimised for phones first, because that is where it gets opened.' },
]

const FAQ = [
  {
    q: 'Do I need to pay before I can preview?',
    a: 'No. Build, edit and preview the whole surprise for free. You only pay when you are ready to publish and share the link.',
  },
  {
    q: 'Can I change the design after paying?',
    a: 'Yes. Every plan includes revisions, so you can keep updating the words and photos for the whole hosting period.',
  },
  {
    q: 'What happens to my surprise after the plan ends?',
    a: 'The link stops serving the page and shows a gentle expiry message. Your draft is always kept in your account, ready to renew.',
  },
  {
    q: 'Is it safe to share photos of my partner?',
    a: 'The link is unguessable and only works for people who have it. You control when it goes live, and you can unpublish at any time.',
  },
]

export default function HowItWorksPage() {
  useDocumentTitle('How it works')

  return (
    <>
      <section className="bg-cream py-16">
        <Container>
          <PageHeader
            title="How it works"
            description="From a blank page to a link they will keep forever — four steps, about ten minutes."
            actions={
              <>
                <LinkButton to="/templates" variant="secondary">
                  Browse templates
                </LinkButton>
                <LinkButton to="/register" variant="primary">
                  Create your surprise
                </LinkButton>
              </>
            }
          />

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Card className="h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-romantic">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-rose-gold">
                    Step {i + 1}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-ink">{step.title}</h2>
                  <p className="mt-2 text-sm text-ink/70">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-cream-deep py-16">
        <Container>
          <h2 className="font-display text-display text-ink">Everything included</h2>
          <p className="mt-3 max-w-2xl text-sm text-ink/70">
            Every template comes with the same toolkit. What changes is the mood.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <feature.icon className="h-5 w-5 text-romantic" aria-hidden />
                <h3 className="mt-3 font-display text-lg text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-ink/70">{feature.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container className="max-w-3xl">
          <h2 className="font-display text-display text-ink">Questions people ask</h2>
          <div className="mt-8 space-y-4">
            {FAQ.map((item) => (
              <Card key={item.q}>
                <h3 className="flex items-start gap-2 font-display text-lg text-ink">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-romantic" aria-hidden />
                  {item.q}
                </h3>
                <p className="mt-2 pl-6 text-sm text-ink/70">{item.a}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-burgundy py-16">
        <Container className="text-center">
          <h2 className="font-display text-display text-cream">Ready when you are</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cream/80">
            Build it free, preview everything, and pay only when it is exactly right.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton to="/register" variant="primary">
              Create Surprise
            </LinkButton>
            <LinkButton to="/pricing" variant="outline">
              See pricing
            </LinkButton>
          </div>
          <p className="mt-6 text-xs text-cream/70">
            Questions?{' '}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline hover:text-cream">
              {BRAND.supportEmail}
            </a>{' '}
            or{' '}
            <Link to="/support" className="underline hover:text-cream">
              visit support
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  )
}