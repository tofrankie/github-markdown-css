import { autoThemeBundles } from './published-bundles.js'
import { themes } from './themes.js'

export const exportGroups = [
  { key: 'generic', kind: 'themed', outputSubdir: '' },
  { key: 'pure', kind: 'rules-only', outputSubdir: '' },
  { key: 'primer', kind: 'themed', outputSubdir: 'primer' },
  { key: 'vscode', kind: 'themed', outputSubdir: 'vscode' },
]

export const publishedThemeKeys = themes.map(theme => theme.key)
export const publishedAutoBundles = autoThemeBundles
