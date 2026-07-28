import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { compileAsync } from 'sass'

import {
  createTokenDefinitionMap,
  ensureTrailingNewline,
  extractDefinedTokenNames,
} from './resolve-token-scope.js'

export async function buildMarkdownCss(paths) {
  const markdownResult = await compileAsync(paths.source.markdownEntryPath, {
    loadPaths: [join(paths.cwd, 'node_modules')],
    quietDeps: true,
    silenceDeprecations: ['global-builtin', 'import'],
    style: 'expanded',
  })

  return ensureTrailingNewline(markdownResult.css)
}

export async function readBaseArtifacts(paths) {
  const sources = paths.tokenSources.filter(source => source.kind === 'base')

  return Promise.all(sources.map(source => readTokenArtifact(paths, source)))
}

export async function readThemeArtifacts(paths) {
  const themeSource = getRequiredThemeSource(paths)
  const themeFileNames = await getThemeFileNames(themeSource.path)

  return Promise.all(
    themeFileNames.map(themeFileName =>
      readTokenArtifact(paths, {
        fileName: themeFileName,
        key: basename(themeFileName, '.css'),
        path: join(themeSource.path, themeFileName),
        format: 'css',
        kind: 'theme',
        purpose: themeSource.purpose,
      })
    )
  )
}

export async function readExtraMarkdownTokenNames(paths) {
  const tokenNames = new Set()

  for (const sourcePath of paths.tokenInputs) {
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

async function getThemeFileNames(sourcePath) {
  return (await readdir(sourcePath)).filter(fileName => fileName.endsWith('.css')).sort()
}

async function readTokenArtifact(paths, source) {
  const css =
    source.format === 'scss'
      ? await compileScssSource(paths, source.path)
      : ensureTrailingNewline(await readFile(source.path, 'utf8'))

  return {
    css,
    definitionMap: createTokenDefinitionMap(css),
    definedTokenNames: extractDefinedTokenNames(css),
    ...source,
  }
}

function getRequiredThemeSource(paths) {
  const themeSource = paths.tokenSources.find(source => source.kind === 'theme')

  if (!themeSource || themeSource.format !== 'css-directory') {
    throw new Error('Expected one theme token source with format "css-directory"')
  }

  return themeSource
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
