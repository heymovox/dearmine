/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute API origin when the API is hosted separately (no trailing slash). */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
