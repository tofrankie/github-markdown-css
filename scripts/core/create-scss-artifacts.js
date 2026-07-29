function toScssStringLiteral(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
}

// eslint-disable-next-line no-unused-vars
function toScssList(values) {
  return `(${values.map(toScssStringLiteral).join(', ')})`
}

function toScssMapRecord(entries) {
  return `(\n${entries.map(([key, value]) => `  ${key}: ${value},`).join('\n')}\n)`
}

export function createScssArtifacts({ baseArtifacts, markdownCss, themeArtifacts }) {
  const themeArtifactMap = new Map(themeArtifacts.map(artifact => [artifact.key, artifact]))
  const baseTokenMap = extractUniqueTokenMap(baseArtifacts.flatMap(extractTopLevelBodyLines))
  const lightTokenMap = extractUniqueTokenMap(
    extractTopLevelBodyLines(themeArtifactMap.get('light'))
  )
  const darkTokenMap = extractUniqueTokenMap(extractTopLevelBodyLines(themeArtifactMap.get('dark')))
  const markdownLines = markdownCss
    .trimEnd()
    .split('\n')
    .map(line => line.replaceAll('.markdown-body', '#{$container}'))

  return {
    css: buildScssIndex({
      baseTokenMap,
      darkTokenMap,
      lightTokenMap,
      markdownLines,
    }),
    fileName: 'index.scss',
  }
}

function buildScssIndex({ baseTokenMap, darkTokenMap, lightTokenMap, markdownLines }) {
  return `@use 'sass:list';
@use 'sass:map';

$base-token-map: ${toScssMapRecord(
    [...baseTokenMap.entries()].map(([tokenName, value]) => [tokenName, toScssStringLiteral(value)])
  )};
$theme-token-lines: ${toScssMapRecord([
    [
      'light',
      toScssMapRecord(
        [...lightTokenMap.entries()].map(([tokenName, value]) => [
          tokenName,
          toScssStringLiteral(value),
        ])
      ),
    ],
    [
      'dark',
      toScssMapRecord(
        [...darkTokenMap.entries()].map(([tokenName, value]) => [
          tokenName,
          toScssStringLiteral(value),
        ])
      ),
    ],
  ])};

@mixin _emit-token-map($token-map) {
  @each $token-name, $token-value in $token-map {
    #{$token-name}: #{$token-value};
  }
}

@mixin _emit-selector-block($selector, $container, $token-map) {
  #{$selector} #{$container} {
    @include _emit-token-map($token-map);
  }
}

@mixin render-theme-tokens($options: ()) {
  $container: map.get($options, container);
  @if $container == null {
    $container: '.markdown-body';
  }

  #{$container} {
    @include _emit-token-map($base-token-map);
  }

  $modes: map.get($options, modes);
  @if $modes == null {
    @error 'render-theme-tokens() requires an explicit modes map';
  }

  @each $mode-name, $mode in $modes {
    $selectors: map.get($mode, selectors);
    $tokens-key: map.get($mode, tokens);
    $media: map.get($mode, media);

    @if $selectors == null or $tokens-key == null {
      @error 'Each mode requires selectors and tokens';
    }

    $token-map: map.get($theme-token-lines, $tokens-key);
    @if $token-map == null {
      @error 'Unknown token set: #{$tokens-key}';
    }

    @if $media != null {
      @media #{$media} {
        @each $selector in $selectors {
          @include _emit-selector-block($selector, $container, $token-map);
        }
      }
    } @else {
      @each $selector in $selectors {
        @include _emit-selector-block($selector, $container, $token-map);
      }
    }
  }
}

@mixin render-rules($options: ()) {
  $container: map.get($options, container);
  @if $container == null {
    $container: '.markdown-body';
  }

${markdownLines.map(line => `  ${line}`).join('\n')}
}
`
}

function extractTopLevelBodyLines(artifact) {
  if (!artifact) {
    return []
  }

  const lines = artifact.css.split('\n')
  let headerFound = false
  let depth = 0
  const bodyLines = []

  for (const line of lines) {
    if (!headerFound) {
      if (line.includes('{')) {
        headerFound = true
        depth = 1
      }

      continue
    }

    depth += (line.match(/\{/g) ?? []).length
    depth -= (line.match(/\}/g) ?? []).length

    if (depth <= 0) {
      break
    }

    bodyLines.push(line)
  }

  return bodyLines
}

function extractUniqueTokenMap(lines) {
  const nextMap = new Map()

  for (const line of lines) {
    const declaration = parseTokenDeclaration(line)

    if (!declaration) {
      continue
    }

    if (nextMap.has(declaration.tokenName)) {
      continue
    }

    nextMap.set(declaration.tokenName, declaration.value)
  }

  return nextMap
}

function parseTokenDeclaration(line) {
  const trimmed = line.trim()

  if (!trimmed.startsWith('--')) {
    return null
  }

  const separatorIndex = trimmed.indexOf(':')
  const terminatorIndex = trimmed.indexOf(';')

  if (separatorIndex === -1 || terminatorIndex === -1 || separatorIndex >= terminatorIndex) {
    return null
  }

  return {
    tokenName: trimmed.slice(0, separatorIndex).trim(),
    value: trimmed.slice(separatorIndex + 1, terminatorIndex).trim(),
  }
}
