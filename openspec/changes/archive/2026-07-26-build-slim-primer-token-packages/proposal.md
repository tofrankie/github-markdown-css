## Why

当前包已经证明了“基于 Primer 官方来源生成 markdown 主题 CSS”这条链路可行。既然我们已经确认 `markdown` 实际依赖的 token 可以按 `base size`、`base typography` 与 `theme semantic` 三类拆分，现在适合进一步明确最终发布面、中间资产目录和验证流程，并顺手拆分过长的构建脚本。

## What Changes

- 将 `dist/` 收敛为最终发布面，只输出每个主题对应的 `base + theme + markdown` 组合产物
- 将 full/slim 中间产物、对照页面和验证报告迁移到仓库内的 `artifacts/`
- 保留基于 `github-markdown.css` 实际 token 依赖的瘦身流程，并继续用来源分桶与同源依赖闭包生成 slim 资产
- 为 markdown token 提取与 `fontStack` 来源补充预留易配置钩子，支持通过自定义 JSON / SCSS 文件扩展输入
- 明确验证流程依赖仓库内 fixture、报告和 full/slim 对照资产，而不是把这些资产一起打进 npm 发布包
- 拆分构建与验证脚本，把复杂逻辑下沉到 `scripts/utils/`

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `primer-markdown-theme-packages`: 现有打包能力需要重新定义 `dist` 发布边界、仓库内验证资产目录，以及基于依赖闭包的变量瘦身与验证要求

## Impact

- 受影响代码主要在 `scripts/build-css.mjs`、`scripts/validate-css.mjs`、`scripts/utils/**`、`dist/` 产物结构、`artifacts/`、`package.json` 导出、以及 README 中的说明
- 受影响上游来源包括 `@primer/primitives/dist/css/base/**` 与 `@primer/primitives/dist/css/functional/themes/**`
- 需要新增针对 token 提取、来源分桶、依赖闭包、自定义钩子输入、产物写出与回归验证的构建逻辑，同时把实现拆分为更易维护的脚本模块
