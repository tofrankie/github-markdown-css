# 构建与验证资产

`artifacts/` 保存仓库内的构建中间资产、瘦身产物、验证报告和对照页面。这里的内容用于维护者验证新旧版本一致性、排查上游依赖升级差异，不属于 npm 发布面；npm 发布只包含 `dist/`。

## 构建

发布产物构建：

```bash
pnpm build
```

`build` 只生成最终发布产物：

- `dist/`：只保留最终 npm 发布产物，例如 `dist/github-markdown-light.css`
- 这些发布文件使用 slim 后的 `base + theme + github-markdown` 组合结果，而不是 full bundle

## 核心流程

完整 CSS 流水线：

```bash
pnpm check:css
```

它按顺序执行：

1. `pnpm build`：生成 slim 后的最终发布产物到 `dist/github-markdown-*.css`
2. `pnpm build:artifacts`：生成 full/slim 中间资产与验证资产到 `artifacts/`
3. `pnpm validate:css`：校验 `artifacts/**` 中的 token 覆盖、悬空引用和 full/slim 一致性

发布前必须保证这条流水线通过。

## 目录结构

```text
artifacts/
  full/
    base/
    bundles/
    markdown/
    themes/
  slim/
    base/
    bundles/
    themes/
  reports/
    full/
    slim/
    markdown-token-names.json
    report.json
```

- `full/`：未瘦身的 base、theme、markdown 与 bundle 对照资产
- `slim/`：基于 markdown 实际 token 依赖生成的瘦身 base、theme 与 bundle 资产
- `reports/`：验证报告、markdown token 名单，以及 full/slim 对照 HTML 页面

`scripts/fixtures/markdown-fixture.html` 是源码级 fixture 模板输入，不放在 `artifacts/` 里。

## 瘦身原理

瘦身不是按文件或字符串粗暴删除 token，而是从 markdown 的真实消费反推需要保留的最小集合：

1. 编译 `@primer/css/markdown/index.scss` 得到 markdown CSS
2. 从 markdown CSS 提取全部 `var(--token)` 引用
3. 合并自定义 token JSON 钩子中的额外 token 名称，并统一去重
4. 按来源分桶：
   - `--base-size-*` 来自 `@primer/primitives/dist/css/base/size/size.css`
   - `--base-text-*` 来自 `@primer/primitives/dist/css/base/typography/typography.css`
   - 纳入本次范围的语义 token 来自 `@primer/primitives/dist/css/functional/themes/*.css`
   - `--fontStack-sansSerif` 等自定义来源可通过额外 SCSS 钩子补充
5. 在同一来源文件内继续追踪 token 依赖闭包
6. 闭包收敛后输出 slim 资产

这样可以避免只保留 markdown 直接引用 token 时遗漏二级、三级同源依赖。

## 自定义钩子

构建配置集中在 [scripts/build-config.mjs](/Users/frankie/Web/Git/github-markdown-css/scripts/build-config.mjs:1)：

```js
export const buildConfig = {
  extraMarkdownTokenJsonPaths: [],
  extraScssSourcePaths: [],
}
```

- `extraMarkdownTokenJsonPaths`：当 markdown 文本提取遗漏某些仍需保留的 token 时，在这里追加一个或多个 JSON 文件路径
- `extraScssSourcePaths`：当 `--fontStack-sansSerif` 等 token 来自非 Primer 官方 CSS 时，在这里追加一个或多个自定义 SCSS 文件路径

额外 token JSON 支持数组格式：

```json
["--fontStack-sansSerif", "--custom-token"]
```

也支持对象格式：

```json
{
  "tokens": ["--fontStack-sansSerif", "--custom-token"]
}
```

## 验证口径

`pnpm validate:css` 以 `artifacts/reports/report.json` 和 `artifacts/reports/markdown-token-names.json` 为输入，重点验证：

- slim base/theme 是否覆盖 markdown 仍然需要的 in-scope token
- slim base/theme 是否存在指向同源已删除 token 的悬空引用
- slim 与 full 中关键 token 的规范化值是否一致
- full/slim 对照 HTML 是否能引用对应 bundle，便于人工检查渲染差异

对照页面位于：

- `artifacts/reports/full/*.html`
- `artifacts/reports/slim/*.html`
