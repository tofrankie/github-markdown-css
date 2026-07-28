export const tokenSources = [
  {
    fileName: 'functional-typography.css',
    format: 'css',
    key: 'functional-typography',
    kind: 'base',
    path: 'node_modules/@primer/primitives/dist/css/functional/typography/typography.css',
    purpose: '提供 markdown 使用的 --fontStack-* 与 --text-* 功能排版 token。',
  },
  {
    fileName: 'size.css',
    format: 'css',
    key: 'size',
    kind: 'base',
    path: 'node_modules/@primer/primitives/dist/css/base/size/size.css',
    purpose: '提供 markdown 使用的 --base-size-* token。',
  },
  {
    fileName: 'typography.css',
    format: 'css',
    key: 'typography',
    kind: 'base',
    path: 'node_modules/@primer/primitives/dist/css/base/typography/typography.css',
    purpose: '提供 markdown 使用的 --base-text-* token。',
  },
  {
    fileName: 'temp-typography-tokens.css',
    format: 'scss',
    key: 'temp-typography-tokens',
    kind: 'base',
    path: 'node_modules/@primer/css/primitives/temp-typography-tokens.scss',
    purpose: '补充 Primer 默认 CSS 尚未覆盖的临时排版 token，例如 --h1-size 与 --body-font-size。',
  },
  {
    format: 'css-directory',
    key: 'primer-themes',
    kind: 'theme',
    path: 'node_modules/@primer/primitives/dist/css/functional/themes',
    purpose: '提供所有 Primer 功能主题 token；每个 CSS 文件会生成一个主题资产。',
  },
]

export const extraMarkdownTokenInputs = []
