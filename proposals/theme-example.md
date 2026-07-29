## Primer

### light

node_modules/@primer/primitives/dist/css/functional/themes/light.css

```css
[data-color-mode='light'][data-light-theme='light'],
[data-color-mode='auto'][data-light-theme='light'] {
  /* light token */
}

@media (prefers-color-scheme: dark) {
  [data-color-mode='auto'][data-dark-theme='light'] {
    /* light token */
  }
}
```

### dark

node_modules/@primer/primitives/dist/css/functional/themes/dark.css

```css
[data-color-mode='dark'][data-dark-theme='dark'],
[data-color-mode='auto'][data-light-theme='dark'] {
  /* dark token */
}

@media (prefers-color-scheme: dark) {
  [data-color-mode='auto'][data-dark-theme='dark'] {
    /* dark token */
  }
}
```

### auto

在 Primer 中，data-light-theme 和 data-dark-theme 属性是同时存在的，应按以下设置，避免误覆盖。例如：`<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">`

```css
/* 1. 浅色模式 */
[data-color-mode='light'][data-light-theme='light'] {
  /* light token */
}

[data-color-mode='auto'][data-light-theme='light'] {
  @media (prefers-color-scheme: light) {
    /* light token */
  }
}

/* 2. 深色模式 */
[data-color-mode='dark'][data-dark-theme='dark'] {
  /* dark token */
}

[data-color-mode='auto'][data-dark-theme='dark'] {
  @media (prefers-color-scheme: dark) {
    /* dark token */
  }
}
```
