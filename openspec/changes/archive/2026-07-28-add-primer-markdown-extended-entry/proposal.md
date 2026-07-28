## Why

当前构建流程直接基于 `@primer/css/markdown/index.scss` 生成 markdown 样式，适合保持与 Primer 上游一致，但不方便在仓库内追加受控的 markdown 扩展。随着我们确认需要引入一个本地扩展入口，现在需要把“官方源文件 + 本地扩展层”的关系整理成明确约定，避免后续把全局基础样式或临时补丁混入现有构建链。

## What Changes

- 在构建规格中引入仓库内的 markdown 扩展入口 `src/primer-markdown-extended.scss`
- 约定该扩展入口以 `@primer/css/markdown/index.scss` 为基础，并承载本地 markdown 扩展
- 明确该扩展入口优先用于 markdown 相关 token 和局部样式扩展，不承载全局 reset 或页面级基础样式
- 调整现有 markdown 构建要求，使最终 markdown CSS 来自“扩展入口”而不是仅来自上游单一入口
- 补充维护者可见的目录与命名约束，确保后续扩展文件位置和职责稳定

## Capabilities

### New Capabilities

- 无

### Modified Capabilities

- `primer-markdown-theme-packages`: markdown 样式构建入口从仅使用上游 `@primer/css/markdown/index.scss` 调整为使用仓库内受控的扩展入口，并约束该入口的命名、位置和作用域边界

## Impact

- 影响构建入口和相关构建文档，例如 `scripts/build-config.mjs`、`scripts/build-css.mjs`、`artifacts/README.md`
- 影响 markdown 源文件组织方式，新增 `src/primer-markdown-extended.scss` 作为长期维护入口
- 不引入新的运行时 API，也不改变现有 `dist/` 与 `dist/primer/` 的发布面命名
