import { fileURLToPath } from 'node:url'

export const cwd = fileURLToPath(new URL('..', import.meta.url))

export const supportedAutoThemePairs = [
  { key: 'auto', lightThemeKey: 'light', darkThemeKey: 'dark' },
  {
    key: 'auto-colorblind',
    lightThemeKey: 'light-colorblind',
    darkThemeKey: 'dark-colorblind',
  },
  {
    key: 'auto-high-contrast',
    lightThemeKey: 'light-high-contrast',
    darkThemeKey: 'dark-high-contrast',
  },
  {
    key: 'auto-tritanopia',
    lightThemeKey: 'light-tritanopia',
    darkThemeKey: 'dark-tritanopia',
  },
  {
    key: 'auto-colorblind-high-contrast',
    lightThemeKey: 'light-colorblind-high-contrast',
    darkThemeKey: 'dark-colorblind-high-contrast',
  },
  {
    key: 'auto-tritanopia-high-contrast',
    lightThemeKey: 'light-tritanopia-high-contrast',
    darkThemeKey: 'dark-tritanopia-high-contrast',
  },
  {
    key: 'auto-dimmed',
    lightThemeKey: 'light',
    darkThemeKey: 'dark-dimmed',
  },
  {
    key: 'auto-dimmed-high-contrast',
    lightThemeKey: 'light-high-contrast',
    darkThemeKey: 'dark-dimmed-high-contrast',
  },
]

export const themeDescriptions = {
  light: 'GitHub 标准浅色主题，适合默认阅读场景。',
  'light-colorblind': '浅色主题的色觉友好变体，适合红绿区分更敏感的场景。',
  'light-high-contrast': '浅色高对比主题，适合需要更强视觉边界的场景。',
  'light-tritanopia': '浅色主题的蓝黄/蓝绿区分友好变体。',
  'light-colorblind-high-contrast': '浅色色觉友好加高对比变体。',
  'light-tritanopia-high-contrast': '浅色蓝黄友好加高对比变体。',
  dark: 'GitHub 标准深色主题，适合常规夜间阅读。',
  'dark-dimmed': '更柔和的深色主题，适合低亮度环境长时间阅读。',
  'dark-high-contrast': '深色高对比主题，适合需要更强视觉分隔的场景。',
  'dark-colorblind': '深色主题的色觉友好变体，适合红绿区分更敏感的场景。',
  'dark-tritanopia': '深色主题的蓝黄/蓝绿区分友好变体。',
  'dark-colorblind-high-contrast': '深色色觉友好加高对比变体。',
  'dark-dimmed-high-contrast': '更柔和的深色高对比变体。',
  'dark-tritanopia-high-contrast': '深色蓝黄友好加高对比变体。',
}

export const buildConfig = {
  // Add one or more JSON files when markdown text extraction misses a token you still want slim artifacts to keep.
  extraMarkdownTokenJsonPaths: [],
  // Add one or more SCSS files when tokens such as --fontStack-sansSerif need a custom source.
  extraScssSourcePaths: [],
  // Publish the full explicit auto-theme matrix so consumers can choose a system-following pair directly.
  publishedAutoThemePairs: supportedAutoThemePairs,
  // Theme descriptions are reused by docs so users can choose quickly without reading token-level implementation details.
  themeDescriptions,
}
