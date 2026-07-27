import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

import { ensureTrailingNewline } from './primer-markdown-tokens.mjs'

export async function preparePublishedOutputDirectory(paths) {
  await rm(paths.dist.dir, { force: true, recursive: true })
  await Promise.all(
    [paths.dist.dir, paths.dist.primerDir].map(path => mkdir(path, { recursive: true }))
  )
}

export async function prepareArtifactsOutputDirectories(paths) {
  await Promise.all(
    [
      paths.artifacts.full.markdownDir,
      paths.artifacts.full.baseDir,
      paths.artifacts.full.bundlesDir,
      paths.artifacts.full.themesDir,
      paths.artifacts.published.primerDir,
      paths.artifacts.published.scopedDir,
      paths.artifacts.reports.primerDir,
      paths.artifacts.reports.scopedDir,
      paths.artifacts.slim.baseDir,
      paths.artifacts.slim.bundlesDir,
      paths.artifacts.slim.themesDir,
      paths.artifacts.reports.fullDir,
      paths.artifacts.reports.slimDir,
      dirname(paths.artifacts.reports.markdownTokenNamesPath),
    ].map(path => rm(path, { force: true, recursive: true }))
  )

  await Promise.all(
    [
      paths.artifacts.full.baseDir,
      paths.artifacts.full.bundlesDir,
      paths.artifacts.full.markdownDir,
      paths.artifacts.full.themesDir,
      paths.artifacts.published.primerDir,
      paths.artifacts.published.scopedDir,
      paths.artifacts.reports.primerDir,
      paths.artifacts.reports.scopedDir,
      paths.artifacts.slim.baseDir,
      paths.artifacts.slim.bundlesDir,
      paths.artifacts.slim.themesDir,
      paths.artifacts.reports.fullDir,
      paths.artifacts.reports.slimDir,
    ].map(path => mkdir(path, { recursive: true }))
  )
}

export async function writePublishedArtifacts({ artifactRoot, paths, publishedArtifacts }) {
  const outputRoot = artifactRoot ?? paths.dist

  await writeFile(paths.dist.indexPath, 'export {}\n')
  await writeBundleArtifacts(outputRoot.scopedDir ?? outputRoot.dir, [
    ...publishedArtifacts.scoped.themes,
    ...publishedArtifacts.scoped.autos,
  ])
  await writeBundleArtifacts(outputRoot.primerDir, [
    ...publishedArtifacts.primer.themes,
    ...publishedArtifacts.primer.autos,
  ])
}

export async function writeFullArtifacts({
  baseArtifacts,
  fullBundles,
  markdownCss,
  paths,
  themeArtifacts,
}) {
  await writeFile(join(paths.artifacts.full.markdownDir, 'github-markdown.css'), markdownCss)
  await writeCssArtifacts(paths.artifacts.full.baseDir, baseArtifacts)
  await writeCssArtifacts(paths.artifacts.full.themesDir, themeArtifacts)
  await writeBundleArtifacts(paths.artifacts.full.bundlesDir, fullBundles)
}

export async function writeSlimArtifacts({ paths, slimArtifacts }) {
  await writeCssArtifacts(paths.artifacts.slim.baseDir, slimArtifacts.baseArtifacts)
  await writeCssArtifacts(paths.artifacts.slim.themesDir, slimArtifacts.themeArtifacts)
  await writeBundleArtifacts(paths.artifacts.slim.bundlesDir, slimArtifacts.bundles)
}

export async function writeValidationArtifacts({
  fixturesHtml,
  markdownTokenNames,
  paths,
  publishedArtifacts,
  report,
  themeArtifacts,
}) {
  await writeFile(
    paths.artifacts.reports.markdownTokenNamesPath,
    `${JSON.stringify([...markdownTokenNames].sort(), null, 2)}\n`
  )
  await writeFile(paths.artifacts.reports.reportPath, `${JSON.stringify(report, null, 2)}\n`)

  for (const themeArtifact of themeArtifacts) {
    const fullBundlePath = join(
      paths.artifacts.full.bundlesDir,
      `github-markdown-${themeArtifact.key}.css`
    )
    const slimBundlePath = join(
      paths.artifacts.slim.bundlesDir,
      `github-markdown-${themeArtifact.key}.css`
    )
    const fullOutputPath = join(paths.artifacts.reports.fullDir, `${themeArtifact.key}.html`)
    const slimOutputPath = join(paths.artifacts.reports.slimDir, `${themeArtifact.key}.html`)

    await writeFile(
      fullOutputPath,
      buildFixtureDocument({
        bodyHtml: fixturesHtml,
        cssHref: relative(dirname(fullOutputPath), fullBundlePath),
        title: `Full bundle fixture - ${themeArtifact.key}`,
      })
    )
    await writeFile(
      slimOutputPath,
      buildFixtureDocument({
        bodyHtml: fixturesHtml,
        cssHref: relative(dirname(slimOutputPath), slimBundlePath),
        title: `Slim bundle fixture - ${themeArtifact.key}`,
      })
    )
  }

  for (const bundle of [...publishedArtifacts.primer.themes, ...publishedArtifacts.primer.autos]) {
    const cssPath = join(paths.artifacts.published.primerDir, bundle.fileName)
    const outputPath = join(paths.artifacts.reports.primerDir, `${bundle.fileName}.html`)

    await writeFile(
      outputPath,
      buildFixtureDocument({
        attributes: buildPrimerFixtureAttributes(bundle),
        bodyHtml: fixturesHtml,
        cssHref: relative(dirname(outputPath), cssPath),
        title: `Primer published fixture - ${bundle.fileName}`,
      })
    )
  }

  for (const bundle of [...publishedArtifacts.scoped.themes, ...publishedArtifacts.scoped.autos]) {
    const cssPath = join(paths.artifacts.published.scopedDir, bundle.fileName)
    const outputPath = join(paths.artifacts.reports.scopedDir, `${bundle.fileName}.html`)

    await writeFile(
      outputPath,
      buildFixtureDocument({
        bodyHtml: fixturesHtml,
        cssHref: relative(dirname(outputPath), cssPath),
        title: `Scoped published fixture - ${bundle.fileName}`,
      })
    )
  }
}

async function writeCssArtifacts(outputDir, artifacts) {
  for (const artifact of artifacts) {
    await writeFile(join(outputDir, artifact.fileName), artifact.css)
  }
}

async function writeBundleArtifacts(outputDir, bundles) {
  for (const bundle of bundles) {
    await writeFile(join(outputDir, bundle.fileName), bundle.css)
  }
}

function buildFixtureDocument({ attributes = '', bodyHtml, cssHref, title }) {
  return ensureTrailingNewline(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="stylesheet" href="${cssHref}" />
    <style>
      body {
        margin: 0;
        padding: 32px;
        background: #f6f8fa;
      }

      .canvas {
        max-width: 980px;
        margin: 0 auto;
        padding: 32px;
        background: #fff;
        border: 1px solid #d0d7de;
        border-radius: 12px;
      }
    </style>
  </head>
  <body>
    <main class="canvas"${attributes}>
${indentHtml(bodyHtml, 6)}
    </main>
  </body>
</html>
`)
}

function buildPrimerFixtureAttributes(bundle) {
  if (bundle.kind === 'auto') {
    return ` data-color-mode="auto" data-light-theme="${bundle.lightThemeSelectorKey}" data-dark-theme="${bundle.darkThemeSelectorKey}"`
  }

  return ` data-color-mode="light" data-light-theme="${bundle.lightThemeSelectorKey}" data-dark-theme="${bundle.darkThemeSelectorKey}"`
}

function indentHtml(html, spaces) {
  const indent = ' '.repeat(spaces)

  return html
    .trim()
    .split('\n')
    .map(line => `${indent}${line}`)
    .join('\n')
}
