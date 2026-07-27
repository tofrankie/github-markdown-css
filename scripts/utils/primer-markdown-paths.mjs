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
      reports: {
        fullDir: resolve(artifactsRootDir, 'reports/full'),
        markdownTokenNamesPath: resolve(artifactsRootDir, 'reports/markdown-token-names.json'),
        reportPath: resolve(artifactsRootDir, 'reports/report.json'),
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
    },
    hooks: {
      extraMarkdownTokenJsonPaths: [...buildConfig.extraMarkdownTokenJsonPaths],
      extraScssSourcePaths: [...buildConfig.extraScssSourcePaths],
    },
    source: {
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
