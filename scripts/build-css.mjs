import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileAsync } from 'sass'

const cwd = fileURLToPath(new URL('..', import.meta.url))
const distDir = resolve(cwd, 'dist')
const themesSourceDir = resolve(cwd, 'node_modules/@primer/primitives/dist/css/functional/themes')
const markdownEntry = resolve(cwd, 'node_modules/@primer/css/markdown/index.scss')
const themesOutputDir = resolve(distDir, 'themes')
const bundlesOutputDir = resolve(distDir, 'bundles')

main()

async function main() {
  await prepareDistDirectory()

  const markdownCss = await buildMarkdownCss()
  const themeFileNames = await getThemeFileNames()

  await writeMarkdownArtifacts(markdownCss)
  await writeThemeArtifacts(themeFileNames, markdownCss)
}

async function prepareDistDirectory() {
  await rm(distDir, { force: true, recursive: true })
  await mkdir(themesOutputDir, { recursive: true })
  await mkdir(bundlesOutputDir, { recursive: true })
}

async function buildMarkdownCss() {
  const markdownResult = await compileAsync(markdownEntry, {
    loadPaths: [resolve(cwd, 'node_modules')],
    quietDeps: true,
    silenceDeprecations: ['global-builtin', 'import'],
    style: 'expanded',
  })

  return ensureTrailingNewline(markdownResult.css)
}

async function getThemeFileNames() {
  return (await readdir(themesSourceDir)).filter(fileName => fileName.endsWith('.css')).sort()
}

async function writeMarkdownArtifacts(markdownCss) {
  await writeFile(resolve(distDir, 'github-markdown.css'), markdownCss)
  await writeFile(resolve(distDir, 'index.js'), 'export {}\n')
}

async function writeThemeArtifacts(themeFileNames, markdownCss) {
  for (const themeFileName of themeFileNames) {
    const sourcePath = join(themesSourceDir, themeFileName)
    const themeOutputPath = join(themesOutputDir, themeFileName)
    const bundleOutputPath = join(
      bundlesOutputDir,
      `github-markdown-${basename(themeFileName, '.css')}.css`
    )

    await copyFile(sourcePath, themeOutputPath)

    const themeCss = await readFile(sourcePath, 'utf8')
    const bundleCss = `${themeCss.trimEnd()}\n\n${markdownCss}`

    await writeFile(bundleOutputPath, bundleCss)
  }
}

function ensureTrailingNewline(css) {
  return css.endsWith('\n') ? css : `${css}\n`
}
