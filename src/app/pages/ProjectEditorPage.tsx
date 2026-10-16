import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  Music,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react'
import {
  FONT_OPTIONS,
  OCCASIONS,
  PALETTES,
  UPLOAD_LIMITS,
  buildShareMessage,
  whatsappShareUrl,
  type DesignConfig,
  type RenderPayload,
  type SurpriseContent,
} from '../../shared'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import {
  deleteProjectAsset,
  reorderProjectAssets,
  updateProjectAsset,
  uploadProjectAsset,
} from '../../api/uploads'
import { useProject } from '../../api/hooks'
import { TemplateRenderer } from '../../templates'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  LinkButton,
  Select,
  Spinner,
  StatusMessage,
  Textarea,
  useDocumentTitle,
  useToast,
} from '../ui'

type Tab = 'content' | 'photos' | 'design' | 'details'
type Draft = {
  projectTitle: string
  occasion: string
  recipientName: string
  creatorName: string
  nickname: string
  occasionDate: string
  content: SurpriseContent
  design: DesignConfig
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'content', label: 'Words' },
  { id: 'photos', label: 'Photos & music' },
  { id: 'design', label: 'Design' },
  { id: 'details', label: 'Details' },
]

function toDateInput(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`
}

function fromDateInput(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export default function ProjectEditorPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const projectQuery = useProject(projectId)
  const queryClient = useQueryClient()
  const toast = useToast()

  const [tab, setTab] = useState<Tab>('content')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publishProblems, setPublishProblems] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const dirtyRef = useRef(false)

  const project = projectQuery.data

  useDocumentTitle(project ? `${project.title} — Editor` : 'Editor')

  useEffect(() => {
    if (!project) return
    setDraft({
      projectTitle: project.title,
      occasion: project.occasion,
      recipientName: project.recipientName,
      creatorName: project.creatorName,
      nickname: project.nickname,
      occasionDate: toDateInput(project.occasionDate),
      content: project.content,
      design: project.design,
    })
    dirtyRef.current = false
  }, [project])

  const save = useCallback(
    async (silent = false) => {
      if (!project || !draft) return
      setSaving(true)
      setError(null)
      try {
        await api.patch(`/projects/${project.id}`, {
          projectTitle: draft.projectTitle,
          occasion: draft.occasion,
          recipientName: draft.recipientName,
          creatorName: draft.creatorName,
          nickname: draft.nickname,
          occasionDate: fromDateInput(draft.occasionDate),
          content: draft.content,
          design: draft.design,
        })
        dirtyRef.current = false
        setSavedAt(new Date())
        await queryClient.invalidateQueries({ queryKey: ['projects'] })
        if (!silent) toast.push('Saved', 'success')
      } catch (err) {
        setError(errorMessage(err, 'We could not save your changes'))
      } finally {
        setSaving(false)
      }
    },
    [project, draft, queryClient, toast],
  )

  const update = (patch: Partial<Draft>, content?: Partial<SurpriseContent>, design?: Partial<DesignConfig>) => {
    dirtyRef.current = true
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        ...patch,
        content: content ? { ...prev.content, ...content } : prev.content,
        design: design ? { ...prev.design, ...design } : prev.design,
      }
    })
  }

  // Debounced autosave.
  useEffect(() => {
    if (!dirtyRef.current || !draft) return
    const timer = setTimeout(() => {
      void save(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [draft, save])

  const payload: RenderPayload | null = useMemo(() => {
    if (!project || !draft) return null
    return {
      templateKey: project.template.componentKey,
      templateSlug: project.template.slug,
      content: draft.content,
      design: draft.design,
      assets: project.assets,
      meta: {
        title: draft.projectTitle,
        recipientName: draft.recipientName,
        creatorName: draft.creatorName,
        nickname: draft.nickname,
        occasion: draft.occasion,
        occasionDate: fromDateInput(draft.occasionDate),
      },
    }
  }, [project, draft])

  const publish = async () => {
    if (!project) return
    setPublishing(true)
    setPublishProblems([])
    try {
      await save(true)
      await api.post(`/projects/${project.id}/publish`)
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] })
      toast.push('Your surprise is live', 'success')
    } catch (err) {
      const message = errorMessage(err, 'We could not publish your surprise')
      setPublishProblems([message])
    } finally {
      setPublishing(false)
    }
  }

  const unpublish = async () => {
    if (!project) return
    if (!window.confirm('Take this surprise offline? The link will stop working.')) return
    try {
      await api.post(`/projects/${project.id}/unpublish`)
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] })
      toast.push('Surprise taken offline', 'success')
    } catch {
      toast.push('We could not take it offline', 'error')
    }
  }

  const upload = async (files: FileList | null, assetType: 'PHOTO' | 'AUDIO') => {
    if (!files || !project) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const limit = assetType === 'AUDIO' ? UPLOAD_LIMITS.maxAudioBytes : UPLOAD_LIMITS.maxPhotoBytes
        if (file.size > limit) {
          throw new Error(`${file.name} is too large (max ${Math.round(limit / 1024 / 1024)} MB)`)
        }
        await uploadProjectAsset(project.id, file, assetType)
      }
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] })
      toast.push('Upload complete', 'success')
    } catch (err) {
      setError(errorMessage(err, 'One or more files could not be uploaded'))
    } finally {
      setUploading(false)
    }
  }

  const removeAsset = async (assetId: string) => {
    if (!project) return
    try {
      await deleteProjectAsset(project.id, assetId)
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] })
    } catch {
      toast.push('We could not remove that file', 'error')
    }
  }

  const setCaption = async (assetId: string, caption: string) => {
    if (!project) return
    try {
      await updateProjectAsset(project.id, assetId, { caption })
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] })
    } catch {
      toast.push('We could not save that caption', 'error')
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    if (!project) return
    const photos = project.assets.filter((a) => a.type !== 'AUDIO')
    const target = index + direction
    if (target < 0 || target >= photos.length) return
    const swapped = [...photos]
    const a = swapped[index]!
    const b = swapped[target]!
    swapped[index] = b
    swapped[target] = a
    try {
      await reorderProjectAssets(
        project.id,
        swapped.map((p) => p.id),
      )
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] })
    } catch {
      toast.push('We could not reorder the photos', 'error')
    }
  }

  if (projectQuery.isLoading) return <Spinner label="Loading your surprise…" />
  if (projectQuery.isError || !project || !draft || !payload) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
        <h1 className="font-display text-3xl text-ink">We could not open this surprise</h1>
        <LinkButton to="/dashboard/projects" variant="secondary">
          Back to my surprises
        </LinkButton>
      </div>
    )
  }

  const photos = project.assets.filter((a) => a.type !== 'AUDIO')
  const audio = project.assets.filter((a) => a.type === 'AUDIO')
  const publicUrl =
    project.published && project.published.status === 'ACTIVE'
      ? `${window.location.origin}${project.published.url}`
      : null
  const supported = new Set(project.template.supportedFields)

  return (
    <div className="min-h-[100dvh] bg-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-burgundy/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/projects" className="text-ink/60 hover:text-romantic" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <input
                value={draft.projectTitle}
                onChange={(e) => update({ projectTitle: e.target.value })}
                className="w-full max-w-xs truncate rounded-lg border border-transparent bg-transparent px-1 font-display text-xl text-ink hover:border-burgundy/15 focus:border-romantic focus:outline-none"
                aria-label="Project title"
              />
              <p className="px-1 text-xs text-ink/50">
                {project.template.name}
                {savedAt ? ` · saved ${savedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {project.published?.status === 'ACTIVE' && <Badge tone="success">Live</Badge>}
            <Button variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)} className="lg:hidden">
              <Eye className="h-4 w-4" aria-hidden /> Preview
            </Button>
            <Button variant="outline" size="sm" loading={saving} onClick={() => void save()}>
              <Save className="h-4 w-4" aria-hidden /> Save
            </Button>
            {project.published?.status === 'ACTIVE' ? (
              <>
                <a
                  href={project.published.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-burgundy/20 px-3 py-1.5 text-sm text-ink hover:bg-blush/40"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open
                </a>
                <Button variant="ghost" size="sm" onClick={() => void unpublish()}>
                  Unpublish
                </Button>
              </>
            ) : (
              <Button size="sm" loading={publishing} onClick={() => void publish()}>
                <Send className="h-3.5 w-3.5" aria-hidden /> Publish
              </Button>
            )}
          </div>
        </div>
        {publishProblems.length > 0 && (
          <div className="mx-auto w-full max-w-[1500px] px-4 pb-3 sm:px-6">
            <StatusMessage tone="warning">
              <p className="font-medium">Before you can publish:</p>
              <ul className="mt-1 list-disc pl-5">
                {publishProblems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </StatusMessage>
          </div>
        )}
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        {/* Editor column */}
        <div className="min-w-0">
          {/* Share panel */}
          {publicUrl && (
            <Card className="mb-6">
              <h2 className="font-display text-lg text-ink">Share your surprise</h2>
              <p className="mt-1 text-sm text-ink/60">
                Anyone with this link can open it until{' '}
                {project.published?.expiresAt
                  ? new Date(project.published.expiresAt).toLocaleDateString('en-IN')
                  : 'your plan expires'}
                .
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  value={publicUrl}
                  className="flex-1 rounded-2xl border border-burgundy/15 bg-white px-4 py-2.5 text-sm text-ink"
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void navigator.clipboard.writeText(publicUrl)
                      toast.push('Link copied', 'success')
                    }}
                  >
                    <Copy className="h-4 w-4" aria-hidden /> Copy
                  </Button>
                  <a href={whatsappShareUrl(publicUrl, buildShareMessage(publicUrl))} target="_blank" rel="noreferrer">
                    <Button variant="outline">WhatsApp</Button>
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <div className="mb-4 flex flex-wrap gap-1 rounded-2xl border border-burgundy/10 bg-white/80 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                  tab === t.id ? 'bg-romantic text-cream' : 'text-ink/75 hover:bg-blush/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          )}

          {tab === 'content' && (
            <div className="flex flex-col gap-5">
              <Card className="flex flex-col gap-4">
                <h2 className="font-display text-lg text-ink">The words</h2>
                {supported.has('title') && (
                  <Field label="Title line" hint="Shown big at the top of the page.">
                    <Input
                      value={draft.content.title}
                      onChange={(e) => update({}, { title: e.target.value })}
                      placeholder="Happy birthday, my love"
                    />
                  </Field>
                )}
                {supported.has('openingMessage') && (
                  <Field label="Opening greeting">
                    <Input
                      value={draft.content.openingMessage}
                      onChange={(e) => update({}, { openingMessage: e.target.value })}
                      placeholder="Hey you…"
                    />
                  </Field>
                )}
                {supported.has('mainMessage') && (
                  <Field label="Main message">
                    <Textarea
                      rows={5}
                      value={draft.content.mainMessage}
                      onChange={(e) => update({}, { mainMessage: e.target.value })}
                    />
                  </Field>
                )}
                {supported.has('letter') && (
                  <Field label="Love letter" hint="Line breaks are kept exactly as you write them.">
                    <Textarea
                      rows={10}
                      value={draft.content.letter}
                      onChange={(e) => update({}, { letter: e.target.value })}
                    />
                  </Field>
                )}
                {supported.has('secretMessage') && (
                  <Field label="Secret message" hint="Revealed when they unlock the surprise.">
                    <Input
                      value={draft.content.secretMessage}
                      onChange={(e) => update({}, { secretMessage: e.target.value })}
                    />
                  </Field>
                )}
                {supported.has('finalMessage') && (
                  <Field label="Closing message">
                    <Textarea
                      rows={3}
                      value={draft.content.finalMessage}
                      onChange={(e) => update({}, { finalMessage: e.target.value })}
                    />
                  </Field>
                )}
                {supported.has('signature') && (
                  <Field label="Signature">
                    <Input
                      value={draft.content.signature}
                      onChange={(e) => update({}, { signature: e.target.value })}
                      placeholder="With love, Your Name"
                    />
                  </Field>
                )}
              </Card>

              {supported.has('timeline') && (
                <ListEditor
                  title="Timeline"
                  addLabel="Add a moment"
                  items={draft.content.timeline}
                  onAdd={() =>
                    update({}, { timeline: [...draft.content.timeline, { date: '', title: '', description: '' }] })
                  }
                  onRemove={(i) => update({}, { timeline: draft.content.timeline.filter((_, x) => x !== i) })}
                  onChange={(i, patch) =>
                    update(
                      {},
                      {
                        timeline: draft.content.timeline.map((item, x) => (x === i ? { ...item, ...patch } : item)),
                      },
                    )
                  }
                  fields={[
                    { key: 'date', label: 'When', placeholder: 'Our first date' },
                    { key: 'title', label: 'Title', placeholder: 'The day we met' },
                    { key: 'description', label: 'What happened', textarea: true },
                  ]}
                />
              )}

              {supported.has('promises') && (
                <ListEditor
                  title="Promises"
                  addLabel="Add a promise"
                  items={draft.content.promises}
                  onAdd={() => update({}, { promises: [...draft.content.promises, { title: '', body: '' }] })}
                  onRemove={(i) => update({}, { promises: draft.content.promises.filter((_, x) => x !== i) })}
                  onChange={(i, patch) =>
                    update(
                      {},
                      { promises: draft.content.promises.map((item, x) => (x === i ? { ...item, ...patch } : item)) },
                    )
                  }
                  fields={[
                    { key: 'title', label: 'Heading', placeholder: 'I promise' },
                    { key: 'body', label: 'Promise', textarea: true },
                  ]}
                />
              )}

              {supported.has('quiz') && (
                <ListEditor
                  title="Love quiz"
                  addLabel="Add a question"
                  items={draft.content.quiz}
                  onAdd={() =>
                    update(
                      {},
                      {
                        quiz: [
                          ...draft.content.quiz,
                          { question: '', options: ['', ''], correctIndex: 0 },
                        ],
                      },
                    )
                  }
                  onRemove={(i) => update({}, { quiz: draft.content.quiz.filter((_, x) => x !== i) })}
                  onChange={(i, patch) =>
                    update(
                      {},
                      { quiz: draft.content.quiz.map((item, x) => (x === i ? { ...item, ...patch } : item)) },
                    )
                  }
                  fields={[
                    { key: 'question', label: 'Question' },
                    {
                      key: 'options',
                      label: 'Options (one per line, 2–4)',
                      textarea: true,
                      transform: (value: string) => value.split('\n').slice(0, 4),
                      display: (item) => (item.options as string[]).join('\n'),
                    },
                  ]}
                />
              )}

              {supported.has('coupons') && (
                <ListEditor
                  title="Love coupons"
                  addLabel="Add a coupon"
                  items={draft.content.coupons}
                  onAdd={() => update({}, { coupons: [...draft.content.coupons, { title: '', description: '' }] })}
                  onRemove={(i) => update({}, { coupons: draft.content.coupons.filter((_, x) => x !== i) })}
                  onChange={(i, patch) =>
                    update(
                      {},
                      { coupons: draft.content.coupons.map((item, x) => (x === i ? { ...item, ...patch } : item)) },
                    )
                  }
                  fields={[
                    { key: 'title', label: 'Coupon name', placeholder: 'One movie night' },
                    { key: 'description', label: 'Details', textarea: true },
                  ]}
                />
              )}

              {supported.has('storyPanels') && (
                <ListEditor
                  title="Story panels"
                  addLabel="Add a panel"
                  items={draft.content.storyPanels}
                  onAdd={() => update({}, { storyPanels: [...draft.content.storyPanels, { caption: '' }] })}
                  onRemove={(i) => update({}, { storyPanels: draft.content.storyPanels.filter((_, x) => x !== i) })}
                  onChange={(i, patch) =>
                    update(
                      {},
                      {
                        storyPanels: draft.content.storyPanels.map((item, x) =>
                          x === i ? { ...item, ...patch } : item,
                        ),
                      },
                    )
                  }
                  fields={[{ key: 'caption', label: 'Caption', textarea: true }]}
                />
              )}

              {supported.has('choices') && (
                <ListEditor
                  title="Choose-your-own surprise"
                  addLabel="Add a choice"
                  items={draft.content.choices}
                  onAdd={() => update({}, { choices: [...draft.content.choices, { label: '', message: '' }] })}
                  onRemove={(i) => update({}, { choices: draft.content.choices.filter((_, x) => x !== i) })}
                  onChange={(i, patch) =>
                    update(
                      {},
                      { choices: draft.content.choices.map((item, x) => (x === i ? { ...item, ...patch } : item)) },
                    )
                  }
                  fields={[
                    { key: 'label', label: 'Button label' },
                    { key: 'message', label: 'What they see', textarea: true },
                  ]}
                />
              )}
            </div>
          )}

          {tab === 'photos' && (
            <div className="flex flex-col gap-5">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg text-ink">Photos</h2>
                    <p className="text-xs text-ink/60">
                      {photos.length} uploaded{project.entitlement ? ` · plan allows ${project.entitlement.maxPhotos}` : ''}
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-romantic px-4 py-2 text-sm text-cream hover:bg-romantic-soft">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    Add photos
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        void upload(e.target.files, 'PHOTO')
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>

                {photos.length === 0 ? (
                  <p className="mt-4 rounded-2xl border border-dashed border-burgundy/20 px-4 py-8 text-center text-sm text-ink/60">
                    Add photos to bring the memories to life. JPG, PNG, WEBP or GIF up to 8 MB each.
                  </p>
                ) : (
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {photos.map((photo, index) => (
                      <li key={photo.id} className="overflow-hidden rounded-2xl border border-burgundy/10">
                        <img src={photo.url} alt="" className="h-40 w-full object-cover" loading="lazy" />
                        <div className="flex flex-col gap-2 p-3">
                          <input
                            defaultValue={photo.caption}
                            placeholder="Caption (optional)"
                            onBlur={(e) => void setCaption(photo.id, e.target.value)}
                            className="rounded-xl border border-burgundy/15 px-3 py-2 text-sm focus:border-romantic focus:outline-none"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === 0}
                                onClick={() => void move(index, -1)}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === photos.length - 1}
                                onClick={() => void move(index, 1)}
                              >
                                ↓
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => void removeAsset(photo.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {supported.has('audio') && (
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg text-ink">Background music</h2>
                      <p className="text-xs text-ink/60">
                        {audio.length === 0 ? 'None added' : audio[0]?.caption || 'Music track'} · MP3, WAV, OGG or M4A up
                        to 15 MB
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-burgundy/20 px-4 py-2 text-sm text-ink hover:bg-blush/40">
                      <Music className="h-4 w-4" />
                      {audio.length > 0 ? 'Replace track' : 'Add a track'}
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files
                          if (files && files[0] && audio[0]) void removeAsset(audio[0].id).then(() => upload(files, 'AUDIO'))
                          else void upload(files, 'AUDIO')
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                  {audio[0] && (
                    <audio className="mt-4 w-full" controls src={audio[0].url}>
                      <track kind="captions" />
                    </audio>
                  )}
                  <p className="mt-3 text-xs text-ink/50">
                    Only upload music you have the right to use. Do not share copyrighted songs publicly.
                  </p>
                </Card>
              )}
            </div>
          )}

          {tab === 'design' && (
            <div className="flex flex-col gap-5">
              <Card>
                <h2 className="font-display text-lg text-ink">Colour palette</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => update({}, undefined, { palette: palette.id })}
                      className={`overflow-hidden rounded-2xl border-2 text-left transition-transform hover:-translate-y-0.5 ${
                        draft.design.palette === palette.id ? 'border-romantic' : 'border-transparent'
                      }`}
                    >
                      <span
                        className="block h-16 w-full"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]}, ${palette.colors[2]})`,
                        }}
                      />
                      <span className="block px-2 py-1.5 text-xs text-ink/80">{palette.name}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="font-display text-lg text-ink">Typography</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => update({}, undefined, { font: font.id })}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        draft.design.font === font.id
                          ? 'border-romantic bg-blush/40'
                          : 'border-burgundy/15 hover:bg-blush/30'
                      }`}
                    >
                      <span className="block text-lg text-ink" style={{ fontFamily: font.stack }}>
                        {font.name}
                      </span>
                      <span className="mt-1 block text-xs text-ink/50" style={{ fontFamily: font.stack }}>
                        Every love story deserves a surprise
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="font-display text-lg text-ink">Animation</h2>
                <div className="mt-3 max-w-xs">
                  <Select
                    value={draft.design.animation}
                    onChange={(e) =>
                      update({}, undefined, {
                        animation: e.target.value as DesignConfig['animation'],
                      })
                    }
                  >
                    <option value="subtle">Subtle & gentle</option>
                    <option value="balanced">Balanced</option>
                    <option value="cinematic">Cinematic</option>
                  </Select>
                </div>
                <p className="text-xs text-ink/60">Higher levels of motion feel more cinematic.</p>
              </Card>
            </div>
          )}

          {tab === 'details' && (
            <div className="flex flex-col gap-5">
              <Card className="flex flex-col gap-4">
                <h2 className="font-display text-lg text-ink">Who is this for?</h2>
                <Field label="Their name">
                  <Input
                    value={draft.recipientName}
                    onChange={(e) => update({ recipientName: e.target.value })}
                    placeholder="Their name"
                  />
                </Field>
                <Field label="Your name">
                  <Input
                    value={draft.creatorName}
                    onChange={(e) => update({ creatorName: e.target.value })}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Nickname" hint="Used in a few templates for a personal touch.">
                  <Input
                    value={draft.nickname}
                    onChange={(e) => update({ nickname: e.target.value })}
                    placeholder="e.g. Jaanu"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Occasion">
                    <Select value={draft.occasion} onChange={(e) => update({ occasion: e.target.value })}>
                      {OCCASIONS.map((occasion) => (
                        <option key={occasion.key} value={occasion.key}>
                          {occasion.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Date of the occasion" hint="Used by countdown sections.">
                    <Input
                      type="datetime-local"
                      value={draft.occasionDate}
                      onChange={(e) => update({ occasionDate: e.target.value })}
                    />
                  </Field>
                </div>
              </Card>

              <Card>
                <h2 className="font-display text-lg text-ink">Plan</h2>
                {project.entitlement ? (
                  <p className="mt-2 text-sm text-ink/70">
                    {project.entitlement.planName} is active. You can publish and update this surprise as often as you
                    like until{' '}
                    {project.entitlement.expiresAt
                      ? new Date(project.entitlement.expiresAt).toLocaleDateString('en-IN')
                      : 'further notice'}
                    .
                  </p>
                ) : (
                  <div className="mt-2 flex flex-col items-start gap-3">
                    <p className="text-sm text-ink/70">
                      You can edit and preview everything for free. Choose a plan when you are ready to publish.
                    </p>
                    <LinkButton to="/pricing" size="sm">
                      See plans
                    </LinkButton>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Preview column */}
        <aside className={`min-w-0 ${showPreview ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-24">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink/50">Live preview</span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-xs text-ink/50 hover:text-romantic lg:hidden"
              >
                Hide
              </button>
            </div>
            <div className="overflow-hidden rounded-3xl border border-burgundy/10 bg-white shadow-[0_20px_60px_-30px_rgba(74,16,37,0.6)]">
              <div className="max-h-[78vh] overflow-y-auto">
                <TemplateRenderer payload={payload} mode="preview" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ list editor */

type ListField = {
  key: string
  label: string
  placeholder?: string
  textarea?: boolean
  transform?: (value: string) => unknown
  display?: (item: Record<string, unknown>) => string
}

function ListEditor({
  title,
  addLabel,
  items,
  fields,
  onAdd,
  onRemove,
  onChange,
}: {
  title: string
  addLabel: string
  items: Array<Record<string, unknown>>
  fields: ListField[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, patch: Record<string, unknown>) => void
  }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink/60">Nothing added yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={index} className="rounded-2xl border border-burgundy/10 p-4">
              <div className="flex flex-col gap-3">
                {fields.map((field) => {
                  const value = field.display ? field.display(item) : String(item[field.key] ?? '')
                  return (
                    <Field key={field.key} label={field.label}>
                      {field.textarea ? (
                        <Textarea
                          rows={2}
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(e) =>
                            onChange(index, {
                              [field.key]: field.transform ? field.transform(e.target.value) : e.target.value,
                            })
                          }
                        />
                      ) : (
                        <Input
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(e) =>
                            onChange(index, {
                              [field.key]: field.transform ? field.transform(e.target.value) : e.target.value,
                            })
                          }
                        />
                      )}
                    </Field>
                  )
                })}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
