## Why

当前包的核心发布面仍然围绕“Primer scope”和“`.markdown-body` scope”组织，而不是围绕真实消费宿主组织。这导致 VS Code WebView、Primer 集成站点和普通网站都需要先理解内部作用域差异，再自行决定如何挂接主题 selector，使用成本偏高；像 Obsidian 这样的其他宿主也只能作为下游自行适配的例子存在。

现在推进这项变更，是因为我们不再需要被旧发布面束缚，可以直接把包重构为“按目标宿主输出主题产物”的设计。这样比在旧结构上叠加一层 adapter 更干净，也更容易让使用方按场景选包。

## What Changes

- 将发布面从“按历史作用域导出”重构为“按目标宿主导出”，让 Primer、通用容器、VS Code 等成为一等发布目标。
- 引入统一的导出分组配置模型，用同一套声明式数据描述各类产物分组的 selector 语义、作用域策略和 `auto*` 语义。
- 为常见宿主提供首批正式导出分组，至少覆盖默认 `generic`、`pure`、`primer`、`vscode`。
- `pure` 作为独立导出分组存在，专门表示“只有规则、没有 token 定义”的单文件产物。
- 为每类需要自带 token 定义的导出分组保留单主题产物与 `auto*` 产物，并确保单主题产物同样落在对应 selector 语义下。
- 固定主题文件在 `@media (prefers-color-scheme: dark)` 分支下也要继续定义同一套固定主题变量，避免深色媒体条件下落入其他变量集。
- 最终产物不再把 token 重组成统一 `:root {}` 或统一容器块，而是直接按 `base + theme + markdown` 拼接输出。
- 在本次 change 中同时提供 SCSS 组合入口，允许下游在构建期基于公开导出分组语义进行自由组合，而不需要后续再做第二轮架构修改。
- 第一阶段的主题范围先收敛为 `light`、`dark`、`auto`，其他颜色主题与扩展自动组合留到后续阶段处理。
- 允许新的公开导出分组决定最终目录结构、文件命名和 selector 语义，而不是被现有 `dist/*` 与 `dist/primer/*` 绑定。
- 在设计文档和用户文档中提供导出分组与主题语义的直观示例，帮助使用方理解不同产物的适用场景。
- 更新文档与验证规则，使“这个包面向哪个宿主”成为公开 API 的核心，而不是内部实现细节。

## Capabilities

### New Capabilities

- `host-selector-adapters`: 定义按公开导出分组生成 markdown 主题产物的能力，包括导出分组模型、内置宿主配置和对应发布面

### Modified Capabilities

- `primer-markdown-theme-packages`: 将现有按作用域组织的主题发布面重构为按目标宿主组织的发布面、命名规则与验证方式

## Impact

- 影响 `scripts/config/` 下的声明式 registry、发布矩阵和目标宿主配置结构
- 影响 `scripts/core/` 下的产物组装、目录规划、写盘和验证流程
- 影响最终 `dist/` 发布目录结构与用户导入方式
- 影响 [README.md](/Users/frankie/Web/Git/github-markdown-css/README.md:1) 与 [artifacts/README.md](/Users/frankie/Web/Git/github-markdown-css/artifacts/README.md:1) 的使用说明和维护指引
