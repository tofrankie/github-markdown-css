import { readFile } from 'node:fs/promises'

import { buildConfig, cwd } from './build-config.mjs'
import { createPrimerMarkdownPaths } from './utils/primer-markdown-paths.mjs'
import {
  buildMarkdownCss,
  readBaseArtifacts,
  readExtraMarkdownTokenNames,
  readThemeArtifacts,
} from './utils/primer-markdown-sources.mjs'
import {
  createMarkdownTokenNames,
  createSlimArtifacts,
  createThemeBundles,
  resolveMarkdownTokenScope,
} from './utils/primer-markdown-tokens.mjs'
import {
  assertNoMissingRequiredTokenNames,
  buildValidationReport,
} from './utils/primer-markdown-validation.mjs'
import {
  prepareArtifactsOutputDirectories,
  writeFullArtifacts,
  writeSlimArtifacts,
  writeValidationArtifacts,
} from './utils/primer-markdown-write.mjs'

const paths = createPrimerMarkdownPaths({ buildConfig, cwd })

main()

async function main() {
  await prepareArtifactsOutputDirectories(paths)

  const fixturesHtml = await readFile(paths.source.fixtureTemplatePath, 'utf8')
  const markdownCss = await buildMarkdownCss(paths)
  const extraMarkdownTokenNames = await readExtraMarkdownTokenNames(paths)
  const baseArtifacts = await readBaseArtifacts(paths)
  const themeArtifacts = await readThemeArtifacts(paths)
  const markdownTokenNames = createMarkdownTokenNames({
    extraTokenNames: extraMarkdownTokenNames,
    markdownCss,
  })
  const tokenScope = resolveMarkdownTokenScope({
    baseArtifacts,
    themeArtifacts,
    tokenNames: markdownTokenNames,
  })

  assertNoMissingRequiredTokenNames(tokenScope)

  const fullBundles = createThemeBundles({
    baseArtifacts,
    markdownCss,
    themeArtifacts,
  })
  const slimArtifacts = createSlimArtifacts({
    baseArtifacts,
    markdownCss,
    themeArtifacts,
    tokenScope,
  })
  const validationReport = buildValidationReport({
    baseArtifacts,
    fullBundles,
    markdownTokenNames,
    paths,
    slimArtifacts,
    themeArtifacts,
    tokenScope,
  })

  await writeFullArtifacts({
    baseArtifacts,
    fullBundles,
    markdownCss,
    paths,
    themeArtifacts,
  })
  await writeSlimArtifacts({ paths, slimArtifacts })
  await writeValidationArtifacts({
    fixturesHtml,
    markdownTokenNames,
    paths,
    report: validationReport,
    themeArtifacts,
  })
}
