# 维护者指南

`artifacts/` 保存仓库内的构建中间资产、瘦身产物、验证报告和对照页面。这里的内容用于维护者验证新旧版本一致性、排查上游依赖升级差异，不属于 npm 发布面；npm 发布只包含 `dist/`。

## 核心流程

```text
token sources registry
  + markdown entry
  + published bundle registry
            |
            v
   build markdown css
            |
            v
 extract markdown token names
            |
            v
 resolve token ownership and slim closure
            |
            v
  create full/slim/published artifacts
            |
            v
   validate report + preview fixtures
```

可以把这套构建理解成三层：

1. `scripts/config/*.js` 负责声明“输入是什么”
2. `scripts/core/*.js` 负责执行“流水线怎么跑”
3. `scripts/*.js` 顶层入口负责编排 build、artifacts、validate、dev

## 核心概念

- `source`：一个 token 来源对象，至少包含 `key`、`kind`、`format`、`path`、`purpose`
- `theme`：一个可直接面向用户解释的主题元数据对象，提供主题 key 和简介
- `published bundle`：最终要发布的 CSS 产物组合，包括单主题和 `auto*` 组合
- `full`：未瘦身的 base/theme/bundle 对照资产
- `slim`：按 markdown 实际 token 依赖裁剪后的 base/theme/bundle 资产
- `published`：最终发布结构的对照副本，按 `scoped` 与 `primer` 两套作用域输出
- `report`：验证报告与预览页面，用于机器校验和人工复核

## 目录与入口

```text
scripts/
  build-css.js
  build-artifacts.js
  validate-css.js
  dev-css.js
  config/
    project.js
    token-sources.js
    themes.js
    published-bundles.js
  core/
    load-config.js
    build-context.js
    collect-sources.js
    resolve-token-scope.js
    create-published-artifacts.js
    validate-artifacts.js
    write-artifacts.js
src/
  primer-markdown-extended.scss
artifacts/
  full/
  slim/
  published/
  reports/
```

### 配置入口

- [scripts/config/project.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/project.js:1)：项目级固定入口与关键路径
- [scripts/config/token-sources.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/token-sources.js:1)：token 来源 registry 与额外 token 输入入口
- [scripts/config/themes.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/themes.js:1)：主题分组与用户可见说明
- [scripts/config/published-bundles.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/published-bundles.js:1)：最终 `auto*` 发布矩阵

### 构建入口

- `pnpm build`：生成最终发布产物 `dist/` 与 `dist/primer/`
- `pnpm build:artifacts`：生成 `artifacts/full`、`artifacts/slim`、`artifacts/published` 与 `artifacts/reports`
- `pnpm validate:css`：校验 `artifacts/reports/report.json` 与 `artifacts/reports/markdown-token-names.json`
- `pnpm check:css`：顺序执行构建、生成中间资产、验证
- `pnpm dev`：监听 markdown 入口与 `scripts/config/*.js`，自动重建 `dist/`

## 本地开发与构建

发布产物构建：

```bash
pnpm build
```

完整流水线：

```bash
pnpm check:css
```

本地开发：

```bash
pnpm dev
```

## 如何新增一个来源

默认只改 [scripts/config/token-sources.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/token-sources.js:1)。

新增步骤：

1. 增加一个来源对象
2. 填写 `key`、`kind`、`format`、`path`、`purpose`
3. 如果它属于基础 token 来源，使用 `kind: 'base'`
4. 如果它是主题目录来源，继续使用现有 `kind: 'theme'` + `format: 'css-directory'`
5. 运行 `pnpm check:css`

示例：

```js
{
  fileName: 'custom-tokens.css',
  format: 'scss',
  key: 'custom-tokens',
  kind: 'base',
  path: 'path/to/custom-tokens.scss',
  purpose: '补充 markdown 依赖但 Primer 默认来源未覆盖的 token。',
}
```

什么时候才需要改 `scripts/core/`：

- 新来源类型超出现有 `css` / `scss` / `css-directory` 读取方式
- 需要引入全新的 scope 归属规则
- 需要改变验证口径

## 如何补充额外 token 输入

如果 markdown 文本提取遗漏某些仍需保留的 token，而不是缺少新来源，优先修改 [scripts/config/token-sources.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/token-sources.js:1) 里的 `extraMarkdownTokenInputs`。

支持的 JSON 结构：

```json
["--fontStack-sansSerif", "--custom-token"]
```

或：

```json
{
  "tokens": ["--fontStack-sansSerif", "--custom-token"]
}
```

## 如何新增主题说明

主题说明由 [scripts/config/themes.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/themes.js:1) 集中维护。

一般只需要：

1. 在 `themes` 中补充或修改对应主题的 `description`
2. 如需调整 README 分组顺序，再同步修改 `themeGroups`

简介优先说明选择理由，例如标准外观、色觉友好、高对比、低亮度阅读等，而不是实现细节。

## 如何新增一个 `auto*` 组合

默认只改 [scripts/config/published-bundles.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/published-bundles.js:1)。

新增步骤：

1. 增加一条矩阵对象
2. 填写 `fileName`、`lightThemeKey`、`darkThemeKey`
3. 运行 `pnpm check:css`
4. 如需面向用户展示，再同步更新根 README 的主题说明

示例：

```js
{
  darkThemeKey: 'dark-dimmed',
  fileName: 'auto-dimmed',
  lightThemeKey: 'light',
}
```

## 如何扩展 markdown 入口

markdown 样式入口固定为 [src/primer-markdown-extended.scss](/Users/frankie/Web/Git/github-markdown-css/src/primer-markdown-extended.scss:1)。

- 允许：markdown token 扩展、`.markdown-body` 局部样式扩展
- 不允许：把 `@primer/css/base/index.scss` 之类的全局基础样式整体并入入口

这条边界的目的是保持 markdown 入口的单一职责，让 token 来源与全局样式注入问题继续由 registry 和核心流水线处理。

## 验证输出

验证会重点检查：

- slim base/theme 是否覆盖 markdown 仍然需要的 in-scope token
- slim base/theme 是否存在指向同源已删除 token 的悬空引用
- slim 与 full 中关键 token 的规范化值是否一致
- 所有 `dist/auto*.css` 与 `dist/primer/auto*.css` 是否保留 `prefers-color-scheme: dark` 分支
- scoped 单主题产物是否避免重复复制 `prefers-color-scheme: dark` token 块
- full/slim 对照 HTML 是否能引用对应 bundle，便于人工检查渲染差异

预览页面位于：

- `artifacts/reports/full/*.html`
- `artifacts/reports/slim/*.html`
- `artifacts/reports/scoped/*.html`
- `artifacts/reports/primer/*.html`

## 注意事项

- 新增来源时优先先问自己：这是“缺一个来源对象”，还是“只是缺几个额外 token 名称”
- 不要把主题说明、发布矩阵和来源补丁再混回同一个文件里
- 不要在 `scripts/*.js` 顶层入口里直接堆业务细节；复杂逻辑继续下沉到 `scripts/core/*.js`
- 这是一个明确的 ESM 项目，Node 侧脚本统一使用 `.js`，不要重新引入 `.mjs`
- 当前工作流的目标是“默认改一个声明入口即可”，只有声明模型覆盖不了时才进入 core 重构

## 实现细节

瘦身逻辑不是按文件或字符串粗暴删除 token，而是：

1. 编译 `src/primer-markdown-extended.scss` 得到 markdown CSS
2. 提取 markdown CSS 中的全部 `var(--token)` 引用
3. 合并额外 token 输入
4. 按来源 registry 分配 token 所属来源
5. 在同一来源文件内继续追踪 token 依赖闭包
6. 生成 slim base/theme/bundle
7. 基于 slim 结果组装最终 published 产物

这样做的好处是：维护者可以把“新来源是什么”和“现有算法如何裁剪”分开理解，新增来源时通常不必先读完整个 core 流水线。
