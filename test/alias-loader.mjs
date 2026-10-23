import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))

// Resolves the "@/…" imports the app uses, so route code can run under node --test.
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/app/components/')) {
    specifier = pathToFileURL(join(root, 'app/(frontend)/components', specifier.slice(17))).href
  } else if (specifier.startsWith('@/')) {
    const base = join(root, specifier.slice(2))
    const file = [base, `${base}.js`, `${base}.mjs`].find((candidate) => existsSync(candidate) && !candidate.endsWith('/'))
    specifier = pathToFileURL(file || `${base}.js`).href
  }
  return nextResolve(specifier, context)
}
