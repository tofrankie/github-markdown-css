import { resolve } from 'node:path'

export function createBuildContext({
  cwd,
  exportGroups,
  extraMarkdownTokenInputs,
  publishedAutoBundles,
  publishedThemeKeys,
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
        genericDir: resolve(artifactsRootDir, 'published/generic'),
        primerDir: resolve(artifactsRootDir, 'published/primer'),
        pureDir: resolve(artifactsRootDir, 'published/pure'),
        vscodeDir: resolve(artifactsRootDir, 'published/vscode'),
      },
      reports: {
        fullDir: resolve(artifactsRootDir, 'reports/full'),
        genericDir: resolve(artifactsRootDir, 'reports/generic'),
        markdownTokenNamesPath: resolve(artifactsRootDir, 'reports/markdown-token-names.json'),
        primerDir: resolve(artifactsRootDir, 'reports/primer'),
        pureDir: resolve(artifactsRootDir, 'reports/pure'),
        reportPath: resolve(artifactsRootDir, 'reports/report.json'),
        slimDir: resolve(artifactsRootDir, 'reports/slim'),
        vscodeDir: resolve(artifactsRootDir, 'reports/vscode'),
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
      purePath: resolve(distDir, 'pure.css'),
      scssDir: resolve(distDir, 'scss'),
      scssIndexPath: resolve(distDir, 'scss/index.scss'),
      vscodeDir: resolve(distDir, 'vscode'),
    },
    exportGroups: exportGroups.map(group => ({ ...group })),
    publishedThemeKeys: [...publishedThemeKeys],
    source: {
      fixtureTemplatePath: resolve(cwd, projectConfig.fixtureTemplatePath),
      markdownEntryPath: resolve(cwd, projectConfig.markdownEntryPath),
    },
    tokenInputs: extraMarkdownTokenInputs.map(input => resolve(cwd, input)),
    tokenSources: tokenSources.map(source => ({
      ...source,
      displayPath: source.path,
      path: resolve(cwd, source.path),
    })),
    publishedBundles: {
      auto: publishedAutoBundles.map(bundle => ({ ...bundle })),
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
