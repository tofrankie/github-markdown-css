import { buildConfig, cwd } from './build-config.mjs'
import { createPrimerMarkdownPaths } from './utils/primer-markdown-paths.mjs'
import { createPublishedArtifacts } from './utils/primer-markdown-published.mjs'
import {
  buildMarkdownCss,
  readBaseArtifacts,
  readExtraMarkdownTokenNames,
  readThemeArtifacts,
} from './utils/primer-markdown-sources.mjs'
import {
  createMarkdownTokenNames,
  createSlimArtifacts,
  resolveMarkdownTokenScope,
} from './utils/primer-markdown-tokens.mjs'
import { assertNoMissingRequiredTokenNames } from './utils/primer-markdown-validation.mjs'
import {
  preparePublishedOutputDirectory,
  writePublishedArtifacts,
} from './utils/primer-markdown-write.mjs'

const paths = createPrimerMarkdownPaths({ buildConfig, cwd })

main()

async function main() {
  await preparePublishedOutputDirectory(paths)

  const markdownCss = await buildMarkdownCss(paths)
  const extraMarkdownTokenNames = await readExtraMarkdownTokenNames(paths)
  const baseArtifacts = await readBaseArtifacts(paths)
  const themeArtifacts = await readThemeArtifacts(paths)
  const markdownTokenNames = createMarkdownTokenNames({
    extraTokenNames: extraMarkdownTokenNames,
    markdownCss,
  })
  const tokenScope = resolveMarkdownTokenScope({
    baseArtifacts,
    themeArtifacts,
    tokenNames: markdownTokenNames,
  })

  if (tokenScope.themeTokenNames.size === 0) {
    throw new Error(
      'No theme token references were found in the compiled markdown CSS. The entry file may be in a transient edit state, or it may no longer import the Primer markdown source.'
    )
  }

  const slimArtifacts = createSlimArtifacts({
    baseArtifacts,
    markdownCss,
    themeArtifacts,
    tokenScope,
  })
  // Publish from the slimmed token set so the npm-facing files stay aligned with validation.
  const publishedArtifacts = createPublishedArtifacts({
    autoThemePairs: paths.hooks.publishedAutoThemePairs,
    baseArtifacts: slimArtifacts.baseArtifacts,
    markdownCss,
    themeArtifacts: slimArtifacts.themeArtifacts,
  })

  assertNoMissingRequiredTokenNames(tokenScope)

  await writePublishedArtifacts({
    publishedArtifacts,
    paths,
  })
}
