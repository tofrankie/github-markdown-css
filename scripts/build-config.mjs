import { fileURLToPath } from 'node:url'

export const cwd = fileURLToPath(new URL('..', import.meta.url))

export const buildConfig = {
  // Add one or more JSON files when markdown text extraction misses a token you still want slim artifacts to keep.
  extraMarkdownTokenJsonPaths: [],
  // Add one or more SCSS files when tokens such as --fontStack-sansSerif need a custom source.
  extraScssSourcePaths: [],
}
