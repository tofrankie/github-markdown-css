import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

import { ensureTrailingNewline } from './primer-markdown-tokens.mjs'

export async function preparePublishedOutputDirectory(paths) {
  await rm(paths.dist.dir, { force: true, recursive: true })
  await mkdir(paths.dist.dir, { recursive: true })
}

export async function prepareArtifactsOutputDirectories(paths) {
  await Promise.all(
    [
      paths.artifacts.full.markdownDir,
      paths.artifacts.full.baseDir,
      paths.artifacts.full.bundlesDir,
      paths.artifacts.full.themesDir,
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
      paths.artifacts.slim.baseDir,
      paths.artifacts.slim.bundlesDir,
      paths.artifacts.slim.themesDir,
      paths.artifacts.reports.fullDir,
      paths.artifacts.reports.slimDir,
    ].map(path => mkdir(path, { recursive: true }))
  )
}

export async function writePublishedArtifacts({ bundles, paths }) {
  await writeFile(paths.dist.indexPath, 'export {}\n')

  for (const bundle of bundles) {
    await writeFile(join(paths.dist.dir, bundle.fileName), bundle.css)
  }
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

function buildFixtureDocument({ bodyHtml, cssHref, title }) {
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
    <main class="canvas">
${indentHtml(bodyHtml, 6)}
    </main>
  </body>
</html>
`)
}

function indentHtml(html, spaces) {
  const indent = ' '.repeat(spaces)

  return html
    .trim()
    .split('\n')
    .map(line => `${indent}${line}`)
    .join('\n')
}
