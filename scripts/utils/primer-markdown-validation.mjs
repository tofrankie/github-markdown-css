import { normalizeTokenValue } from './primer-markdown-tokens.mjs'

export function assertNoMissingRequiredTokenNames(tokenScope) {
  if (tokenScope.missingRequiredTokenNames.length === 0) {
    return
  }

  throw new Error(
    `Missing required token sources: ${tokenScope.missingRequiredTokenNames.join(', ')}`
  )
}

export function buildValidationReport({
  baseArtifacts,
  fullBundles,
  markdownTokenNames,
  paths,
  slimArtifacts,
  themeArtifacts,
  tokenScope,
}) {
  const fullBaseCoverage = buildCoverageReport({
    artifacts: baseArtifacts,
    requiredTokenNames: new Set(
      [...tokenScope.baseTokenNamesByArtifactKey.values()].flatMap(tokenSet => [...tokenSet])
    ),
  })
  const slimBaseCoverage = buildCoverageReport({
    artifacts: slimArtifacts.baseArtifacts,
    requiredTokenNames: new Set(
      slimArtifacts.baseArtifacts.flatMap(artifact => [...(artifact.retainedTokenNames ?? [])])
    ),
  })
  const themeReports = themeArtifacts.map(themeArtifact => {
    const slimThemeArtifact = slimArtifacts.themeArtifacts.find(
      candidate => candidate.key === themeArtifact.key
    )
    const fullBundle = fullBundles.find(bundle => bundle.themeKey === themeArtifact.key)
    const slimBundle = slimArtifacts.bundles.find(bundle => bundle.themeKey === themeArtifact.key)

    if (!slimThemeArtifact || !fullBundle || !slimBundle) {
      throw new Error(`Missing full/slim artifact pair for theme ${themeArtifact.key}`)
    }

    const fullCoverage = buildCoverageReport({
      artifacts: [themeArtifact],
      requiredTokenNames: tokenScope.themeTokenNames,
    })
    const slimCoverage = buildCoverageReport({
      artifacts: [slimThemeArtifact],
      requiredTokenNames: tokenScope.themeTokenNames,
    })

    return {
      bundleComparison: compareBundleTokenDefinitions({
        fullBundleCss: fullBundle.css,
        slimBundleCss: slimBundle.css,
        tokenNames: tokenScope.requiredTokenNames,
      }),
      fullCoverage,
      key: themeArtifact.key,
      slimCoverage,
      slimTokenCount: slimThemeArtifact.retainedTokenNames.size,
      totalThemeTokenCount: themeArtifact.definedTokenNames.size,
    }
  })

  validateCoverageReport(fullBaseCoverage, 'full base')
  validateCoverageReport(slimBaseCoverage, 'slim base')

  for (const themeReport of themeReports) {
    validateCoverageReport(themeReport.fullCoverage, `full theme ${themeReport.key}`)
    validateCoverageReport(themeReport.slimCoverage, `slim theme ${themeReport.key}`)
    validateBundleComparison(themeReport.bundleComparison, themeReport.key)
  }

  return {
    extraMarkdownTokenJsonPaths: paths.hooks.extraMarkdownTokenJsonPaths,
    extraScssSourcePaths: paths.hooks.extraScssSourcePaths,
    markdownTokenNames: [...markdownTokenNames].sort(),
    summary: {
      slimBaseTokenCount: slimArtifacts.baseArtifacts.reduce(
        (count, artifact) => count + (artifact.retainedTokenNames?.size ?? 0),
        0
      ),
      themeReports,
      unresolvedOptionalTokenNames: [...tokenScope.unresolvedOptionalTokenNames].sort(),
    },
    tokenScope: {
      base: Object.fromEntries(
        [...tokenScope.baseTokenNamesByArtifactKey.entries()].map(([key, tokenSet]) => [
          key,
          [...tokenSet].sort(),
        ])
      ),
      required: [...tokenScope.requiredTokenNames].sort(),
      theme: [...tokenScope.themeTokenNames].sort(),
    },
  }
}

export function assertValidationReport({ markdownTokenNames, report }) {
  const scopedCount =
    Object.values(report.tokenScope.base).reduce(
      (count, tokenNames) => count + tokenNames.length,
      0
    ) + report.tokenScope.theme.length

  if (scopedCount === 0) {
    throw new Error('No in-scope markdown tokens were captured for validation')
  }

  for (const themeReport of report.summary.themeReports) {
    if (themeReport.slimTokenCount === 0) {
      throw new Error(`Slim theme ${themeReport.key} did not retain any tokens`)
    }

    if (themeReport.slimTokenCount >= themeReport.totalThemeTokenCount) {
      throw new Error(`Slim theme ${themeReport.key} was not reduced from the full theme`)
    }
  }

  for (const tokenName of report.summary.unresolvedOptionalTokenNames) {
    if (!markdownTokenNames.includes(tokenName)) {
      throw new Error(`Unexpected unresolved optional token: ${tokenName}`)
    }
  }
}

function buildCoverageReport({ artifacts, requiredTokenNames }) {
  const availableTokenNames = new Set()
  const danglingReferences = []

  for (const artifact of artifacts) {
    for (const tokenName of artifact.definedTokenNames) {
      availableTokenNames.add(tokenName)
    }
  }

  for (const artifact of artifacts) {
    for (const [tokenName, definition] of artifact.definitionMap) {
      if (!availableTokenNames.has(tokenName)) {
        continue
      }

      for (const referenceName of definition.referenceNames) {
        if (artifact.definitionMap.has(referenceName) && !availableTokenNames.has(referenceName)) {
          danglingReferences.push({ referenceName, tokenName })
        }
      }
    }
  }

  return {
    danglingReferences,
    missingTokenNames: [...requiredTokenNames].filter(
      tokenName => !availableTokenNames.has(tokenName)
    ),
  }
}

function compareBundleTokenDefinitions({ fullBundleCss, slimBundleCss, tokenNames }) {
  const fullDefinitions = createTokenDefinitionMap(fullBundleCss)
  const slimDefinitions = createTokenDefinitionMap(slimBundleCss)
  const missingFromSlim = []
  const mismatchedValues = []

  for (const tokenName of tokenNames) {
    if (!fullDefinitions.has(tokenName)) {
      continue
    }

    if (!slimDefinitions.has(tokenName)) {
      missingFromSlim.push(tokenName)
      continue
    }

    const fullValue = normalizeTokenValue(fullDefinitions.get(tokenName).value)
    const slimValue = normalizeTokenValue(slimDefinitions.get(tokenName).value)

    if (fullValue !== slimValue) {
      mismatchedValues.push({ fullValue, slimValue, tokenName })
    }
  }

  return {
    mismatchedValues,
    missingFromSlim,
  }
}

function createTokenDefinitionMap(css) {
  const definitionMap = new Map()

  for (const line of css.split('\n')) {
    const trimmedLine = line.trim()

    if (!trimmedLine.startsWith('--')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf(':')
    const terminatorIndex = trimmedLine.indexOf(';')

    if (separatorIndex === -1 || terminatorIndex === -1 || separatorIndex >= terminatorIndex) {
      continue
    }

    const tokenName = trimmedLine.slice(0, separatorIndex).trim()
    const value = trimmedLine.slice(separatorIndex + 1, terminatorIndex).trim()

    definitionMap.set(tokenName, { value })
  }

  return definitionMap
}

function validateCoverageReport(report, label) {
  if (report.missingTokenNames.length > 0) {
    throw new Error(`${label} is missing tokens: ${report.missingTokenNames.join(', ')}`)
  }

  if (report.danglingReferences.length > 0) {
    const danglingMessage = report.danglingReferences
      .map(({ tokenName, referenceName }) => `${tokenName} -> ${referenceName}`)
      .join(', ')

    throw new Error(`${label} has dangling references: ${danglingMessage}`)
  }
}

function validateBundleComparison(report, themeKey) {
  if (report.missingFromSlim.length > 0) {
    throw new Error(
      `Slim bundle for ${themeKey} is missing in-scope tokens: ${report.missingFromSlim.join(', ')}`
    )
  }

  if (report.mismatchedValues.length > 0) {
    const mismatchMessage = report.mismatchedValues
      .map(({ tokenName, fullValue, slimValue }) => `${tokenName} (${fullValue} !== ${slimValue})`)
      .join(', ')

    throw new Error(`Slim bundle for ${themeKey} has mismatched token values: ${mismatchMessage}`)
  }
}
