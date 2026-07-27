# @tofrankie/github-markdown-css

基于 `@primer/css` 和 `@primer/primitives` 构建的 GitHub Markdown CSS 产物包。

## Import

使用浅色主题：

```css
@import '@tofrankie/github-markdown-css/light.css';
```

跟随系统深浅色切换主题（基于 [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme)）：

```css
@import '@tofrankie/github-markdown-css/auto.css';
```

如果你本身就在使用 Primer 设计系统，可以改用 `primer/*` 这组产物：

```css
@import '@tofrankie/github-markdown-css/primer/light.css';
```

## Theme Guide

浅色主题：

- `light`：GitHub 标准浅色主题，适合默认阅读场景。
- `light-colorblind`：浅色主题的色觉友好变体，适合红绿区分更敏感的场景。
- `light-high-contrast`：浅色高对比主题，适合需要更强视觉边界的场景。
- `light-tritanopia`：浅色主题的蓝黄/蓝绿区分友好变体。
- `light-colorblind-high-contrast`：浅色色觉友好加高对比变体。
- `light-tritanopia-high-contrast`：浅色蓝黄友好加高对比变体。

深色主题：

- `dark`：GitHub 标准深色主题，适合常规夜间阅读。
- `dark-dimmed`：更柔和的深色主题，适合低亮度环境长时间阅读。
- `dark-high-contrast`：深色高对比主题，适合需要更强视觉分隔的场景。
- `dark-colorblind`：深色主题的色觉友好变体，适合红绿区分更敏感的场景。
- `dark-tritanopia`：深色主题的蓝黄/蓝绿区分友好变体。
- `dark-colorblind-high-contrast`：深色色觉友好加高对比变体。
- `dark-dimmed-high-contrast`：更柔和的深色高对比变体。
- `dark-tritanopia-high-contrast`：深色蓝黄友好加高对比变体。

跟随系统切换主题：

- `auto`：根据 prefers-color-scheme 在 `light` 与 `dark` 之间切换。
- `auto-colorblind`：根据 prefers-color-scheme 在 `light-colorblind` 与 `dark-colorblind` 之间切换。
- `auto-high-contrast`：根据 prefers-color-scheme 在 `light-high-contrast` 与 `dark-high-contrast` 之间切换。
- `auto-tritanopia`：根据 prefers-color-scheme 在 `light-tritanopia` 与 `dark-tritanopia` 之间切换。
- `auto-colorblind-high-contrast`：根据 prefers-color-scheme 在 `light-colorblind-high-contrast` 与 `dark-colorblind-high-contrast` 之间切换。
- `auto-tritanopia-high-contrast`：根据 prefers-color-scheme 在 `light-tritanopia-high-contrast` 与 `dark-tritanopia-high-contrast` 之间切换。
- `auto-dimmed`：根据 prefers-color-scheme 在 `light` 与 `dark-dimmed` 之间切换。
- `auto-dimmed-high-contrast`：根据 prefers-color-scheme 在 `light-high-contrast` 与 `dark-dimmed-high-contrast` 之间切换。

## References

- [@primer/css](https://github.com/primer/css)
- [@primer/primitives](https://github.com/primer/primitives)
