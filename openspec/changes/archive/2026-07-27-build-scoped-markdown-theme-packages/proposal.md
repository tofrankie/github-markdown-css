## Why

当前仓库已经具备一条稳定的 Primer Markdown 构建链路：`dist/` 发布 slim 后的 `base + theme + markdown` 组合产物，`artifacts/` 保留 full/slim 中间资产与验证报告。这条链路解决了“如何从 Primer 官方来源构建 GitHub Markdown CSS”的问题，但还没有解决“如何针对 GitHub Markdown 的实际使用作用域发布更易消费的产物”。

从提案 [20260727-2.md](/Users/frankie/Web/Git/github-markdown-css/proposals/20260727-2.md) 和当前实现对照后，可以确认存在三个具体缺口：

1. 当前主题文件仍保留 Primer 原生选择器语义，消费者必须理解 `data-color-mode`、`data-light-theme`、`data-dark-theme` 与 `prefers-color-scheme` 的配合关系
2. 当前发布面只有一套全局选择器产物，没有提供限定在 `.markdown-body` 下的局部作用域版本
3. 当前命名仍然是 `github-markdown-light.css` 这一类历史前缀，不利于把“作用域”与“主题名”解耦，也无法自然承载 `auto.css`

因此这次变更需要在现有 full/slim 流水线之上，重新定义最终发布契约：同时提供 Primer 原生作用域产物与 `.markdown-body` 局部作用域产物，并为两套作用域都补齐 `auto.css` 语义和简化后的文件命名。

## What Changes

- 在现有能力上新增“双作用域发布模型”：
  - `dist/primer/*.css` 保留 Primer 原生选择器语义
  - `dist/*.css` 提供限定在 `.markdown-body` 下的局部作用域产物
- 将现有 `github-markdown-<theme>.css` 重命名为 `<theme>.css`，移除 `github-markdown-` 前缀，并分阶段引入自动浅深色组合产物：
  - 第一阶段先交付并验证两套作用域下的 `auto.css`
  - 第二阶段再按显式配对矩阵扩展其他 `auto-*` 自动组合产物
- 为 `.markdown-body` 作用域产物定义明确的重写规则：把 `base size`、`base typography`、light theme token 和 dark auto theme token 分别转换到 `.markdown-body` 作用域，而不是继续依赖 Primer 的属性选择器组合
- 明确非 `auto*` 产物属于固定主题产物：无论 `prefers-color-scheme` 为 light 还是 dark，最终都应用该主题对应的同一套 token
- 为自动浅深色组合产物定义可扩展命名与配对模型，支持在 `auto.css` 验证稳定后，按固定规则继续新增 `auto-*` 变体，而不需要重构发布结构
  - 这里的 `auto*` 指本包导出的自动组合文件名
  - 与 Primer 设计系统里的 `data-color-mode='auto'` selector 语义分开表述
- 为每个主题补一行简短的用户选择说明，方便在 README 和其他文档里做快速筛选与对比
- 复用现有 slim/full 资产生成与验证链路，但扩展为同时覆盖两套发布作用域和 `auto.css`
- 更新 `exports`、README、验证文档和中间资产目录说明，让消费者清楚区分“Primer 兼容产物”和“局部 markdown 产物”

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `primer-markdown-theme-packages`: 现有构建能力需要扩展为双作用域发布、简化命名、一组可扩展的 `auto*` 产物和 `.markdown-body` 作用域转换

## Impact

- 受影响代码主要在 `scripts/build-css.mjs`、`scripts/build-artifacts.mjs`、`scripts/validate-css.mjs`、`scripts/utils/**`、`package.json` 导出定义、README 和 `artifacts/README.md`
- 受影响产物从“单一 `dist/github-markdown-*.css`”变为“双作用域 + 简化命名”的发布结构，消费者导入路径会随之调整
- 受影响验证逻辑需要从“只验证 slim 是否完整”扩展为“验证 scoped 转换后仍保持 token 完整性和 light/dark 自动切换语义”
