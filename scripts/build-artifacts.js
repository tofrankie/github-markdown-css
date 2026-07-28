import { readFile } from 'node:fs/promises'

import {
  buildMarkdownCss,
  readBaseArtifacts,
  readExtraMarkdownTokenNames,
  readThemeArtifacts,
} from './core/collect-sources.js'
import { createPublishedArtifacts } from './core/create-published-artifacts.js'
import { loadBuildContext } from './core/load-config.js'
import {
  createMarkdownTokenNames,
  createSlimArtifacts,
  createThemeBundles,
  resolveMarkdownTokenScope,
} from './core/resolve-token-scope.js'
import {
  assertNoMissingRequiredTokenNames,
  buildValidationReport,
} from './core/validate-artifacts.js'
import {
  prepareArtifactsOutputDirectories,
  writeFullArtifacts,
  writePublishedArtifacts,
  writeSlimArtifacts,
  writeValidationArtifacts,
} from './core/write-artifacts.js'

main()

async function main() {
  const paths = loadBuildContext()

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
  // Reuse the same published-artifact assembly during artifact builds so preview fixtures
  // and validation reflect the exact npm-facing output shape.
  const publishedArtifacts = createPublishedArtifacts({
    autoThemePairs: paths.publishedBundles.auto,
    baseArtifacts: slimArtifacts.baseArtifacts,
    markdownCss,
    themeArtifacts: slimArtifacts.themeArtifacts,
  })
  const validationReport = buildValidationReport({
    baseArtifacts,
    fullBundles,
    markdownTokenNames,
    paths,
    publishedArtifacts,
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
  await writePublishedArtifacts({
    artifactRoot: paths.artifacts.published,
    publishedArtifacts,
    paths,
  })
  await writeValidationArtifacts({
    fixturesHtml,
    markdownTokenNames,
    paths,
    publishedArtifacts,
    report: validationReport,
    themeArtifacts,
  })
}
