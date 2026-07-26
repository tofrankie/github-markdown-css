# @tofrankie/github-markdown-css

基于 `@primer/css` 和 `@primer/primitives` 构建的 GitHub Markdown CSS 产物包。

## Build

```bash
pnpm build
```

构建产物会生成到 `dist/`：

- `dist/github-markdown.css`：仅包含 `.markdown-body` 样式
- `dist/themes/*.css`：每个文件对应一套 Primer 主题变量
- `dist/bundles/github-markdown-*.css`：单主题变量与 markdown 样式的组合包

## Import

```css
@import '@tofrankie/github-markdown-css/themes/light.css';
@import '@tofrankie/github-markdown-css/github-markdown.css';
```

或直接引入组合包：

```css
@import '@tofrankie/github-markdown-css/bundles/github-markdown-light.css';
```

## Available Themes

浅色主题：

- `light`
- `light-colorblind`
- `light-high-contrast`
- `light-tritanopia`
- `light-colorblind-high-contrast`
- `light-tritanopia-high-contrast`

深色主题：

- `dark`
- `dark-dimmed`
- `dark-high-contrast`
- `dark-colorblind`
- `dark-tritanopia`
- `dark-colorblind-high-contrast`
- `dark-dimmed-high-contrast`
- `dark-tritanopia-high-contrast`

## References

- [@primer/css](https://github.com/primer/css)
- [@primer/primitives](https://github.com/primer/primitives)
