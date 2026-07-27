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

该包 MUST 提供便捷的最终组合产物，将内部生成的 base token、单个主题资产与 markdown 样式文件合并在一起，以便使用方通过一次 CSS 引入即可获得可直接使用的 GitHub Markdown 主题。

#### Scenario: 构建便捷组合包

- **WHEN** 包构建完成
- **THEN** 它会生成同时包含所需 base token、单个主题和 markdown 样式文件的最终主题 CSS 产物

#### Scenario: 发布产物使用 slim 结果

- **WHEN** 包把最终主题 CSS 写入 `dist/`
- **THEN** 写入 `dist/github-markdown-*.css` 的内容必须来自 slim 后的 `base + theme + markdown` 组合结果，而不是 full bundle

#### Scenario: 组合包命名对使用方保持稳定

- **WHEN** 使用方按照文档中的主题 CSS 引入路径使用
- **THEN** 该路径会稳定解析到一个对应具体主题、可直接使用的最终主题 CSS 产物
