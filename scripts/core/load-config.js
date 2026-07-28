import { cwd, projectConfig } from '../config/project.js'
import { autoThemeBundles } from '../config/published-bundles.js'
import { extraMarkdownTokenInputs, tokenSources } from '../config/token-sources.js'

import { createBuildContext } from './build-context.js'

export function loadBuildContext() {
  return createBuildContext({
    autoThemeBundles,
    cwd,
    extraMarkdownTokenInputs,
    projectConfig,
    tokenSources,
  })
}
