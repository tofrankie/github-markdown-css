import { ensureTrailingNewline } from './resolve-token-scope.js'

export function createPublishedArtifacts({
  autoThemePairs,
  baseArtifacts,
  markdownCss,
  themeArtifacts,
}) {
  const themeArtifactMap = new Map(themeArtifacts.map(artifact => [artifact.key, artifact]))

  return {
    generic: {
      autos: autoThemePairs.map(pair =>
        createGenericAutoBundle({
          baseArtifacts,
          darkThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.darkThemeKey),
          fileName: pair.fileName,
          lightThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.lightThemeKey),
          markdownCss,
        })
      ),
      themes: themeArtifacts.map(themeArtifact =>
        createGenericThemeBundle({ baseArtifacts, markdownCss, themeArtifact })
      ),
    },
    primer: {
      autos: autoThemePairs.map(pair =>
        createPrimerAutoBundle({
          baseArtifacts,
          darkThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.darkThemeKey),
          fileName: pair.fileName,
          lightThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.lightThemeKey),
          markdownCss,
        })
      ),
      themes: themeArtifacts.map(themeArtifact =>
        createPrimerThemeBundle({ baseArtifacts, markdownCss, themeArtifact })
      ),
    },
    pure: createPureBundle({ markdownCss }),
    vscode: {
      autos: autoThemePairs.map(pair =>
        createVscodeAutoBundle({
          baseArtifacts,
          darkThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.darkThemeKey),
          fileName: pair.fileName,
          lightThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.lightThemeKey),
          markdownCss,
        })
      ),
      themes: themeArtifacts.map(themeArtifact =>
        createVscodeThemeBundle({ baseArtifacts, markdownCss, themeArtifact })
      ),
    },
  }
}

function createGenericThemeBundle({ baseArtifacts, markdownCss, themeArtifact }) {
  const themeStructure = parseThemeArtifactStructure(themeArtifact)

  return {
    css: joinCssParts([
      buildMarkdownBodyTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildMarkdownBodyTokenBlock(themeStructure.topLevelBodyLines),
      buildMediaMarkdownBodyTokenBlock(themeStructure.darkMediaBodyLines),
      markdownCss,
    ]),
    fileName: `${themeArtifact.key}.css`,
    kind: 'theme',
    group: 'generic',
    themeKey: themeArtifact.key,
  }
}

function createGenericAutoBundle({
  baseArtifacts,
  darkThemeArtifact,
  fileName,
  lightThemeArtifact,
  markdownCss,
}) {
  const lightThemeStructure = parseThemeArtifactStructure(lightThemeArtifact)
  const darkThemeStructure = parseThemeArtifactStructure(darkThemeArtifact)

  return {
    css: joinCssParts([
      buildMarkdownBodyTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildMarkdownBodyTokenBlock(lightThemeStructure.topLevelBodyLines),
      buildMediaMarkdownBodyTokenBlock(darkThemeStructure.darkMediaBodyLines),
      markdownCss,
    ]),
    darkThemeKey: darkThemeArtifact.key,
    fileName: `${fileName}.css`,
    group: 'generic',
    kind: 'auto',
    lightThemeKey: lightThemeArtifact.key,
  }
}

function createPrimerThemeBundle({ baseArtifacts, markdownCss, themeArtifact }) {
  const themeStructure = parseThemeArtifactStructure(themeArtifact)
  const isLight = themeArtifact.key.startsWith('light')
  const fixedSelectors = isLight
    ? [
        "[data-color-mode='light'][data-light-theme='light']",
        "[data-color-mode='auto'][data-light-theme='light']",
      ]
    : [
        "[data-color-mode='dark'][data-dark-theme='dark']",
        "[data-color-mode='auto'][data-light-theme='dark']",
      ]
  const darkMediaSelectors = isLight
    ? ["[data-color-mode='auto'][data-dark-theme='light']"]
    : ["[data-color-mode='auto'][data-dark-theme='dark']"]

  return {
    css: joinCssParts([
      buildMarkdownBodyTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildScopeBlock(fixedSelectors, themeStructure.topLevelBodyLines),
      buildScopeBlock(darkMediaSelectors, themeStructure.darkMediaBodyLines, {
        media: '(prefers-color-scheme: dark)',
      }),
      markdownCss,
    ]),
    fileName: `${themeArtifact.key}.css`,
    group: 'primer',
    kind: 'theme',
    themeKey: themeArtifact.key,
  }
}

function createPrimerAutoBundle({
  baseArtifacts,
  darkThemeArtifact,
  fileName,
  lightThemeArtifact,
  markdownCss,
}) {
  const lightThemeStructure = parseThemeArtifactStructure(lightThemeArtifact)
  const darkThemeStructure = parseThemeArtifactStructure(darkThemeArtifact)

  return {
    css: joinCssParts([
      buildMarkdownBodyTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildScopeBlock(
        [
          `[data-color-mode='light'][data-light-theme='${lightThemeStructure.lightThemeSelectorKey}']`,
        ],
        lightThemeStructure.topLevelBodyLines
      ),
      buildScopeBlock(
        [
          `[data-color-mode='auto'][data-light-theme='${lightThemeStructure.lightThemeSelectorKey}']`,
        ],
        lightThemeStructure.topLevelBodyLines,
        { media: '(prefers-color-scheme: light)' }
      ),
      buildScopeBlock(
        [`[data-color-mode='dark'][data-dark-theme='${darkThemeStructure.darkThemeSelectorKey}']`],
        darkThemeStructure.topLevelBodyLines
      ),
      buildScopeBlock(
        [`[data-color-mode='auto'][data-dark-theme='${darkThemeStructure.darkThemeSelectorKey}']`],
        darkThemeStructure.darkMediaBodyLines,
        { media: '(prefers-color-scheme: dark)' }
      ),
      markdownCss,
    ]),
    darkThemeKey: darkThemeArtifact.key,
    fileName: `${fileName}.css`,
    group: 'primer',
    kind: 'auto',
    lightThemeKey: lightThemeArtifact.key,
  }
}

function createVscodeThemeBundle({ baseArtifacts, markdownCss, themeArtifact }) {
  const themeStructure = parseThemeArtifactStructure(themeArtifact)
  const selector = themeArtifact.key.startsWith('light')
    ? "body[data-vscode-theme-kind='vscode-light'] .markdown-body"
    : "body[data-vscode-theme-kind='vscode-dark'] .markdown-body"

  return {
    css: joinCssParts([
      buildMarkdownBodyTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildScopeBlock([selector], themeStructure.topLevelBodyLines),
      buildScopeBlock([selector], themeStructure.darkMediaBodyLines, {
        media: '(prefers-color-scheme: dark)',
      }),
      markdownCss,
    ]),
    fileName: `${themeArtifact.key}.css`,
    group: 'vscode',
    kind: 'theme',
    themeKey: themeArtifact.key,
  }
}

function createVscodeAutoBundle({
  baseArtifacts,
  darkThemeArtifact,
  fileName,
  lightThemeArtifact,
  markdownCss,
}) {
  const lightThemeStructure = parseThemeArtifactStructure(lightThemeArtifact)
  const darkThemeStructure = parseThemeArtifactStructure(darkThemeArtifact)

  return {
    css: joinCssParts([
      buildMarkdownBodyTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildScopeBlock(
        ["body[data-vscode-theme-kind='vscode-light'] .markdown-body"],
        lightThemeStructure.topLevelBodyLines
      ),
      buildScopeBlock(
        ["body[data-vscode-theme-kind='vscode-dark'] .markdown-body"],
        darkThemeStructure.topLevelBodyLines
      ),
      markdownCss,
    ]),
    darkThemeKey: darkThemeArtifact.key,
    fileName: `${fileName}.css`,
    group: 'vscode',
    kind: 'auto',
    lightThemeKey: lightThemeArtifact.key,
  }
}

function createPureBundle({ markdownCss }) {
  return {
    css: markdownCss,
    fileName: 'pure.css',
    group: 'pure',
    kind: 'theme',
  }
}

function parseThemeArtifactStructure(themeArtifact) {
  const topLevelScope = extractFirstTopLevelScope(themeArtifact.css)
  const darkMediaScope = extractDarkMediaScope(themeArtifact.css)

  return {
    darkMediaBodyLines: darkMediaScope.bodyLines,
    darkMediaSelectors: extractSelectors(darkMediaScope.headerLines),
    darkThemeSelectorKey:
      extractSelectorAttributeValue(darkMediaScope.headerLines, 'data-dark-theme') ??
      extractSelectorAttributeValue(topLevelScope.headerLines, 'data-dark-theme'),
    lightThemeSelectorKey: extractSelectorAttributeValue(
      topLevelScope.headerLines,
      'data-light-theme'
    ),
    topLevelBodyLines: topLevelScope.bodyLines,
    topLevelSelectors: extractSelectors(topLevelScope.headerLines),
  }
}

function extractFirstTopLevelScope(css) {
  const lines = css.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim()

    if (trimmedLine === '' || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
      continue
    }

    if (trimmedLine.startsWith('@media')) {
      continue
    }

    if (trimmedLine.includes('{')) {
      return consumeScope(lines, index)
    }
  }

  throw new Error('Unable to find top-level theme selector block')
}

function extractDarkMediaScope(css) {
  const lines = css.split('\n')
  const mediaStartIndex = lines.findIndex(line =>
    line.trim().startsWith('@media (prefers-color-scheme: dark)')
  )

  if (mediaStartIndex === -1) {
    throw new Error('Unable to find dark media theme selector block')
  }

  const mediaScope = consumeScope(lines, mediaStartIndex)
  return extractFirstNestedScope(mediaScope.bodyLines)
}

function extractFirstNestedScope(lines) {
  for (let index = 0; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim()

    if (trimmedLine === '' || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
      continue
    }

    if (trimmedLine.includes('{')) {
      return consumeScope(lines, index)
    }
  }

  throw new Error('Unable to find nested selector block')
}

function consumeScope(lines, startIndex) {
  const headerLines = []
  let index = startIndex

  while (index < lines.length) {
    headerLines.push(lines[index])

    if (lines[index].includes('{')) {
      break
    }

    index += 1
  }

  let depth = countBraceDelta(lines[index])
  index += 1
  const bodyLines = []

  while (index < lines.length && depth > 0) {
    const line = lines[index]
    depth += countBraceDelta(line)

    if (depth > 0) {
      bodyLines.push(line)
    }

    index += 1
  }

  return {
    bodyLines: trimTrailingBlankLines(bodyLines),
    endIndex: index,
    headerLines,
  }
}

function countBraceDelta(line) {
  return (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
}

function extractSelectorAttributeValue(headerLines, attributeName) {
  const headerText = headerLines.join('\n')
  const pattern = new RegExp(`${attributeName}=['"]([^'"]+)['"]`)

  return headerText.match(pattern)?.[1] ?? null
}

function extractSelectors(headerLines) {
  return headerLines
    .join('\n')
    .replace(/\{/g, '')
    .split(',')
    .map(selector => selector.trim())
    .filter(Boolean)
}

function buildMarkdownBodyTokenBlock(bodyLines) {
  return ensureTrailingNewline(
    `.markdown-body {\n${trimTrailingBlankLines(bodyLines).join('\n')}\n}`
  )
}

function buildMediaMarkdownBodyTokenBlock(bodyLines) {
  return ensureTrailingNewline(
    `@media (prefers-color-scheme: dark) {\n${indentLines(
      buildMarkdownBodyTokenBlock(bodyLines).trimEnd(),
      2
    )}\n}`
  )
}

function buildScopeBlock(selectors, bodyLines, { media } = {}) {
  const block = ensureTrailingNewline(`${selectors.join(',\n')} {\n${bodyLines.join('\n')}\n}`)

  if (!media) {
    return block
  }

  return ensureTrailingNewline(`@media ${media} {\n${indentLines(block.trimEnd(), 2)}\n}`)
}

function extractMergedBodyLines(baseArtifacts) {
  const emittedTokenNames = new Set()
  let hasPreviousSection = false

  return baseArtifacts.flatMap(artifact => {
    if (artifact.css.trim() === '') {
      return []
    }

    const scope = extractFirstTopLevelScope(artifact.css)
    const nextLines = scope.bodyLines.filter(line => {
      const declaration = parseTokenDeclaration(line)

      if (!declaration) {
        return true
      }

      if (emittedTokenNames.has(declaration.tokenName)) {
        return false
      }

      emittedTokenNames.add(declaration.tokenName)
      return true
    })

    const nextTokenLines = nextLines.filter(line => line.trim() !== '')

    if (nextTokenLines.length === 0) {
      return []
    }

    const section = []

    if (hasPreviousSection) {
      section.push('')
    }

    section.push(`  /* source: ${formatSourceCommentPath(artifact)} */`)
    section.push(...nextLines)
    hasPreviousSection = true

    return section
  })
}

function formatSourceCommentPath(artifact) {
  const sourcePath = artifact.displayPath ?? artifact.path

  if (sourcePath.startsWith('node_modules/')) {
    return sourcePath.slice('node_modules/'.length)
  }

  return sourcePath
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
  }
}

function indentLines(value, size) {
  const indent = ' '.repeat(size)

  return value
    .split('\n')
    .map(line => `${indent}${line}`)
    .join('\n')
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

function getRequiredThemeArtifact(themeArtifactMap, themeKey) {
  const themeArtifact = themeArtifactMap.get(themeKey)

  if (!themeArtifact) {
    throw new Error(`Missing theme artifact for ${themeKey}`)
  }

  return themeArtifact
}
