## Context

当前实现已经有这些稳定前提：

- markdown 样式来自 `@primer/css/markdown/index.scss`
- `base size` 与 `base typography` token 来自 `@primer/primitives/dist/css/base/**`
- 单主题 token 来自 `@primer/primitives/dist/css/functional/themes/*.css`
- 最终发布产物来自 slim 后的 `base + theme + markdown`
- `artifacts/` 已经承载 full/slim 中间资产、验证报告和对照页面

但现有产物仍然沿用 Primer 原始主题文件的作用域模型，例如：

```css
[data-color-mode='light'][data-light-theme='light'],
[data-color-mode='auto'][data-light-theme='light'] {
  /* light tokens */
}

@media (prefers-color-scheme: dark) {
  [data-color-mode][data-color-mode='auto'][data-dark-theme='dark'] {
    /* dark tokens */
  }
}
```

这对直接消费 Primer 设计系统的场景是合理的，但对只想把样式限定在 `.markdown-body` 内的使用方来说过于外露。当前缺的不是“再构建一套主题来源”，而是“在保留 Primer 兼容产物的同时，把它重组为 markdown 局部作用域友好的发布面”。

## Goals / Non-Goals

**Goals:**

- 同时提供 Primer 原生作用域和 `.markdown-body` 局部作用域两套最终发布产物
- 将最终文件命名统一简化为 `<theme>.css` 与一组 `auto*` 组合文件
- 为 `.markdown-body` 作用域定义可预测的 base/theme 转换规则
- 明确所有非 `auto*` 产物都是固定主题产物，不因 `prefers-color-scheme` 切换到另一套主题
- 先让 `auto.css` 在两套作用域下具备清晰、稳定的浅色/深色自动切换语义，再把同一模型扩展到 `auto-dimmed.css` 等自动组合文件
- 为每个主题提供简短的选择说明，帮助用户在 light/dark、无障碍与低对比度之间快速决策
- 尽量复用现有 slim/full 流水线，而不是引入第二套平行构建系统
- 把新的发布结构和消费方式落到 README、exports 与验证流程中

**Non-Goals:**

- 本次不重写 `@primer/css/markdown/index.scss` 自身的 markdown 规则
- 本次不改变现有 slim token 提取、来源分桶和依赖闭包的基本思路
- 本次不扩展 `.markdown-body` 以外的自定义局部选择器配置能力
- 本次不引入新的主题来源或脱离 Primer 的主题命名体系
- 本次不实现运行时主题切换脚本；各 `auto*` 文件只负责 CSS 侧的自动跟随

## Terminology

- `Primer auto selector`
  - 指 Primer 设计系统中的 `data-color-mode='auto'`
  - 它决定在运行时根据 `prefers-color-scheme` 去命中 `data-light-theme` 或 `data-dark-theme`
- `package auto file`
  - 指本包导出的 `auto.css`、`auto-dimmed.css` 这类文件名
  - 它表示“这个最终产物会根据 `prefers-color-scheme` 自动切换浅色/深色主题配对”
- 这两个 `auto` 名字相同，但不代表同一层含义；文档里必须区分“selector 机制”和“导出产物”

## Current State

从现有构建脚本可以看到：

```text
build-css.mjs
  -> 读取 markdown/base/theme
  -> 生成 slim artifacts
  -> 写出 dist/github-markdown-*.css

build-artifacts.mjs
  -> 写出 artifacts/full/**
  -> 写出 artifacts/slim/**
  -> 写出 reports/**
```

对应的当前发布面大致是：

```text
dist/
  github-markdown-light.css
  github-markdown-dark.css
  ...
```

这说明现状已经解决了“内容来源”和“瘦身验证”，但未表达“作用域形态”。这也是本次变更应该聚焦的点。

## Decisions

### 1. 发布面拆成 `dist/primer` 与 `dist/` 两层

决策：

- `dist/primer/*.css` 保存 Primer 原生选择器语义的最终发布产物
- `dist/*.css` 保存转换到 `.markdown-body` 局部作用域的最终发布产物
- 两层都只放最终可消费文件，不暴露 base/theme/bundle 中间部件

原因：

- 这与用户提案中的两种作用域完全对齐
- 让“兼容 Primer 设计系统”和“只要 markdown 局部样式”两类使用方式在路径层面天然分离
- 避免继续把“作用域差异”混在同一套命名里靠文档解释

备选方案：

- 只保留 `.markdown-body` 产物，取消 Primer 作用域版本
  - 放弃原因：会丢失现有与 Primer 选择器契约兼容的消费面
- 把两套作用域都堆在根目录，通过文件名前缀区分
  - 放弃原因：根目录会更拥挤，也不如 `dist/primer` 直观

### 2. 最终文件统一去掉 `github-markdown-` 前缀

决策：

- 主题文件统一命名为 `<theme>.css`
- 自动切换文件统一命名为 `auto*.css`
- 示例：
  - `dist/light.css`
  - `dist/dark.css`
  - `dist/auto.css`
  - `dist/auto-dimmed.css`
  - `dist/primer/light.css`
  - `dist/primer/dark.css`
  - `dist/primer/auto.css`
  - `dist/primer/auto-dimmed.css`

原因：

- 当路径本身已经表达“这是本包的 markdown 主题产物”，继续保留 `github-markdown-` 前缀属于重复噪音
- `auto.css` 与 `auto-dimmed.css` 只有在去前缀后才自然，能够表达“这是自动配对入口”而不是单主题文件
- 也更适合未来在 README 和导出面中写成简洁的导入路径

备选方案：

- 只给 scoped 产物去前缀，Primer 产物保持老命名
  - 放弃原因：两套发布面会出现不必要的命名不一致

### 3. `.markdown-body` 作用域产物采用“重组 token 作用域”而非“简单替换选择器”

决策：

- `.markdown-body` 作用域产物不是机械地把所有选择器前面拼上 `.markdown-body`
- 它需要显式重组 token 定义层：
  - `base size` token 移入一个新的 `.markdown-body {}` 块
  - `base typography` token 移入同一个新的 `.markdown-body {}` 块
  - light theme token 从 Primer light 选择器块转换到 `.markdown-body {}`
  - dark auto theme token 从 `@media (prefers-color-scheme: dark)` 下的 Primer auto selector 转换到 `@media (...) { .markdown-body {} }`
- markdown 规则本身继续与这些 token 组合输出最终文件
- 对于非 `auto*` 的 scoped 单主题文件，最终组织形式是：

```css
.markdown-body {
  /* base size + base typography */
}

.markdown-body {
  /* 当前主题的 token */
}

@media (prefers-color-scheme: dark) {
  .markdown-body {
    /* 当前主题的 token */
  }
}

/* github-markdown rules */
```

原因：

- 用户提案明确要求 base token 也要下沉到 `.markdown-body` 作用域，而不是仅调整主题块
- 如果只改主题选择器、不改 base token，变量仍然泄漏在全局 `:root` 或其他原始作用域中，达不到“局部 markdown 产物”的目标
- 明确按块重组，比事后对整个最终 bundle 做字符串替换更安全、更可验证

备选方案：

- 对最终 bundle 做纯文本查找替换
  - 放弃原因：容易误伤 markdown 规则、注释和非 token 选择器，也难以表达 `auto.css` 的 light/dark 结构

### 4. Primer 产物与 scoped 产物都需要明确的最终组织形式

决策：

- `dist/primer/<theme>.css` 这类 Primer 单主题产物保持 Primer 原生选择器结构，但仍然是最终消费文件
- 它的内容顺序是：
  - base size + base typography
  - 当前主题在 Primer 原生 selector 下的 token
  - markdown 规则
- `dist/<theme>.css` 这类 scoped 单主题产物不保留 Primer selector，而是重组为 `.markdown-body` 下的 token 块加 markdown 规则
- 两类单主题文件都属于“最终发布产物”，不是中间 theme/base 拆件
- 两类单主题文件都属于固定主题产物：无论 `prefers-color-scheme` 为 light 还是 dark，最终都应用该主题对应的同一套 token

Primer 单主题产物可抽象为：

```css
:root-or-primer-theme-scope {
  /* base size + base typography */
}

[data-color-mode='light'][data-light-theme='<lightThemeKey>'],
[data-color-mode='dark'][data-dark-theme='<darkThemeKey>'],
[data-color-mode='auto'][data-light-theme='<lightThemeKey>'] {
  /* 当前主题的 token */
}

@media (prefers-color-scheme: dark) {
  [data-color-mode][data-color-mode='auto'][data-dark-theme='<darkThemeKey>'] {
    /* 同一套主题 token */
  }
}

/* github-markdown rules */
```

scoped 单主题产物可抽象为：

```css
.markdown-body {
  /* base size + base typography */
}

.markdown-body {
  /* 当前主题的 token */
}

/* github-markdown rules */
```

补充说明：

- 对固定主题文件来说，`prefers-color-scheme` 不会切换到另一套主题，只会影响 Primer `auto` 分支命中的属性：
  - 非 dark media：`data-color-mode='auto'` 读取 `data-light-theme`
  - dark media 内：`data-color-mode='auto'` 读取 `data-dark-theme`
- `data-color-mode='light'` 与 `data-color-mode='dark'` 属于显式模式，不依赖 `prefers-color-scheme`
  - 因此在 dark media 中只需要补 `data-color-mode='auto'` 的命中分支
  - `light` / `dark` 显式模式已经由 media 外层的 selector 覆盖，不需要在 dark media 内重复声明
- 不论命中的是哪一个 Primer selector 分支，非 `auto*` 产物表达的仍然是同一个最终主题，而不是一浅一深两套不同主题
- scoped 单主题产物默认只输出一份 `.markdown-body` token 块，不额外复制一份 `@media (prefers-color-scheme: dark) { .markdown-body {} }`
  - 这意味着本次设计不主动处理“外部其他来源在 dark media 下再次覆盖 `.markdown-body`”的冲突场景
  - 当前先把本包自身的固定主题语义定义清楚，外部级联冲突留待后续有明确需求时再讨论
- 因此示意中的 `lightThemeKey` 与 `darkThemeKey` 应视具体产物而定：
  - 对普通单主题文件，它们通常指向同一个主题家族对应的 light/dark 侧 key
  - 对 `auto*` 组合文件，它们可以来自显式配对矩阵中的不同主题

原因：

- 如果只说“它会生成某类产物”，用户和实现者都不容易知道单主题文件与 `auto*` 文件在结构上到底差在哪里
- 先把普通主题文件说清楚，再讲 `auto*` 的额外媒体查询结构，整份设计会更对称

备选方案：

- 只描述 `auto*` 的结构，默认读者自行类推单主题文件
  - 放弃原因：这正是当前文档已经暴露出来的理解缺口

### 5. `auto*` 不是别名文件，而是显式组合的浅深色产物

决策：

- 每套作用域先新增一个显式生成的 `auto.css`
- `auto.css` 跑通并验证完成后，再沿用同一数据模型扩展其他 `auto*` 文件
- 下一步默认优先扩展：
  - `auto-dimmed.css` -> `light` + `dark-dimmed`
- Primer 作用域下的每个 `auto*` 文件都由：
  - base size + base typography
  - 对应浅色主题的 Primer selector 规则，其中包含 `data-color-mode='auto'` 在浅色环境下命中的分支
  - `@media (prefers-color-scheme: dark)` 下对应深色主题的 Primer selector 规则，其中包含 `data-color-mode='auto'` 在深色环境下命中的分支
  - markdown 规则
    组合而成
- `.markdown-body` 作用域下的每个 `auto*` 文件都由：

```css
.markdown-body {
  /* base size + base typography */
}

.markdown-body {
  /* light theme tokens */
}

@media (prefers-color-scheme: dark) {
  .markdown-body {
    /* dark theme tokens */
  }
}
```

对应的 Primer `auto*` 产物可抽象为：

```css
:root-or-primer-theme-scope {
  /* base size + base typography */
}

[data-color-mode='auto'][data-light-theme='<light-theme>'],
[data-color-mode='light'][data-light-theme='<light-theme>'] {
  /* light theme tokens */
}

@media (prefers-color-scheme: dark) {
  [data-color-mode][data-color-mode='auto'][data-dark-theme='<dark-theme>'] {
    /* dark theme tokens */
  }
}

/* github-markdown rules */
```

原因：

- `auto.css` 先作为最小可验证自动组合入口，避免一开始把多个变体并行推进
- `auto*` 的长期目标仍然是一组独立消费入口，而不是让用户自己再拼浅色与不同深色主题
- 把 “package auto file” 和 “Primer auto selector” 分开表述后，后续实现时不容易把文件命名语义和 selector 语义混在一起
- 对 scoped 产物来说，只有显式组合 light/dark token 才能把语义稳定落地到 `.markdown-body`
- 这也让验证目标更清晰：它是一个可直接打开、可直接导入的最终文件

备选方案：

- 让 `auto.css` 只 re-export 或重命名现有 light 文件
  - 放弃原因：无法真正支持深色自动切换
- 每新增一个深色组合都临时特判命名和拼装逻辑
  - 放弃原因：后续扩展 `auto-high-contrast`、`auto-colorblind` 等时会持续放大维护成本

### 6. 自动组合产物采用固定配对清单，方便扩展

决策：

- 构建配置中显式维护一份自动组合清单，但第一阶段清单只包含 `auto`
- 清单中的每个条目都显式列出“产物名 + 浅色主题 key + 深色主题 key”
- 当前可预期的自动组合如下：

```text
auto.css                          -> light + dark
auto-colorblind.css               -> light-colorblind + dark-colorblind
auto-high-contrast.css            -> light-high-contrast + dark-high-contrast
auto-tritanopia.css               -> light-tritanopia + dark-tritanopia
auto-colorblind-high-contrast.css -> light-colorblind-high-contrast + dark-colorblind-high-contrast
auto-tritanopia-high-contrast.css -> light-tritanopia-high-contrast + dark-tritanopia-high-contrast
auto-dimmed.css                   -> light + dark-dimmed
auto-dimmed-high-contrast.css     -> light-high-contrast + dark-dimmed-high-contrast
```

- 发布写出、artifacts 和验证流程都基于这份清单展开

原因：

- 这样第一阶段可以只验证一条最小路径，后续新增一个自动组合时只需要补一条声明，而不是改动多处分支逻辑
- light 与 dark 相关主题并不是一一对应，显式列出矩阵可以避免后续按后缀误推组合关系
- 也能让 README 和 `exports` 的生成或维护更有规律

备选方案：

- 继续只支持 `auto.css`
  - 放弃原因：已经不能满足当前新增 `auto-dimmed.css` 的需求

### 7. full/slim 验证链路继续保留，但要能映射到双作用域输出

决策：

- slim token 推导、full/slim 对照和静态验证逻辑继续存在
- 但最终写出和验证要覆盖：
  - Primer scope theme bundles
  - `.markdown-body` scope theme bundles
  - Primer scope `auto*`
  - `.markdown-body` scope `auto*`

原因：

- 本次变化的主要风险不在“token 是否足够”，而在“作用域重组后 token 是否仍完整、是否切换正确”
- 复用现有 full/slim 资产能降低实现风险，但验证对象必须从单作用域扩成双作用域

备选方案：

- scoped 产物不做 artifacts 验证，只验证 dist 写出
  - 放弃原因：如果作用域转换出错，问题会直接落到发布面，缺少仓库内对照基线

### 8. 默认自动组合先固定最小配对，并预留后续扩展

决策：

- 第一阶段 `auto.css` 使用 `light` 作为浅色主题，`dark` 作为深色主题
- 第二阶段按上面的显式配对矩阵扩展其他 `auto-*` 文件
- 本次不把自动组合扩展为任意矩阵生成，只先支持显式声明的固定清单

原因：

- 你刚刚明确了可以先把 `auto.css` 验证好，这说明当前最重要的是先验证模型，而不是先把自动组合一次性铺满
- 如果一开始就把所有可能的组合都展开，会明显扩大设计与验证复杂度
- 先把“固定清单 + 易扩展命名”做稳，比提前做无限组合更合适

备选方案：

- 自动为所有 dark 主题都生成一个 `auto-*` 变体
  - 放弃原因：当前没有全部变体需求，且会迅速膨胀发布面

### 9. 主题列表附带简短选择说明

决策：

- 每个主题在 OpenSpec 和 README 中都要配一条简短说明
- 说明的目标不是介绍实现细节，而是帮助用户快速选择
- 说明优先描述三类差异：
  - 标准外观
  - 无障碍色觉适配
  - 低对比度或高对比度偏好

建议文案：

```text
light
  GitHub 标准浅色主题，适合默认阅读场景。

light-colorblind
  浅色主题的色觉友好变体，适合红绿区分更敏感的场景。

light-high-contrast
  浅色高对比主题，适合需要更强视觉边界的场景。

light-tritanopia
  浅色主题的蓝黄/蓝绿区分友好变体。

light-colorblind-high-contrast
  浅色色觉友好加高对比变体。

light-tritanopia-high-contrast
  浅色蓝黄友好加高对比变体。

dark
  GitHub 标准深色主题，适合常规夜间阅读。

dark-dimmed
  更柔和的深色主题，适合低亮度环境长时间阅读。

dark-high-contrast
  深色高对比主题，适合需要更强视觉分隔的场景。

dark-colorblind
  深色主题的色觉友好变体，适合红绿区分更敏感的场景。

dark-tritanopia
  深色主题的蓝黄/蓝绿区分友好变体。

dark-colorblind-high-contrast
  深色色觉友好加高对比变体。

dark-dimmed-high-contrast
  更柔和的深色高对比变体。

dark-tritanopia-high-contrast
  深色蓝黄友好加高对比变体。
```

## Risks / Trade-offs

- [导出路径会变化] → 需要在 README、`exports` 和变更说明中清楚标出新导入方式，并说明旧命名不再作为主发布面
- [作用域转换可能误处理 token 块] → 应把转换逻辑建立在“先解析 base/theme 再重组”的结构化流程上，而不是整体 bundle 级别文本替换
- [`auto*` 可能混淆浅深色来源] → 用显式配对清单固化每个自动产物的 light/dark 主题来源
- [验证复杂度上升] → 继续复用 `artifacts/` 与现有报告结构，只在其上增加 scope 维度
- [README 需要同时解释两类消费者] → 用“Primer 兼容”和“局部 markdown”两节分开说明，避免混在一起
- [主题说明文案与 README 复用时可能不一致] → 将 OpenSpec 中的主题简介作为后续 README 的唯一来源

## Migration Plan

1. 先在 spec 中固定双作用域发布结构、命名规则和 `auto*` 契约
2. 再调整构建脚本的数据模型与写出路径，让中间阶段可以同时表示两种 scope
3. 扩展 artifacts 与验证报告，覆盖 scoped/primer 两类最终产物
4. 最后更新 `exports`、README、`artifacts/README.md`、主题说明文案和使用示例

## Open Questions

- 是否需要为 scoped 产物额外提供 `markdown-body-auto` 这一类更显式但更长的别名路径
  - 当前建议是不需要，直接使用 `dist/auto.css`
- 是否需要立即补齐 `auto-high-contrast.css`、`auto-colorblind.css` 等更多自动组合
  - 当前建议是不立即铺开，只先做固定清单可扩展模型，并优先落地 `auto.css`
- 是否要保留旧的 `github-markdown-*.css` 兼容导出一段过渡期
  - 当前建议是不保留，直接让新变更定义新的稳定发布面
