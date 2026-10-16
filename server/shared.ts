/**
 * Single re-export surface for isomorphic shared code inside the API.
 * Keeps server imports relative (robust for tsx + tsup) while the web app
 * uses the `@shared` alias.
 */
export * from '../src/shared/index'
