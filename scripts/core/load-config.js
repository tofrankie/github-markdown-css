import { exportGroups, publishedAutoBundles, publishedThemeKeys } from '../config/export-groups.js'
import { cwd, projectConfig } from '../config/project.js'
import { extraMarkdownTokenInputs, tokenSources } from '../config/token-sources.js'

import { createBuildContext } from './build-context.js'

export function loadBuildContext() {
  return createBuildContext({
    cwd,
    exportGroups,
    extraMarkdownTokenInputs,
    publishedAutoBundles,
    publishedThemeKeys,
    projectConfig,
    tokenSources,
  })
}
