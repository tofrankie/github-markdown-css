# 开发指南

`artifacts/` 保存仓库内的构建中间资产、瘦身产物、验证报告和对照页面。这里的内容用于开发者验证新旧版本一致性、排查上游依赖升级差异，不属于 npm 发布面；npm 发布只包含 `dist/`。

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
- `published bundle`：最终要发布的 CSS 产物组合，当前首批为默认 `generic`、`pure`、`primer`、`vscode`
- `full`：未瘦身的 base/theme/bundle 对照资产
- `slim`：按 markdown 实际 token 依赖裁剪后的 base/theme/bundle 资产
- `published`：最终发布结构的对照副本，当前按 `generic`、`pure`、`primer`、`vscode` 输出
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
- [scripts/config/export-groups.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/export-groups.js:1)：首批导出分组与首批主题矩阵
- [scripts/config/token-sources.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/token-sources.js:1)：token 来源 registry 与额外 token 输入入口
- [scripts/config/themes.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/themes.js:1)：主题分组与用户可见说明
- [scripts/config/published-bundles.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/published-bundles.js:1)：历史 `auto*` 发布矩阵，后续扩展其他主题时再继续接入

当前配置边界：

- `export-groups.js`
  负责首批公开导出分组与首批主题范围，也就是当前 `generic`、`pure`、`primer`、`vscode` 和 `light`、`dark`、`auto`
- `token-sources.js`
  继续只负责 token 来源与额外 token 输入，不负责公开导出路径
- `themes.js`
  当前主要保留给后续扩展更多主题时复用用户向说明，不再直接决定首批 npm 导出面
- `published-bundles.js`
  当前主要保留给后续恢复或扩展更多 `auto*` 主题组合时接入，首批 `auto` 已由 `export-groups.js` 收敛

### 构建入口

- `pnpm build`：生成最终发布产物 `dist/`、`dist/primer/`、`dist/vscode/`、`dist/pure.css` 与 `dist/scss/index.scss`
- `pnpm build:artifacts`：生成 `artifacts/full`、`artifacts/slim`、`artifacts/published` 与 `artifacts/reports`
- `pnpm validate:css`：校验 `artifacts/reports/report.json` 与 `artifacts/reports/markdown-token-names.json`
- `pnpm check:css`：顺序执行构建、生成中间资产、验证
- `pnpm dev`：监听 markdown 入口与 `scripts/config/*.js`，自动重建 `dist/`

## 当前发布面

当前首批 npm 产物只覆盖：

- 默认 `generic`
  - `light.css`
  - `dark.css`
  - `auto.css`
- `pure`
  - `pure.css`
- `primer`
  - `light.css`
  - `dark.css`
  - `auto.css`
- `vscode`
  - `light.css`
  - `dark.css`
  - `auto.css`

对应的对照副本位于：

- `artifacts/published/generic/`
- `artifacts/published/pure/`
- `artifacts/published/primer/`
- `artifacts/published/vscode/`

## `pure.css` 与 SCSS 入口

`pure.css` 的含义是：

- 只输出 markdown 规则
- 只保留 `var(--token)` 引用
- 不输出任何 token 定义
- 不区分 `light` / `dark` / `auto`

主题来源完全由宿主自己提供的 token definitions 决定。

当前 SCSS 入口位于：

- `dist/scss/index.scss`

建议把 SCSS 入口拆成两类职责：

- `render-rules()`
  只输出 markdown 规则和 `var(--token)` 引用
- `render-theme-tokens()`
  只输出 token 定义，并负责主题 selector / 媒体分支

`render-theme-tokens()` 统一使用显式 `modes` 结构，不再依赖隐式简写。

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

## Primer 变量来源地图

当前仓库不是直接把 `@primer/css` 当成“唯一变量来源”来处理，而是把“变量定义源头”和“样式消费层”拆开看：

- `@primer/primitives`：正式 token 定义源头
- `@primer/css`：大量消费这些 token 来生成 base 与 markdown 样式，并补少量临时排版变量

### 当前构建实际读取的来源

当前 [scripts/config/token-sources.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/token-sources.js:1) 读取了 5 处输入：

1. [node_modules/@primer/primitives/dist/css/base/size/size.css](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/primitives/dist/css/base/size/size.css:1)
   提供 `--base-size-*` 基础尺寸 token
2. [node_modules/@primer/primitives/dist/css/base/typography/typography.css](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/primitives/dist/css/base/typography/typography.css:1)
   提供 `--base-text-*` 基础排版 token
3. [node_modules/@primer/primitives/dist/css/functional/typography/typography.css](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/primitives/dist/css/functional/typography/typography.css:1)
   提供 `--fontStack-*`、`--text-*` 等高层排版 token
4. [node_modules/@primer/css/primitives/temp-typography-tokens.scss](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/css/primitives/temp-typography-tokens.scss:1)
   补充 `--h1-size`、`--body-font-size` 一类临时排版变量
5. [node_modules/@primer/primitives/dist/css/functional/themes](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/primitives/dist/css/functional/themes)
   提供各个主题的功能型主题 token，例如 `light.css`、`dark.css`

### `@primer/primitives` 负责什么

`@primer/primitives` 是当前这套变量体系的正式定义源头。

- `dist/css/base/size/*`：基础尺寸变量
- `dist/css/base/typography/*`：基础排版变量
- `dist/css/functional/typography/*`：更高层的排版语义变量
- `dist/css/functional/themes/*`：各主题的颜色、边框、背景等主题变量

在这个仓库的语境里，可以把它理解成“token 定义层”。

### `@primer/css` 负责什么

`@primer/css` 更多是“样式消费层”，不是主题 token 的主要定义源。

它自己的 SCSS 会直接消费上面这些变量来生成 base 和 markdown 规则，例如：

- [node_modules/@primer/css/base/base.scss](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/css/base/base.scss:17)
- [node_modules/@primer/css/markdown/headings.scss](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/css/markdown/headings.scss:12)
- [node_modules/@primer/css/markdown/code.scss](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/css/markdown/code.scss:46)

这里可以看到大量：

- `var(--base-size-16)`
- `var(--fgColor-default, var(--color-fg-default))`
- `var(--bgColor-muted, var(--color-canvas-subtle))`

也就是说，在这个仓库里：

- `@primer/primitives` 负责“定义变量”
- `@primer/css` 负责“使用变量生成样式”

### `@primer/css` 里唯一需要单独留意的变量补丁

`@primer/css` 里当前最需要单独建模的是 [node_modules/@primer/css/primitives/temp-typography-tokens.scss](/Users/frankie/Web/Git/github-markdown-css/node_modules/@primer/css/primitives/temp-typography-tokens.scss:1)。

它补的是一组临时排版变量，而不是完整主题体系，例如：

- `--h00-size`
- `--h1-size`
- `--body-font-size`
- `--font-size-small`

当前仓库已经把它显式放进 token sources registry，而不是假定这些变量来自 `@primer/primitives`。

### 如何判断一个变量该归到哪里

可以按下面的顺序判断：

1. 如果是 `--base-size-*`，归到 `@primer/primitives/dist/css/base/size/*`
2. 如果是 `--base-text-*`，归到 `@primer/primitives/dist/css/base/typography/*`
3. 如果是 `--fontStack-*` 或 `--text-*`，优先看 `@primer/primitives/dist/css/functional/typography/*`
4. 如果是主题相关变量，例如 `--fgColor-*`、`--bgColor-*`、`--borderColor-*`，优先看 `@primer/primitives/dist/css/functional/themes/*`
5. 如果是 `--h1-size`、`--body-font-size` 这类历史/临时排版变量，再看 `@primer/css/primitives/temp-typography-tokens.scss`

这个顺序也就是维护 token source registry 时的默认来源判断顺序。

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

## 如何扩展后续主题

当前第一阶段只覆盖：

- `light`
- `dark`
- `auto`

像 `dark-dimmed` 等其他主题要等当前发布面稳定并确认后再继续。

到那一步时，默认只改：

- [scripts/config/export-groups.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/export-groups.js:1)
- [scripts/config/published-bundles.js](/Users/frankie/Web/Git/github-markdown-css/scripts/config/published-bundles.js:1)

新增步骤：

1. 扩充首批主题白名单
2. 如涉及自动切换，再补对应 auto 组合
3. 运行 `pnpm check:css`
4. 再同步更新根 README 的导入说明和主题说明

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
- 默认 `generic` 与 `primer` 的 `auto.css` 是否保留正确的媒体分支
- `vscode/auto.css` 是否不依赖 `prefers-color-scheme: dark` 作为主题切换主路径
- `pure.css` 是否不输出 token 定义
- 主题无关 token 是否只在公共作用域定义一次
- full/slim 对照 HTML 是否能引用对应 bundle，便于人工检查渲染差异

预览页面位于：

- `artifacts/reports/full/*.html`
- `artifacts/reports/slim/*.html`
- `artifacts/reports/generic/*.html`
- `artifacts/reports/primer/*.html`
- `artifacts/reports/pure/*.html`
- `artifacts/reports/vscode/*.html`

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
