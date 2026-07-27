import { readFile } from 'node:fs/promises'
import { buildConfig, cwd } from './build-config.mjs'
import { createPrimerMarkdownPaths } from './utils/primer-markdown-paths.mjs'
import { assertValidationReport } from './utils/primer-markdown-validation.mjs'

const paths = createPrimerMarkdownPaths({ buildConfig, cwd })

main()

async function main() {
  const report = JSON.parse(await readFile(paths.artifacts.reports.reportPath, 'utf8'))
  const markdownTokenNames = JSON.parse(
    await readFile(paths.artifacts.reports.markdownTokenNamesPath, 'utf8')
  )

  assertValidationReport({ markdownTokenNames, report })
}
