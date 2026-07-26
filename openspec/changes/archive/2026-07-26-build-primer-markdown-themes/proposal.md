## Why

当前仓库只有占位样式和一个顶层 `markdown-reference.css` 参考产物，尚未形成可复现、可发布的构建流程，也没有把 GitHub Markdown 样式与 Primer 主题变量拆分成清晰的可消费产物。现在已经确认 `@primer/css` 提供了 markdown 的 SCSS 入口，`@primer/primitives` 提供了更完整的主题变量产物，因此适合先建立一条基于官方来源的稳定第一阶段方案，为后续再做变量裁剪和体积优化打基础。

## What Changes

- 新增基于 `sass` 与轻量 Node 构建脚本的 markdown 样式构建方案，以 `@primer/css/markdown/index.scss` 为输入并输出稳定的 `github-markdown.css`
- 新增基于 `@primer/primitives/dist/css/functional/themes/*.css` 的主题重导出方案，覆盖 GitHub Markdown 可用的全部主题产物
- 新增组合包方案，将 markdown 样式与单主题变量组合为可直接消费的 bundle 文件
- 新增面向消费者的子路径导出约定，用于分别访问 markdown 样式、主题文件与组合包
- 明确本次变更不包含“移除未使用 CSS 变量”的实现，只为后续优化预留结构

## Capabilities

### New Capabilities

- `primer-markdown-theme-packages`: 定义如何基于 Primer 官方 SCSS 和主题变量产物生成、组织并导出 markdown 样式文件、主题文件和组合包

### Modified Capabilities

- 无

## Impact

- 受影响代码：仓库的构建脚本、发布文件清单、导出路径、README 和 playground 引用方式
- 受影响依赖：`@primer/css`、`@primer/primitives`、`sass`，以及用于样式编译和文件产物编排的本地 Node 脚本
- 受影响产物：`dist/` 下的 markdown 样式文件、主题文件、组合包文件，以及包级 `exports`
