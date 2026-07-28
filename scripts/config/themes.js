export const themeGroups = [
  {
    key: 'light',
    title: '浅色主题',
    themeKeys: [
      'light',
      'light-colorblind',
      'light-high-contrast',
      'light-tritanopia',
      'light-colorblind-high-contrast',
      'light-tritanopia-high-contrast',
    ],
  },
  {
    key: 'dark',
    title: '深色主题',
    themeKeys: [
      'dark',
      'dark-dimmed',
      'dark-high-contrast',
      'dark-colorblind',
      'dark-tritanopia',
      'dark-colorblind-high-contrast',
      'dark-dimmed-high-contrast',
      'dark-tritanopia-high-contrast',
    ],
  },
]

export const themes = [
  { description: 'GitHub 标准浅色主题，适合默认阅读场景。', key: 'light' },
  { description: '浅色主题的色觉友好变体，适合红绿区分更敏感的场景。', key: 'light-colorblind' },
  { description: '浅色高对比主题，适合需要更强视觉边界的场景。', key: 'light-high-contrast' },
  { description: '浅色主题的蓝黄/蓝绿区分友好变体。', key: 'light-tritanopia' },
  { description: '浅色色觉友好加高对比变体。', key: 'light-colorblind-high-contrast' },
  { description: '浅色蓝黄友好加高对比变体。', key: 'light-tritanopia-high-contrast' },
  { description: 'GitHub 标准深色主题，适合常规夜间阅读。', key: 'dark' },
  { description: '更柔和的深色主题，适合低亮度环境长时间阅读。', key: 'dark-dimmed' },
  { description: '深色高对比主题，适合需要更强视觉分隔的场景。', key: 'dark-high-contrast' },
  { description: '深色主题的色觉友好变体，适合红绿区分更敏感的场景。', key: 'dark-colorblind' },
  { description: '深色主题的蓝黄/蓝绿区分友好变体。', key: 'dark-tritanopia' },
  { description: '深色色觉友好加高对比变体。', key: 'dark-colorblind-high-contrast' },
  { description: '更柔和的深色高对比变体。', key: 'dark-dimmed-high-contrast' },
  { description: '深色蓝黄友好加高对比变体。', key: 'dark-tritanopia-high-contrast' },
]

export const themeMap = new Map(themes.map(theme => [theme.key, theme]))
