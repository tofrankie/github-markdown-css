export const DEFAULT_OPTIONAL_MARKDOWN_TOKEN_NAMES = new Set([
  '--color-accent-emphasis',
  '--color-border-default',
  '--color-border-muted',
  '--color-canvas-default',
  '--color-canvas-subtle',
  '--color-danger-fg',
  '--color-fg-default',
  '--color-fg-muted',
  '--color-neutral-muted',
  '--fontStack-sansSerif',
])

export function createMarkdownTokenNames({ extraTokenNames, markdownCss }) {
  const tokenNames = extractMarkdownTokenNames(markdownCss)

  for (const tokenName of extraTokenNames) {
    tokenNames.add(tokenName)
  }

  return tokenNames
}

export function resolveMarkdownTokenScope({
  baseArtifacts,
  optionalTokenNames = DEFAULT_OPTIONAL_MARKDOWN_TOKEN_NAMES,
  themeArtifacts,
  tokenNames,
}) {
  const baseTokenNamesByArtifactKey = new Map(
    baseArtifacts.map(artifact => [artifact.key, new Set()])
  )
  const missingRequiredTokenNames = []
  const themeTokenNames = new Set()
  const unresolvedOptionalTokenNames = []

  for (const tokenName of tokenNames) {
    const baseArtifact = baseArtifacts.find(artifact => artifact.definitionMap.has(tokenName))

    if (baseArtifact) {
      baseTokenNamesByArtifactKey.get(baseArtifact.key)?.add(tokenName)
      continue
    }

    if (themeArtifacts.some(artifact => artifact.definitionMap.has(tokenName))) {
      themeTokenNames.add(tokenName)
      continue
    }

    if (optionalTokenNames.has(tokenName)) {
      unresolvedOptionalTokenNames.push(tokenName)
      continue
    }

    missingRequiredTokenNames.push(tokenName)
  }

  return {
    baseTokenNamesByArtifactKey,
    missingRequiredTokenNames,
    requiredTokenNames: new Set([
      ...themeTokenNames,
      ...[...baseTokenNamesByArtifactKey.values()].flatMap(tokenSet => [...tokenSet]),
    ]),
    themeTokenNames,
    unresolvedOptionalTokenNames,
  }
}

export function createThemeBundles({ baseArtifacts, markdownCss, themeArtifacts }) {
  return themeArtifacts.map(themeArtifact => ({
    css: joinCssParts([
      ...baseArtifacts.map(artifact => artifact.css),
      themeArtifact.css,
      markdownCss,
    ]),
    fileName: `github-markdown-${themeArtifact.key}.css`,
    themeKey: themeArtifact.key,
  }))
}

export function createSlimArtifacts({ baseArtifacts, markdownCss, themeArtifacts, tokenScope }) {
  const slimBaseArtifacts = baseArtifacts.map(artifact =>
    buildSlimTokenArtifact({
      artifact,
      initialTokenNames: tokenScope.baseTokenNamesByArtifactKey.get(artifact.key) ?? new Set(),
    })
  )
  const slimThemeArtifacts = themeArtifacts.map(artifact =>
    buildSlimTokenArtifact({
      artifact,
      initialTokenNames: tokenScope.themeTokenNames,
    })
  )

  return {
    baseArtifacts: slimBaseArtifacts,
    bundles: createThemeBundles({
      baseArtifacts: slimBaseArtifacts,
      markdownCss,
      themeArtifacts: slimThemeArtifacts,
    }),
    themeArtifacts: slimThemeArtifacts,
  }
}

export function createTokenDefinitionMap(css) {
  const definitionMap = new Map()

  for (const line of css.split('\n')) {
    const declaration = parseTokenDeclaration(line)

    if (!declaration) {
      continue
    }

    definitionMap.set(declaration.tokenName, {
      line,
      referenceNames: extractTokenReferences(declaration.value),
      value: declaration.value,
    })
  }

  return definitionMap
}

export function extractDefinedTokenNames(css) {
  return new Set(createTokenDefinitionMap(css).keys())
}

export function extractMarkdownTokenNames(markdownCss) {
  return new Set(extractTokenReferences(markdownCss))
}

export function extractTokenReferences(value) {
  return [...value.matchAll(/var\((--[\w-]+)/g)].map(match => match[1])
}

export function ensureTrailingNewline(value) {
  return value.endsWith('\n') ? value : `${value}\n`
}

export function normalizeTokenValue(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function buildSlimTokenArtifact({ artifact, initialTokenNames }) {
  const retainedTokenNames = computeRetainedTokenNames({
    definitionMap: artifact.definitionMap,
    initialTokenNames,
  })

  return {
    ...artifact,
    css: filterCssToTokenNames(artifact.css, retainedTokenNames),
    retainedTokenNames,
  }
}

function computeRetainedTokenNames({ definitionMap, initialTokenNames }) {
  const retainedTokenNames = new Set(
    [...initialTokenNames].filter(tokenName => definitionMap.has(tokenName))
  )
  let changed = true

  while (changed) {
    changed = false

    for (const tokenName of retainedTokenNames) {
      const definition = definitionMap.get(tokenName)

      if (!definition) {
        continue
      }

      for (const referenceName of definition.referenceNames) {
        if (!definitionMap.has(referenceName) || retainedTokenNames.has(referenceName)) {
          continue
        }

        retainedTokenNames.add(referenceName)
        changed = true
      }
    }
  }

  return retainedTokenNames
}

function filterCssToTokenNames(css, retainedTokenNames) {
  const rootScope = createCssScope()
  const stack = [rootScope]

  for (const line of css.split('\n')) {
    const currentScope = stack.at(-1)

    if (line.includes('{')) {
      const headerLines = [...currentScope.pendingLines, line]

      currentScope.pendingLines = []
      stack.push(createCssScope(headerLines))
      continue
    }

    if (line.trim() === '}') {
      const completedScope = stack.pop()

      if (!completedScope || completedScope === rootScope) {
        throw new Error('Unexpected CSS scope closure while generating slim artifact')
      }

      if (completedScope.bodyLines.length === 0) {
        continue
      }

      const parentScope = stack.at(-1)

      flushPendingLines(parentScope)
      parentScope.bodyLines.push(...completedScope.headerLines)
      parentScope.bodyLines.push(...trimTrailingBlankLines(completedScope.bodyLines))
      parentScope.bodyLines.push(line)
      continue
    }

    const declaration = parseTokenDeclaration(line)

    if (declaration) {
      if (retainedTokenNames.has(declaration.tokenName)) {
        flushPendingLines(currentScope)
        currentScope.bodyLines.push(line)
      }

      continue
    }

    currentScope.pendingLines.push(line)
  }

  return ensureTrailingNewline(trimTrailingBlankLines(rootScope.bodyLines).join('\n'))
}

function createCssScope(headerLines = []) {
  return {
    bodyLines: [],
    headerLines,
    pendingLines: [],
  }
}

function flushPendingLines(scope) {
  if (!scope || scope.pendingLines.length === 0) {
    return
  }

  scope.bodyLines.push(...scope.pendingLines)
  scope.pendingLines = []
}

function parseTokenDeclaration(line) {
  const trimmedLine = line.trim()

  if (!trimmedLine.startsWith('--')) {
    return null
  }

  const separatorIndex = trimmedLine.indexOf(':')
  const terminatorIndex = trimmedLine.indexOf(';')

  if (separatorIndex === -1 || terminatorIndex === -1 || separatorIndex >= terminatorIndex) {
    return null
  }

  return {
    tokenName: trimmedLine.slice(0, separatorIndex).trim(),
    value: trimmedLine.slice(separatorIndex + 1, terminatorIndex).trim(),
  }
}

function joinCssParts(parts) {
  return ensureTrailingNewline(parts.map(part => part.trimEnd()).join('\n\n'))
}

function trimTrailingBlankLines(lines) {
  const nextLines = [...lines]

  while (nextLines.length > 0 && nextLines.at(-1)?.trim() === '') {
    nextLines.pop()
  }

  return nextLines
}
