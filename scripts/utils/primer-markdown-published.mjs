import { ensureTrailingNewline } from './primer-markdown-tokens.mjs'

export function createPublishedArtifacts({
  autoThemePairs,
  baseArtifacts,
  markdownCss,
  themeArtifacts,
}) {
  const themeArtifactMap = new Map(themeArtifacts.map(artifact => [artifact.key, artifact]))

  const primerThemeBundles = themeArtifacts.map(themeArtifact =>
    createPrimerThemeBundle({ baseArtifacts, markdownCss, themeArtifact })
  )
  const scopedThemeBundles = themeArtifacts.map(themeArtifact =>
    createScopedThemeBundle({ baseArtifacts, markdownCss, themeArtifact })
  )
  const primerAutoBundles = autoThemePairs.map(pair =>
    createPrimerAutoBundle({
      baseArtifacts,
      darkThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.darkThemeKey),
      key: pair.key,
      lightThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.lightThemeKey),
      markdownCss,
    })
  )
  const scopedAutoBundles = autoThemePairs.map(pair =>
    createScopedAutoBundle({
      baseArtifacts,
      darkThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.darkThemeKey),
      key: pair.key,
      lightThemeArtifact: getRequiredThemeArtifact(themeArtifactMap, pair.lightThemeKey),
      markdownCss,
    })
  )

  return {
    primer: {
      autos: primerAutoBundles,
      themes: primerThemeBundles,
    },
    scoped: {
      autos: scopedAutoBundles,
      themes: scopedThemeBundles,
    },
  }
}

function createPrimerThemeBundle({ baseArtifacts, markdownCss, themeArtifact }) {
  const themeStructure = parseThemeArtifactStructure(themeArtifact)

  return {
    css: joinCssParts([
      buildRootTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildSelectorBlock(
        [
          `[data-color-mode='light'][data-light-theme='${themeStructure.lightThemeSelectorKey}']`,
          `[data-color-mode='dark'][data-dark-theme='${themeStructure.darkThemeSelectorKey}']`,
          `[data-color-mode='auto'][data-light-theme='${themeStructure.lightThemeSelectorKey}']`,
        ],
        themeStructure.topLevelBodyLines
      ),
      buildMediaSelectorBlock(
        [
          "[data-color-mode][data-color-mode='auto'][data-dark-theme='" +
            `${themeStructure.darkThemeSelectorKey}']`,
        ],
        themeStructure.darkMediaBodyLines
      ),
      markdownCss,
    ]),
    fileName: `${themeArtifact.key}.css`,
    darkThemeSelectorKey: themeStructure.darkThemeSelectorKey,
    kind: 'theme',
    lightThemeSelectorKey: themeStructure.lightThemeSelectorKey,
    scope: 'primer',
    themeKey: themeArtifact.key,
  }
}

function createScopedThemeBundle({ baseArtifacts, markdownCss, themeArtifact }) {
  const themeStructure = parseThemeArtifactStructure(themeArtifact)

  return {
    css: joinCssParts([
      buildMarkdownBodyTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildMarkdownBodyTokenBlock(themeStructure.topLevelBodyLines),
      markdownCss,
    ]),
    fileName: `${themeArtifact.key}.css`,
    kind: 'theme',
    scope: 'scoped',
    themeKey: themeArtifact.key,
  }
}

function createPrimerAutoBundle({
  baseArtifacts,
  darkThemeArtifact,
  key,
  lightThemeArtifact,
  markdownCss,
}) {
  const lightThemeStructure = parseThemeArtifactStructure(lightThemeArtifact)
  const darkThemeStructure = parseThemeArtifactStructure(darkThemeArtifact)

  return {
    css: joinCssParts([
      buildRootTokenBlock(extractMergedBodyLines(baseArtifacts)),
      buildSelectorBlock(
        [
          `[data-color-mode='light'][data-light-theme='${lightThemeStructure.lightThemeSelectorKey}']`,
          `[data-color-mode='auto'][data-light-theme='${lightThemeStructure.lightThemeSelectorKey}']`,
        ],
        lightThemeStructure.topLevelBodyLines
      ),
      buildMediaSelectorBlock(
        [
          "[data-color-mode][data-color-mode='auto'][data-dark-theme='" +
            `${darkThemeStructure.darkThemeSelectorKey}']`,
        ],
        darkThemeStructure.darkMediaBodyLines
      ),
      markdownCss,
    ]),
    darkThemeKey: darkThemeArtifact.key,
    darkThemeSelectorKey: darkThemeStructure.darkThemeSelectorKey,
    fileName: `${key}.css`,
    kind: 'auto',
    lightThemeKey: lightThemeArtifact.key,
    lightThemeSelectorKey: lightThemeStructure.lightThemeSelectorKey,
    scope: 'primer',
  }
}

function createScopedAutoBundle({
  baseArtifacts,
  darkThemeArtifact,
  key,
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
    fileName: `${key}.css`,
    kind: 'auto',
    lightThemeKey: lightThemeArtifact.key,
    scope: 'scoped',
  }
}

function parseThemeArtifactStructure(themeArtifact) {
  const topLevelScope = extractFirstTopLevelScope(themeArtifact.css)
  const darkMediaScope = extractDarkMediaScope(themeArtifact.css)

  return {
    darkMediaBodyLines: darkMediaScope.bodyLines,
    darkThemeSelectorKey:
      extractSelectorAttributeValue(darkMediaScope.headerLines, 'data-dark-theme') ??
      extractSelectorAttributeValue(topLevelScope.headerLines, 'data-dark-theme'),
    lightThemeSelectorKey: extractSelectorAttributeValue(
      topLevelScope.headerLines,
      'data-light-theme'
    ),
    topLevelBodyLines: topLevelScope.bodyLines,
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
  // Primer nests the dark selector inside the media query; the published builders only need that inner block.
  const nestedScope = extractFirstNestedScope(mediaScope.bodyLines)

  return nestedScope
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

function buildSelectorBlock(selectors, bodyLines) {
  return ensureTrailingNewline(`${selectors.join(',\n')} {\n${bodyLines.join('\n')}\n}`)
}

function buildMediaSelectorBlock(selectors, bodyLines) {
  return ensureTrailingNewline(
    `@media (prefers-color-scheme: dark) {\n${indentLines(
      buildSelectorBlock(selectors, bodyLines).trimEnd(),
      2
    )}\n}`
  )
}

function buildMarkdownBodyTokenBlock(bodyLines) {
  return ensureTrailingNewline(`.markdown-body {\n${bodyLines.join('\n')}\n}`)
}

function buildRootTokenBlock(bodyLines) {
  return ensureTrailingNewline(`:root {\n${bodyLines.join('\n')}\n}`)
}

function buildMediaMarkdownBodyTokenBlock(bodyLines) {
  return ensureTrailingNewline(
    `@media (prefers-color-scheme: dark) {\n${indentLines(
      buildMarkdownBodyTokenBlock(bodyLines).trimEnd(),
      2
    )}\n}`
  )
}

function extractMergedBodyLines(baseArtifacts) {
  // Base size and typography stay separate in source/slim artifacts, but published bundles
  // collapse them into one scope block to keep the final CSS easier to consume.
  return baseArtifacts.flatMap((artifact, index) => {
    const scope = extractFirstTopLevelScope(artifact.css)

    return index === 0 ? scope.bodyLines : ['', ...scope.bodyLines]
  })
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
