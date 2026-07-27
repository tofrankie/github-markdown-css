import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { compileAsync } from 'sass'

import {
  createTokenDefinitionMap,
  ensureTrailingNewline,
  extractDefinedTokenNames,
} from './primer-markdown-tokens.mjs'

export async function buildMarkdownCss(paths) {
  const markdownResult = await compileAsync(paths.source.markdownEntry, {
    loadPaths: [join(paths.cwd, 'node_modules')],
    quietDeps: true,
    silenceDeprecations: ['global-builtin', 'import'],
    style: 'expanded',
  })

  return ensureTrailingNewline(markdownResult.css)
}

export async function readBaseArtifacts(paths) {
  const sources = [
    {
      fileName: 'size.css',
      key: 'size',
      sourcePath: paths.source.sizeSourcePath,
      sourceType: 'css',
    },
    {
      fileName: 'typography.css',
      key: 'typography',
      sourcePath: paths.source.typographySourcePath,
      sourceType: 'css',
    },
    ...paths.hooks.extraScssSourcePaths.map((sourcePath, index) => ({
      fileName: `custom-${index + 1}-${basename(sourcePath, '.scss')}.css`,
      key: `custom-${index + 1}-${basename(sourcePath, '.scss')}`,
      sourcePath,
      sourceType: 'scss',
    })),
  ]

  return Promise.all(sources.map(source => readTokenArtifact(paths, source)))
}

export async function readThemeArtifacts(paths) {
  const themeFileNames = await getThemeFileNames(paths)

  return Promise.all(
    themeFileNames.map(themeFileName =>
      readTokenArtifact(paths, {
        fileName: themeFileName,
        key: basename(themeFileName, '.css'),
        sourcePath: join(paths.source.themesSourceDir, themeFileName),
        sourceType: 'css',
      })
    )
  )
}

export async function readExtraMarkdownTokenNames(paths) {
  const tokenNames = new Set()

  for (const sourcePath of paths.hooks.extraMarkdownTokenJsonPaths) {
    const payload = JSON.parse(await readFile(sourcePath, 'utf8'))
    const nextTokenNames = Array.isArray(payload) ? payload : payload.tokens

    if (!Array.isArray(nextTokenNames)) {
      throw new TypeError(
        `Expected ${sourcePath} to export a token array or { "tokens": [] } payload`
      )
    }

    for (const tokenName of nextTokenNames) {
      if (typeof tokenName !== 'string') {
        throw new TypeError(`Expected ${sourcePath} to contain only string token names`)
      }

      tokenNames.add(tokenName)
    }
  }

  return tokenNames
}

async function getThemeFileNames(paths) {
  return (await readdir(paths.source.themesSourceDir))
    .filter(fileName => fileName.endsWith('.css'))
    .sort()
}

async function readTokenArtifact(paths, source) {
  const css =
    source.sourceType === 'scss'
      ? await compileScssSource(paths, source.sourcePath)
      : ensureTrailingNewline(await readFile(source.sourcePath, 'utf8'))

  return {
    css,
    definitionMap: createTokenDefinitionMap(css),
    definedTokenNames: extractDefinedTokenNames(css),
    ...source,
  }
}

async function compileScssSource(paths, sourcePath) {
  const result = await compileAsync(sourcePath, {
    loadPaths: [join(paths.cwd, 'node_modules')],
    quietDeps: true,
    silenceDeprecations: ['global-builtin', 'import'],
    style: 'expanded',
  })

  return ensureTrailingNewline(result.css)
}
