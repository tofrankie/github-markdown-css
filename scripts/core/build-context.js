import { resolve } from 'node:path'

export function createBuildContext({
  autoThemeBundles,
  cwd,
  extraMarkdownTokenInputs,
  projectConfig,
  tokenSources,
}) {
  assertTokenSources(tokenSources)

  const artifactsRootDir = resolve(cwd, projectConfig.artifactsDirectory)
  const distDir = resolve(cwd, projectConfig.distDirectory)

  return {
    artifacts: {
      full: {
        baseDir: resolve(artifactsRootDir, 'full/base'),
        bundlesDir: resolve(artifactsRootDir, 'full/bundles'),
        markdownDir: resolve(artifactsRootDir, 'full/markdown'),
        themesDir: resolve(artifactsRootDir, 'full/themes'),
      },
      published: {
        primerDir: resolve(artifactsRootDir, 'published/primer'),
        scopedDir: resolve(artifactsRootDir, 'published/scoped'),
      },
      reports: {
        fullDir: resolve(artifactsRootDir, 'reports/full'),
        markdownTokenNamesPath: resolve(artifactsRootDir, 'reports/markdown-token-names.json'),
        primerDir: resolve(artifactsRootDir, 'reports/primer'),
        reportPath: resolve(artifactsRootDir, 'reports/report.json'),
        scopedDir: resolve(artifactsRootDir, 'reports/scoped'),
        slimDir: resolve(artifactsRootDir, 'reports/slim'),
      },
      rootDir: artifactsRootDir,
      slim: {
        baseDir: resolve(artifactsRootDir, 'slim/base'),
        bundlesDir: resolve(artifactsRootDir, 'slim/bundles'),
        themesDir: resolve(artifactsRootDir, 'slim/themes'),
      },
    },
    cwd,
    dist: {
      dir: distDir,
      indexPath: resolve(distDir, 'index.js'),
      primerDir: resolve(distDir, 'primer'),
    },
    source: {
      fixtureTemplatePath: resolve(cwd, projectConfig.fixtureTemplatePath),
      markdownEntryPath: resolve(cwd, projectConfig.markdownEntryPath),
    },
    tokenInputs: extraMarkdownTokenInputs.map(input => resolve(cwd, input)),
    tokenSources: tokenSources.map(source => ({
      ...source,
      path: resolve(cwd, source.path),
    })),
    publishedBundles: {
      auto: autoThemeBundles.map(bundle => ({ ...bundle })),
    },
  }
}

function assertTokenSources(tokenSources) {
  const sourceKeys = new Set()

  for (const source of tokenSources) {
    if (!source.key || !source.kind || !source.format || !source.path || !source.purpose) {
      throw new TypeError(`Token source ${source.key ?? '(unknown)'} is missing required metadata`)
    }

    if (sourceKeys.has(source.key)) {
      throw new Error(`Duplicate token source key: ${source.key}`)
    }

    sourceKeys.add(source.key)
  }
}
