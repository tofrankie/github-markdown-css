import { readFile } from 'node:fs/promises'

import { loadBuildContext } from './core/load-config.js'
import { assertValidationReport } from './core/validate-artifacts.js'

main()

async function main() {
  const paths = loadBuildContext()
  const report = JSON.parse(await readFile(paths.artifacts.reports.reportPath, 'utf8'))
  const markdownTokenNames = JSON.parse(
    await readFile(paths.artifacts.reports.markdownTokenNamesPath, 'utf8')
  )

  assertValidationReport({ markdownTokenNames, report })
}
