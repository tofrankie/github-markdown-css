import { resolve } from 'node:path'

export function createPrimerMarkdownPaths({ cwd, buildConfig }) {
  const artifactsRootDir = resolve(cwd, 'artifacts')
  const distDir = resolve(cwd, 'dist')

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
    hooks: {
      extraMarkdownTokenJsonPaths: [...buildConfig.extraMarkdownTokenJsonPaths],
      extraScssSourcePaths: [...buildConfig.extraScssSourcePaths],
      publishedAutoThemePairs: [...buildConfig.publishedAutoThemePairs],
      themeDescriptions: { ...buildConfig.themeDescriptions },
    },
    source: {
      functionalTypographySourcePath: resolve(
        cwd,
        'node_modules/@primer/primitives/dist/css/functional/typography/typography.css'
      ),
      fixtureTemplatePath: resolve(cwd, 'scripts/fixtures/markdown-fixture.html'),
      markdownEntry: resolve(cwd, 'node_modules/@primer/css/markdown/index.scss'),
      sizeSourcePath: resolve(cwd, 'node_modules/@primer/primitives/dist/css/base/size/size.css'),
      themesSourceDir: resolve(cwd, 'node_modules/@primer/primitives/dist/css/functional/themes'),
      typographySourcePath: resolve(
        cwd,
        'node_modules/@primer/primitives/dist/css/base/typography/typography.css'
      ),
    },
  }
}
