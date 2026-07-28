import { fileURLToPath } from 'node:url'

export const cwd = fileURLToPath(new URL('../..', import.meta.url))

export const projectConfig = {
  artifactsDirectory: 'artifacts',
  distDirectory: 'dist',
  fixtureTemplatePath: 'scripts/fixtures/markdown-fixture.html',
  markdownEntryPath: 'src/primer-markdown-extended.scss',
}
