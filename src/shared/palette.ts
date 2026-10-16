import { FONT_OPTIONS, PALETTES, type FontId, type PaletteId } from './constants'

export type PaletteDef = {
  id: string
  name: string
  colors: readonly string[]
}

/** Resolve a palette by id, falling back to the first palette. */
export function getPalette(id: string | null | undefined): PaletteDef {
  return (PALETTES.find((p) => p.id === id) ?? PALETTES[0]) as PaletteDef
}

export function getFont(id: string | null | undefined) {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0]
}

/**
 * Build CSS custom properties for a template from its palette + font.
 * Templates read `--tpl-*` variables so the editor can restyle them live.
 */
export function buildThemeVars(paletteId: string | null | undefined, fontId: string | null | undefined): Record<string, string> {
  const palette = getPalette(paletteId)
  const font = getFont(fontId)
  const [ink, accent, soft, surface] = palette.colors as unknown as [string, string, string, string]
  return {
    '--tpl-ink': ink,
    '--tpl-accent': accent,
    '--tpl-soft': soft,
    '--tpl-surface': surface,
    '--tpl-font': font.stack,
  }
}

export type { FontId, PaletteId }
