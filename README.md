# @tofrankie/github-markdown-css

基于 `@primer/css` 和 `@primer/primitives` 构建的 GitHub Flavored Markdown CSS，旨在让其他 Markdown 渲染工具也有 GitHub Flavored Markdown 一致的表现。

> [!IMPORTANT]
> 在 1.0.0 之前，不排除可能会有重大变更，在升级前请阅读 [CHANGELOG](CHANGELOG.md)。

## 快速开始

你可以根据喜好选择任一主题。

```css
/* 浅色主题 */
@import '@tofrankie/github-markdown-css/light.css';

/* 深色主题 */
@import '@tofrankie/github-markdown-css/dark.css';

/* 根据 prefers-color-scheme 自动切换浅色、深色主题 */
@import '@tofrankie/github-markdown-css/auto.css';
```

<Details>
<Summary>
更多主题
</Summary>

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

自动切换主题：

- `auto`：在 `light` 与 `dark` 之间切换。
- `auto-colorblind`：在 `light-colorblind` 与 `dark-colorblind` 之间切换。
- `auto-high-contrast`：在 `light-high-contrast` 与 `dark-high-contrast` 之间切换。
- `auto-tritanopia`：在 `light-tritanopia` 与 `dark-tritanopia` 之间切换。
- `auto-colorblind-high-contrast`：在 `light-colorblind-high-contrast` 与 `dark-colorblind-high-contrast` 之间切换。
- `auto-tritanopia-high-contrast`：在 `light-tritanopia-high-contrast` 与 `dark-tritanopia-high-contrast` 之间切换。
- `auto-dimmed`：在 `light` 与 `dark-dimmed` 之间切换。
- `auto-dimmed-high-contrast`：在 `light-high-contrast` 与 `dark-dimmed-high-contrast` 之间切换。

</Details>

## 进阶用法

前面 `@tofrankie/github-markdown-css/auto.css` 是基于 [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme) 来切换主题。但这样不太灵活，因为很多网站或 UI 库是基于不同方案实现深浅模式切换的。

这里提供了一些解决方案：

1. 使用[内置方案](#内置方案)
2. 使用仅包含 Markdown CSS 规则的 `@tofrankie/github-markdown-css/pure.css`，自行设置 [CSS 变量](artifacts/published/generic/light.css)。
3. 如果要接入的 Markdown 渲染器未使用 `.markdown-body` 容器，像 Obsidian 的 `.markdown-rendered` 容器，你可以使用 SCSS 方案，允许自定义 Selector。

### 内置方案

#### `primer`

适配 [Primer](https://primer.style/)，基于其 [ThemeProvider](https://primer.style/product/getting-started/react/theming/#themeprovider) 方案来切换主题。

```css
@import '@tofrankie/github-markdown-css/primer/light.css';
@import '@tofrankie/github-markdown-css/primer/dark.css';
@import '@tofrankie/github-markdown-css/primer/auto.css';
```

#### `vscode`

适配 VS Code WebView Extension，基于其 `body[data-vscode-theme-kind='vscode-light']` 和 `body[data-vscode-theme-kind='vscode-dark']` 方案来切换主题。

```css
@import '@tofrankie/github-markdown-css/vscode/light.css';
@import '@tofrankie/github-markdown-css/vscode/dark.css';
@import '@tofrankie/github-markdown-css/vscode/auto.css';
```

### 定制化 CSS 方案

如果你想要定制化，可以选择仅包含 Markdown CSS 规则，不含任何 CSS 变量定义的产物，你可以完全自定义 [CSS 变量](artifacts/published/generic/light.css)实现定制。

```css
@import '@tofrankie/github-markdown-css/pure.css';

.markdown-body {
  --fgColor-accent: #0969da;
  /* 更多 CSS 变量 artifacts/published/generic/light.css */
}
```

### SCSS 方案

上述方案都有一个特点，限定了 Markdown 渲染容器元素的 className 是 `.markdown-body {}`，但有些工具（如 Obsidian 的 `.markdown-rendered {}`）的渲染容器不是它，所以不适用。因此提供了 SCSS 方案，支持更加自由的用法。

#### 仅含 Markdown CSS 规则

```scss
@use '@tofrankie/github-markdown-css/scss' as markdown;

@include markdown.render-rules(
  (
    container: '.markdown-rendered',
  )
);
```

结果类似这样：

```css
.markdown-rendered a {
  color: var(--fgColor-accent);
}
/* other markdown rules... */
```

#### 单色主题

```scss
@use '@tofrankie/github-markdown-css/scss' as markdown;

@include markdown.render-theme-tokens(
  (
    container: '.markdown-rendered',
    modes: (
      light: (
        selectors: ('body.theme-light .markdown-rendered'),
        tokens: 'light',
      ),
    ),
  )
);

@include markdown.render-rules(
  (
    container: '.markdown-rendered',
  )
);
```

它对应的结构语义类似：

```css
.markdown-rendered {
  --base-size-16: 1rem;
}

body.theme-light .markdown-rendered {
  --fgColor-accent: #0969da;
}

@media (prefers-color-scheme: dark) {
  body.theme-light .markdown-rendered {
    --fgColor-accent: #0969da;
  }
}

.markdown-rendered a {
  color: var(--fgColor-accent);
}
/* other markdown rules... */
```

#### 双色主题

```scss
@use '@tofrankie/github-markdown-css/scss' as markdown;

@include markdown.render-theme-tokens(
  (
    container: '.markdown-rendered',
    modes: (
      light: (
        selectors: ('body.theme-light .markdown-rendered'),
        tokens: 'light',
      ),
      dark: (
        selectors: ('body.theme-dark .markdown-rendered'),
        tokens: 'dark',
      ),
    ),
  )
);

@include markdown.render-rules(
  (
    container: '.markdown-rendered',
  )
);
```

它对应的结构语义类似：

```css
.markdown-rendered {
  --base-size-16: 1rem;
}

body.theme-light .markdown-rendered {
  --fgColor-accent: #0969da;
}

@media (prefers-color-scheme: light) {
  body.theme-light .markdown-rendered {
    --fgColor-accent: #0969da;
  }
}

body.theme-dark .markdown-rendered {
  --fgColor-accent: #4493f8;
}

@media (prefers-color-scheme: dark) {
  body.theme-dark .markdown-rendered {
    --fgColor-accent: #4493f8;
  }
}

.markdown-rendered a {
  color: var(--fgColor-accent);
}
/* other markdown rules... */
```

## Credits

- [@primer/css](https://github.com/primer/css)
- [@primer/primitives](https://github.com/primer/primitives)

## License

MIT License © [Frankie](https://github.com/tofrankie)
