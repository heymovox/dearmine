/**
 * Demo photos used ONLY for template previews and the editor's starter content.
 * These are the sample images that ship with the product — they are never
 * presented as a customer's real photos.
 */
const TOTAL_DEMO_PHOTOS = 38

function photo(index: number): string {
  const n = ((index % TOTAL_DEMO_PHOTOS) + TOTAL_DEMO_PHOTOS) % TOTAL_DEMO_PHOTOS
  return `/images/memory-${String(n + 1).padStart(2, '0')}.jpg`
}

/** Six varied sample photos for a given template key (deterministic). */
export function previewPhotosFor(componentKey: string, count = 6): string[] {
  const seed = componentKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return Array.from({ length: count }, (_, i) => photo(seed + i * 5))
}
