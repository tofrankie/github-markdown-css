import {
  buildMarkdownCss,
  readBaseArtifacts,
  readExtraMarkdownTokenNames,
  readThemeArtifacts,
} from './core/collect-sources.js'
import { createPublishedArtifacts } from './core/create-published-artifacts.js'
import { loadBuildContext } from './core/load-config.js'
import {
  createMarkdownTokenNames,
  createSlimArtifacts,
  resolveMarkdownTokenScope,
} from './core/resolve-token-scope.js'
import { assertNoMissingRequiredTokenNames } from './core/validate-artifacts.js'
import { preparePublishedOutputDirectory, writePublishedArtifacts } from './core/write-artifacts.js'

main()

async function main() {
  const paths = loadBuildContext()

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
    autoThemePairs: paths.publishedBundles.auto,
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
