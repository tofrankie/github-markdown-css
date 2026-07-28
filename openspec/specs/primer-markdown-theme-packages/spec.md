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

### Requirement: 维护者配置必须通过集中声明式 registry 暴露

该包 MUST 提供集中且声明式的维护者配置入口，用于定义 token 来源、主题元数据、发布矩阵和项目级共享配置。维护者新增一个来源、调整一个主题说明或扩展一个 `auto*` 组合时，默认 MUST 通过修改对应 registry 模块完成，而不是先进入内部工具实现查找隐式约定。

#### Scenario: 新增 token 来源时优先修改来源 registry

- **WHEN** 维护者需要新增一个 Primer 官方来源或本地补充来源
- **THEN** 他会在集中来源 registry 中新增一个来源对象，并且默认不需要先改动 token 解析、写盘或验证实现

#### Scenario: 来源配置对象具备最小必要字段

- **WHEN** 维护者查看任一来源配置对象
- **THEN** 他可以直接看到该来源的 `key`、类型、输入格式、路径和用途说明，而不需要反向阅读工具模块推断这些信息

#### Scenario: 新增 auto 组合时优先修改发布矩阵

- **WHEN** 维护者需要新增一个新的 `auto*` 发布产物
- **THEN** 他会通过发布矩阵声明 `fileName`、light theme key 和 dark theme key 完成扩展，而不是在多个脚本里分别拼接组合逻辑

### Requirement: 提供显式可配置的自定义输入钩子

该包 MUST 提供显式、集中且可发现的维护者扩展入口，用于补充 markdown token 输入和额外 token 来源。此类扩展入口 MUST 通过声明式 registry 暴露，并且 MUST 与内部构建算法解耦，使维护者在大多数扩展场景下只需修改配置对象，而不是进入核心工具模块寻找隐藏的 hook。

#### Scenario: 自定义 token 输入在集中配置中可见

- **WHEN** 维护者需要补充 markdown 提取之外仍需保留的 token
- **THEN** 他可以在集中配置模块中直接定位该输入入口，并了解其文件格式与用途说明

#### Scenario: 自定义 SCSS 或 CSS 来源在集中配置中可见

- **WHEN** 维护者需要补充 Primer 默认来源之外的 token 定义来源
- **THEN** 他可以在来源 registry 中新增或修改对应来源对象，而不需要先改动核心瘦身算法

#### Scenario: 扩展入口附带简短用途说明

- **WHEN** 维护者查看扩展配置对象
- **THEN** 每个入口都会附带简短注释或元数据说明，帮助他判断应该修改哪个入口以及是否会影响发布矩阵或验证流程

### Requirement: 提供仓库内的 markdown 扩展入口

该包 MUST 提供一个命名清晰、位置固定的仓库内 markdown 扩展入口 `src/primer-markdown-extended.scss`，作为上游 Primer markdown 源之上的本地扩展层。

#### Scenario: 维护者可以定位扩展入口

- **WHEN** 维护者查看仓库内的 markdown 构建源码
- **THEN** 他可以在 `src/primer-markdown-extended.scss` 找到本地 markdown 扩展入口，而不需要直接修改 `node_modules` 内的上游源码

#### Scenario: 扩展入口先复用上游 markdown 源

- **WHEN** 构建流程编译 markdown 样式入口
- **THEN** 该入口会以 `@primer/css/markdown/index.scss` 为基础，再叠加仓库内的本地 markdown 扩展

### Requirement: markdown 扩展入口必须限制作用域职责

该包 MUST 将 `src/primer-markdown-extended.scss` 的职责限制为 markdown 相关 token 与 markdown 局部样式扩展，而 MUST NOT 将全局 reset、页面级基础样式或依赖全局元素选择器语义的样式整体纳入该入口。

#### Scenario: 允许 markdown 局部扩展

- **WHEN** 维护者需要补充 markdown token 或 `.markdown-body` 相关局部样式
- **THEN** 他可以通过 `src/primer-markdown-extended.scss` 及其本地依赖文件承载这些扩展

#### Scenario: 禁止把全局基础样式整体并入入口

- **WHEN** 维护者尝试把 `@primer/css/base/index.scss` 一类全局基础样式整体并入 markdown 扩展入口
- **THEN** 该做法不会被视为符合本能力的实现，因为它超出了 markdown 局部样式入口的职责边界

### Requirement: 验证 slim 产物的完整性与等价性

该包 MUST 为 slim 资产提供静态完整性校验与对照资产校验，以证明 slim 版本在文档声明的构建方式下仍可正确呈现 GitHub Markdown 样式。

#### Scenario: 检查 slim 产物中的悬空引用

- **WHEN** 验证流程检查 slim base 或 slim theme 资产
- **THEN** 它会报告任何指向同源已删除 token 的悬空 `var(--token)` 引用

#### Scenario: 生成 full 与 slim 的对照资产

- **WHEN** 验证流程针对 full bundle 与 slim bundle 运行同一份 markdown fixture
- **THEN** 它会生成可供人工复核的对照页面与报告，用于检查关键 token 定义和关键 markdown 展示区域是否保持一致

### Requirement: 维护者文档必须先给全局流程再给操作指引

该包 MUST 提供面向维护者和贡献者的结构化文档，先解释构建全局流程和核心概念，再说明本地开发、构建、验证、如何新增配置、注意事项和实现细节。根 README MUST 保持用户向定位，而 `artifacts/README.md` MUST 承担维护者向说明。

#### Scenario: 维护者首次阅读文档时先看到全局流程

- **WHEN** 维护者打开 `artifacts/README.md`
- **THEN** 他会先看到从来源输入到 published/report 输出的核心流程，而不是直接进入零散的局部细节

#### Scenario: 文档明确新增来源的修改入口

- **WHEN** 维护者查找“如何新增一个来源”
- **THEN** 文档会明确指出需要修改的 registry 文件、对象字段和验证步骤，而不是只描述构建原理

#### Scenario: 根 README 继续保持用户向

- **WHEN** 普通使用者阅读根 `README.md`
- **THEN** 他看到的重点仍然是导入方式、主题选择和使用说明，而不是内部维护细节

### Requirement: 仓库内 Node ESM 脚本文件扩展名必须统一

在 `package.json` 已声明 `"type": "module"` 的前提下，仓库内 Node 侧构建与验证脚本 MUST 统一使用 `.js` 扩展名。实现迁移时，脚本入口、相互 import 和文档示例 MUST 一并更新，避免 `.mjs` 与 `.js` 并存造成额外维护负担。

#### Scenario: 新增脚本时使用 `.js`

- **WHEN** 维护者新增一个 Node 构建、验证或开发脚本
- **THEN** 该脚本文件会使用 `.js` 扩展名，并依赖仓库已有的 ESM 语义运行

#### Scenario: 现有脚本迁移后不再保留 `.mjs` 引用

- **WHEN** 仓库完成脚本扩展名统一
- **THEN** `package.json` scripts、脚本间 import 和维护者文档不会再引用旧的 `.mjs` 文件路径

## MODIFIED Requirements

### Requirement: 基于 Primer 源文件构建 markdown 样式

该包 MUST 基于仓库内的 `src/primer-markdown-extended.scss` 生成独立的 markdown 样式文件，并且该扩展入口 MUST 以 `@primer/css/markdown/index.scss` 为基础，以确保 GitHub Markdown 展示样式既可以从 Primer 官方源文件稳定复现，也可以在仓库内承载受控的本地扩展。

#### Scenario: 生成 markdown 样式文件

- **WHEN** 包构建流程运行
- **THEN** 它会生成一个从 `src/primer-markdown-extended.scss` 编译得到的独立 markdown 样式产物

#### Scenario: 扩展入口保持上游 Primer markdown 为基础

- **WHEN** 维护者检查 markdown 样式入口
- **THEN** 他可以确认该入口是基于 `@primer/css/markdown/index.scss` 组织的，而不是完全复制上游源码后单独维护

#### Scenario: 保持 markdown 样式文件的单一职责

- **WHEN** 使用方只引入 markdown 样式产物
- **THEN** 该产物只包含 markdown 展示规则及其受控本地扩展，并依赖内部拼装所需的 base token 与主题 token 工作，而不会把所有 token 都打进同一个文件或夹带页面级基础样式

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

该包 MUST 为两套作用域提供一组可直接消费的 `auto*` 产物，并且 MUST 通过固定、集中且可复用的发布矩阵定义这些自动组合的浅色主题与深色主题配对关系。维护者扩展自动组合时，默认 MUST 修改发布矩阵声明，而不是在多个构建脚本中重复硬编码相同组合。

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

#### Scenario: 自动组合采用集中发布矩阵

- **WHEN** 维护者需要新增一个新的自动组合产物
- **THEN** 他可以通过增加一条“产物名 + 浅色主题 key + 深色主题 key”的矩阵声明完成扩展，而不需要重构构建流程

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

该包 MUST 为每个支持的主题提供一句简短说明，以便用户在 README 或其他选择界面里快速判断该主题适不适合自己的阅读场景。主题 key、分组和简介 SHOULD 由集中主题元数据维护，并被用户文档和维护者文档复用，避免在多个文件中手工复制造成漂移。

#### Scenario: 每个主题都能看到一句简介

- **WHEN** 维护者查看 OpenSpec 或 README
- **THEN** 他可以直接看到每个主题对应的一句话简介，而不需要先理解具体 token 差异

#### Scenario: 主题简介优先表达选择理由

- **WHEN** 维护者编写主题简介
- **THEN** 这些简介会优先说明标准外观、无障碍色觉适配、低对比度或高对比度偏好，而不是实现细节

#### Scenario: 主题元数据可被多处复用

- **WHEN** 用户文档和维护者文档都需要展示主题列表
- **THEN** 它们会复用同一份主题元数据来源，而不是分别维护容易漂移的独立描述副本
