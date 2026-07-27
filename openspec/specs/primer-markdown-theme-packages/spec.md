## ADDED Requirements

### Requirement: 重导出 markdown 依赖的 Primer base token 包

该包 MUST 基于 `@primer/primitives/dist/css/base` 下的官方 CSS 文件生成独立的 base token 资产，以便 `github-markdown.css` 依赖的 `size` 与 `typography` token 可以稳定参与最终主题 CSS 的构建与验证。

#### Scenario: 生成 base token 产物

- **WHEN** 包构建流程运行
- **THEN** 它会至少生成 `size` 与 `typography` 两类 base token CSS 产物

#### Scenario: base token 资产不直接作为 npm 发布面暴露

- **WHEN** 包发布产物被准备完成
- **THEN** 这些 base token 资产用于内部拼装和验证，而不是作为单独的 npm 消费入口导出

### Requirement: 生成 slim token 产物

该包 MUST 根据 `github-markdown.css` 的实际 token 引用生成 slim 资产，并且 MUST 按 token 来源分别对 base 与 theme 做最小保留集裁剪，而不是对所有变量做无差别整体删除。

#### Scenario: 合并自定义 token 名单

- **WHEN** 构建流程读取一个或多个自定义 token JSON 文件
- **THEN** 它会在去重后把这些 token 与从 `github-markdown.css` 提取出的 token 集合合并，再继续执行来源分桶与瘦身流程

#### Scenario: 按来源分桶 markdown 依赖

- **WHEN** 构建流程从 `github-markdown.css` 提取 token 引用
- **THEN** 它会把 `--base-size-*` 归入 `base size`，把 `--base-text-*` 归入 `base typography`，并把其余纳入本次范围的语义 token 归入对应 theme 产物

#### Scenario: 通过依赖闭包保留必要 token

- **WHEN** 某个被保留的 token 定义继续引用同一来源资产中的其他 token
- **THEN** slim 资产会继续保留该依赖 token，直到同源依赖闭包收敛

#### Scenario: 排除当前不纳入瘦身范围的 token

- **WHEN** 构建流程遇到 `--fontStack-sansSerif` 或 legacy fallback token 引用
- **THEN** 它不会要求本次 slim 算法为这些 token 推导新的来源映射或删除策略

#### Scenario: slim 资产保存到仓库内对照目录

- **WHEN** 构建流程写出 slim 中间产物
- **THEN** 它会把 slim base、slim theme 与 slim 对照资产写入仓库内的固定资产目录，而不是作为 npm 发布面直接导出

### Requirement: 提供显式可配置的自定义输入钩子

该包 MUST 为额外 token 名单与额外 `fontStack` 来源提供显式可配置的输入钩子，并且 MUST 让这些配置在构建入口附近清晰可见、易于修改且带有简短注释。

#### Scenario: 自定义 token JSON 钩子可见且可配置

- **WHEN** 维护者查看构建入口文件
- **THEN** 他可以直接看到并修改额外 token JSON 文件路径配置，而不需要深入工具模块内部查找

#### Scenario: 自定义 `fontStack` SCSS 钩子可见且可配置

- **WHEN** 维护者需要补充 `--fontStack-sansSerif` 的来源
- **THEN** 他可以通过显式配置的自定义 SCSS 文件路径参与构建，而不需要改动核心瘦身算法

#### Scenario: 自定义输入带有简短注释

- **WHEN** 构建入口声明自定义 token 或 `fontStack` 配置
- **THEN** 这些配置项会带有简短注释，说明其用途和修改位置

### Requirement: 验证 slim 产物的完整性与等价性

该包 MUST 为 slim 资产提供静态完整性校验与对照资产校验，以证明 slim 版本在文档声明的构建方式下仍可正确呈现 GitHub Markdown 样式。

#### Scenario: 检查 slim 产物中的悬空引用

- **WHEN** 验证流程检查 slim base 或 slim theme 资产
- **THEN** 它会报告任何指向同源已删除 token 的悬空 `var(--token)` 引用

#### Scenario: 生成 full 与 slim 的对照资产

- **WHEN** 验证流程针对 full bundle 与 slim bundle 运行同一份 markdown fixture
- **THEN** 它会生成可供人工复核的对照页面与报告，用于检查关键 token 定义和关键 markdown 展示区域是否保持一致

## MODIFIED Requirements

### Requirement: 基于 Primer 源文件构建 markdown 样式

该包 MUST 基于 `@primer/css/markdown/index.scss` 生成独立的 markdown 样式文件，以确保 GitHub Markdown 展示样式可以从 Primer 官方源文件稳定复现，而不是依赖手工拷贝维护的本地样式文件。

#### Scenario: 生成 markdown 样式文件

- **WHEN** 包构建流程运行
- **THEN** 它会生成一个从 `@primer/css/markdown/index.scss` 编译得到的独立 markdown 样式产物

#### Scenario: 保持 markdown 样式文件的单一职责

- **WHEN** 使用方只引入 markdown 样式产物
- **THEN** 该产物只包含 markdown 展示规则，并依赖内部拼装所需的 base token 与主题 token 工作，而不会把所有 token 都打进同一个文件

### Requirement: 提供主题与 markdown 的组合产物

该包 MUST 提供两套最终组合产物：一套保留 Primer 原生选择器语义，另一套将 token 作用域收敛到 `.markdown-body`，以便使用方根据集成方式选择“Primer 兼容模式”或“局部 markdown 模式”。

#### Scenario: 生成 Primer 兼容组合包

- **WHEN** 包构建完成
- **THEN** 它会在 `dist/primer/` 下生成保留 Primer 原生主题选择器语义的最终主题 CSS 产物

#### Scenario: Primer 单主题产物包含 base、theme 和 markdown

- **WHEN** 包构建 `dist/primer/<theme>.css`
- **THEN** 该产物会包含 base token、当前主题在 Primer 原生选择器下的 token，以及最终 markdown 规则

#### Scenario: Primer 单主题产物始终表示固定主题

- **WHEN** 使用方引入 `dist/primer/<theme>.css`
- **THEN** 无论 `prefers-color-scheme` 为 light 还是 dark，最终应用的都是该主题对应的同一套 token，而不是切换到另一套主题

#### Scenario: 生成 `.markdown-body` 局部组合包

- **WHEN** 包构建完成
- **THEN** 它会在 `dist/` 根目录下生成将 token 变量限定在 `.markdown-body` 范围内的最终主题 CSS 产物

#### Scenario: scoped 单主题产物包含重组后的 base、theme 和 markdown

- **WHEN** 包构建 `dist/<theme>.css`
- **THEN** 该产物会把 base token 与当前主题 token 重组到 `.markdown-body` 作用域内，并附带最终 markdown 规则

#### Scenario: scoped 单主题产物始终表示固定主题

- **WHEN** 使用方引入 `dist/<theme>.css`
- **THEN** 无论 `prefers-color-scheme` 为 light 还是 dark，最终应用的都是该主题对应的同一套 token，而不是切换到另一套主题

### Requirement: 组合包命名对使用方保持稳定

该包 MUST 使用简化后的稳定命名输出最终主题文件，并且 MUST 通过目录层级而不是冗余文件名前缀来表达作用域差异。

#### Scenario: 主题文件移除历史前缀

- **WHEN** 包把最终主题 CSS 写入 `dist/` 或 `dist/primer/`
- **THEN** 文件名使用 `<theme>.css` 而不是 `github-markdown-<theme>.css`

#### Scenario: 目录层级表达作用域

- **WHEN** 使用方导入最终主题产物
- **THEN** `dist/primer/<theme>.css` 表示 Primer 兼容作用域，而 `dist/<theme>.css` 表示 `.markdown-body` 局部作用域

### Requirement: 提供自动浅深色切换产物

该包 MUST 为两套作用域提供一组可直接消费的 `auto*` 产物，并且 MUST 通过固定配对清单定义这些自动组合的浅色主题与深色主题配对关系。

说明：

- 这里的 `auto.css` / `auto*` 指本包导出的最终 CSS 文件
- 它不同于 Primer 设计系统中的 `data-color-mode='auto'` selector；后者是这些产物在 Primer 兼容模式下复用的上游选择机制

#### Scenario: 生成 Primer 兼容 `auto*` 产物

- **WHEN** 包构建完成
- **THEN** 它会在 `dist/primer/` 下生成 `auto*.css`，其中包含对应浅色/深色主题配对的自动切换规则和所需的 base + markdown 样式

#### Scenario: Primer `auto*` 产物显式区分 light 与 dark 结构

- **WHEN** 包构建 `dist/primer/auto*.css`
- **THEN** 该产物会包含 base token、Primer auto light selector 下的浅色 token、`prefers-color-scheme: dark` 下的深色 token，以及最终 markdown 规则

#### Scenario: 生成 `.markdown-body` 作用域 `auto*` 产物

- **WHEN** 包构建完成
- **THEN** 它会在 `dist/` 下生成 `auto*.css`，其中 light token 位于 `.markdown-body {}`，dark token 位于 `@media (prefers-color-scheme: dark) { .markdown-body {} }`

#### Scenario: scoped `auto*` 产物显式区分 light 与 dark 结构

- **WHEN** 包构建 `dist/auto*.css`
- **THEN** 该产物会包含 `.markdown-body` 下的 base token、`.markdown-body` 下的浅色 token、`prefers-color-scheme: dark` 下 `.markdown-body` 的深色 token，以及最终 markdown 规则

#### Scenario: 自动组合采用固定配对清单

- **WHEN** 维护者需要新增一个新的自动组合产物
- **THEN** 他可以通过增加一条“产物名 + 浅色主题 key + 深色主题 key”的固定配对声明完成扩展，而不需要重构构建流程

#### Scenario: 自动组合矩阵显式列出当前支持项

- **WHEN** 维护者查看构建规格
- **THEN** 他可以直接看到当前支持的自动组合矩阵，而不会把 light 与 dark 的关系误认为一对一

#### Scenario: 自动组合矩阵按固定配对生成

- **WHEN** 包构建完成
- **THEN** 它会按照固定配对清单生成对应的 `auto*` 产物，例如 `auto.css`（`light` + `dark`）与 `auto-dimmed.css`（`light` + `dark-dimmed`）

### Requirement: `.markdown-body` scoped 产物必须重组 base 与 theme token 作用域

该包 MUST 在生成 `.markdown-body` 作用域产物时，按结构化规则重组 `base size`、`base typography` 和主题 token 的作用域，而不是仅对最终 bundle 执行机械的文本前缀替换。

#### Scenario: 将 base token 收敛到 `.markdown-body`

- **WHEN** 构建 `.markdown-body` 作用域的主题文件或 `auto.css`
- **THEN** `--base-size-*` 与 `--base-text-*` token 会被写入一个新的 `.markdown-body {}` token 作用域块

#### Scenario: 将 light theme token 收敛到 `.markdown-body`

- **WHEN** 构建 `.markdown-body` 作用域的单主题文件
- **THEN** 原本定义在 Primer light selector 下的主题 token 会被重组到 `.markdown-body {}` 中

#### Scenario: 将 auto dark token 收敛到媒体查询下的 `.markdown-body`

- **WHEN** 构建 `.markdown-body` 作用域的任一 `auto*` 产物
- **THEN** 原本定义在 `@media (prefers-color-scheme: dark)` 下的 Primer auto selector token 会被重组到 `@media (prefers-color-scheme: dark) { .markdown-body {} }`

### Requirement: 双作用域发布必须延续现有 slim/full 验证链路

该包 MUST 在保留现有 slim/full 中间资产与验证机制的前提下，把验证对象扩展到 Primer scope、scoped scope 和各类 `auto*` 产物，以证明新发布面仍然完整可用。

#### Scenario: 中间资产覆盖双作用域输出

- **WHEN** 构建流程写出 full/slim 中间资产与报告
- **THEN** 它会保留足够的信息用于对照 Primer scope 和 `.markdown-body` scope 的最终输出

#### Scenario: 验证作用域转换后的 token 完整性

- **WHEN** 验证流程检查新的 scoped 产物
- **THEN** 它会报告任何因作用域重组导致的缺失 token、悬空引用或 light/dark 自动切换结构错误

### Requirement: 主题列表必须提供简短选择说明

该包 MUST 为每个支持的主题提供一句简短说明，以便用户在 README 或其他选择界面里快速判断该主题适不适合自己的阅读场景。

#### Scenario: 每个主题都能看到一句简介

- **WHEN** 维护者查看 OpenSpec 或 README
- **THEN** 他可以直接看到每个主题对应的一句话简介，而不需要先理解具体 token 差异

#### Scenario: 主题简介优先表达选择理由

- **WHEN** 维护者编写主题简介
- **THEN** 这些简介会优先说明标准外观、无障碍色觉适配、低对比度或高对比度偏好，而不是实现细节
