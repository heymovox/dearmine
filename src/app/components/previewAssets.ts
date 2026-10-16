/**
 * Demo photos used ONLY for template previews and the editor's starter content.
 * These are the sample images that ship with the product — they are never
 * presented as a customer's real photos.
 *
 * Real customer photos are uploaded through the editor to object storage
 * (Cloudflare R2 in production, local disk in development), so the repository
 * never contains personal imagery.
 */
const PLACEHOLDER = '/images/photo-placeholder.svg'

/** Sample photos for a template preview. */
export function previewPhotosFor(count = 6): string[] {
  return Array.from({ length: count }, () => PLACEHOLDER)
}
