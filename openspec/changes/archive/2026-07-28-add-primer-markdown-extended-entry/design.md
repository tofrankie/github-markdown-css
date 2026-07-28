## Context

当前仓库的 markdown 样式由 `scripts/build-css.mjs` 编译 `@primer/css/markdown/index.scss` 获得，再与 base token、theme token 组合出最终发布产物。这个结构有利于保持上游一致，但当仓库需要补充 markdown 扩展时，维护者缺少一个受控且命名清晰的本地入口，只能在“继续直接依赖上游入口”和“追加额外 SCSS token 来源”之间做不完全贴合的选择。

我们已经确认本次目标不是支持任意外部 SCSS 自动改写到 `.markdown-body` 作用域，而是提供一个仓库内、明确命名的扩展入口 `src/primer-markdown-extended.scss`。该入口应当像上游 `markdown/index.scss` 一样承担“markdown 源入口”职责，同时继续让 token slim、双作用域发布和验证链路保持成立。

## Goals / Non-Goals

**Goals:**

- 为 markdown 样式构建提供稳定的仓库内扩展入口 `src/primer-markdown-extended.scss`
- 保持“上游 Primer markdown 为基础，本地扩展按需叠加”的关系清晰可见
- 明确该入口适合承载 markdown token 和 markdown 局部样式扩展
- 避免把全局基础样式误纳入 markdown 构建入口
- 保持现有 `dist/`、`dist/primer/`、slim/full 验证链路和主题矩阵不变

**Non-Goals:**

- 不支持把任意外部 SCSS 自动改写为 `.markdown-body` 作用域
- 不把 `@primer/css/base/index.scss` 等全局基础样式整体并入 markdown 构建入口
- 不调整现有主题文件名、目录结构或自动主题配对矩阵
- 不在本次设计中引入新的 CSS AST 依赖或通用 scope transform

## Decisions

### 1. 新增仓库内扩展入口 `src/primer-markdown-extended.scss`

该文件作为 markdown 样式的唯一源码入口，命名直接表达“Primer markdown 扩展入口”的用途。相比 `custom.scss` 或 `src/index.scss`，这个命名更不容易和发布入口 `src/index.css` 混淆，也能让维护者在仓库根层级快速找到 markdown 扩展源。

备选方案：

- 继续直接编译 `@primer/css/markdown/index.scss`
  - 放弃，因为无法为本地扩展建立稳定入口
- 使用 `src/scss/...` 子目录
  - 可行，但当前仓库样式源码规模较小，先使用 `src/primer-markdown-extended.scss` 更直接

### 2. 扩展入口以上游 markdown 源为基础，再叠加本地扩展

`src/primer-markdown-extended.scss` 应首先引入 `@primer/css/markdown/index.scss`，再承载本地 markdown 扩展。这样可以保持“尽量复用上游，最小化本地差异”的原则，也方便维护者审查哪些规则是本仓库新增的。

备选方案：

- 完全复制上游 `markdown/index.scss` 到仓库维护
  - 放弃，因为会增加与上游同步成本
- 把本地扩展塞入 `extraScssSourcePaths`
  - 放弃，因为该钩子当前更偏向 token 来源补充，而不是 markdown 规则入口

### 3. 只允许 markdown 相关扩展进入该入口

该入口的职责限定为 markdown token 和 markdown 局部样式扩展，不接收全局 reset、页面级基础样式或依赖 `html`、`body`、`*` 等全局选择器的规则。这样可以避免把 `github-markdown-css` 的定位从“局部 markdown 样式包”扩展成“页面基础样式包”。

备选方案：

- 允许任意 SCSS 混入，再由构建阶段自动 scope
  - 放弃，因为需要 CSS AST 级重写和新的验证口径，超出当前变更目标

### 4. 保持现有 token slim 与双作用域发布流程不变

本次只调整 markdown 源入口，不改变最终发布结构。也就是说，构建仍然生成 `dist/*.css`、`dist/primer/*.css`，并继续沿用 slim/full 资产和验证报告。这样实现成本和回归风险都更可控。

同时，额外 base token 来源继续沿用 `extraScssSourcePaths` 钩子承载，而不是混入 `src/primer-markdown-extended.scss`。当前已接入的实例是 `node_modules/@primer/css/primitives/temp-typography-tokens.scss`，它为 markdown 标题和 `typography-base.scss` 提供 `--h1-size`、`--h2-size`、`--h3-size`、`--body-font-size`、`--font-size-small` 等 token。

## Risks / Trade-offs

- [风险] 扩展入口被误用为“随手加任何样式”的总入口 → 通过 spec 和文档明确职责边界，限制只承载 markdown 相关扩展
- [风险] 本地扩展与上游 markdown 更新发生冲突 → 保持“先引上游、再追加本地”的结构，减少 diff 面积，便于后续比较
- [风险] 维护者误以为 `extraScssSourcePaths` 与扩展入口职责相同 → 在文档中区分“markdown 构建入口”和“额外 token 来源钩子”
- [取舍] 先不做通用 scope transform，会限制未来引入全局样式的灵活性 → 这是有意限制，用来保护当前包的局部 markdown 定位
