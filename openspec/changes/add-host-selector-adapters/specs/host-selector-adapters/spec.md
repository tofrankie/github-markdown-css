## ADDED Requirements

### Requirement: 公开导出分组配置必须通过统一模型暴露

该包 MUST 提供统一的导出分组模型，用于描述不同公开发布面的主题 selector 语义、`base + theme + markdown` 拼接策略和最终输出策略。维护者新增一个发布面时，默认 MUST 增加一个新的导出分组，而不是在构建脚本里添加零散的分支判断。

#### Scenario: 维护者新增一个公开导出分组

- **WHEN** 维护者需要支持一个新的公开发布面
- **THEN** 他可以通过新增一个导出分组完成扩展，而不需要先改动核心主题生成算法

#### Scenario: 导出分组具备最小必要字段

- **WHEN** 维护者查看任一导出分组配置
- **THEN** 他可以直接看到分组 key、selector strategy、composition strategy 和 output strategy，而不需要反向阅读实现推断配置语义

### Requirement: 该包必须提供首批一等公开导出分组

该包 MUST 至少提供四类一等公开导出分组：默认 `generic`、`pure`、`primer`、`vscode`。其中 `pure` 是“只有规则、没有 token 定义”的独立单文件分组，而不是其他宿主下的子类。

#### Scenario: 生成默认 generic 发布面产物

- **WHEN** 包构建默认 `generic` 发布面
- **THEN** 它会生成面向普通网页或自定义 markdown 容器的主题产物

#### Scenario: 生成 primer 发布面产物

- **WHEN** 包构建 `primer` 发布面
- **THEN** 它会生成面向 Primer selector 语义的主题产物

#### Scenario: 生成 vscode 发布面产物

- **WHEN** 包构建 `vscode` 发布面
- **THEN** 它会生成面向 VS Code WebView light / dark selector 语义的主题产物

### Requirement: 第一阶段主题范围必须收敛为 light、dark、auto

该包在本次 change 的第一阶段 MUST 先只提供 `light`、`dark`、`auto` 三类主题产物，以控制 target-first 重构的复杂度。其他颜色主题与扩展自动组合 MAY 在后续 change 中补充，但不属于本阶段交付要求。

#### Scenario: 第一阶段生成固定主题

- **WHEN** 包完成第一阶段构建
- **THEN** 默认 `generic`、`primer`、`vscode` 至少会生成 `light` 与 `dark` 两个固定主题产物

#### Scenario: 第一阶段生成自动主题

- **WHEN** 包完成第一阶段构建
- **THEN** 默认 `generic`、`primer`、`vscode` 至少会生成 `auto` 产物，而 `pure` 作为单文件规则产物不再按主题拆分

#### Scenario: 其他颜色主题不属于第一阶段阻塞项

- **WHEN** 第一阶段验证流程运行
- **THEN** 它不会因为 colorblind、tritanopia、high-contrast 或其他扩展 `auto*` 组合尚未迁移而判定本阶段失败

### Requirement: auto 主题语义必须由公开导出分组定义

该包 MUST 将 `auto*` 定义为“由当前公开导出分组的自动主题机制决定的 light / dark 组合产物”，而不是全局固定等于 `prefers-color-scheme`。不同分组 MAY 使用不同的自动主题机制，但 MUST 对外保持“单文件表达自动切换”的统一含义。

#### Scenario: 默认 generic 分组的 auto 产物

- **WHEN** 包构建默认 `generic` 的 `auto.css`
- **THEN** 该产物会使用默认 `generic` 的自动主题机制生成 light / dark 组合规则

#### Scenario: vscode 分组的 auto 产物

- **WHEN** 包构建 `vscode` 的 `auto.css`
- **THEN** 该产物会基于宿主 light / dark selector 分支生成自动主题规则，而不是依赖 `prefers-color-scheme`

### Requirement: 宿主型导出分组的单主题产物必须服从各自 selector 语义

该包 MUST 为默认 `generic`、`primer`、`vscode` 提供单主题产物。单主题产物 MUST 表达固定主题，而不是依赖自动切换机制；并且它 MUST 落在对应导出分组的 selector 语义下。

#### Scenario: 默认 generic 分组的单主题产物

- **WHEN** 包构建默认 `generic` 的单主题文件
- **THEN** 该产物会在默认 `generic` 定义的容器作用域下表达固定主题，而不是额外引入自动切换分支

#### Scenario: primer 分组的单主题产物

- **WHEN** 包构建 `primer` 的单主题文件
- **THEN** 该产物会使用 Primer 对应主题 selector 语义表达固定主题

#### Scenario: vscode 分组的单主题产物

- **WHEN** 包构建 `vscode` 的单主题文件
- **THEN** 该产物会使用 VS Code 对应 light 或 dark selector 语义表达固定主题，而不是退化成媒体查询

#### Scenario: 固定主题在 dark 媒体条件下仍声明同一套变量

- **WHEN** 包构建默认 `generic`、`primer` 或 `vscode` 的固定主题文件
- **THEN** 即使存在 `@media (prefers-color-scheme: dark)` 分支，该分支中也会继续声明同一套固定主题变量，而不是切换到其他主题变量或完全省略定义

### Requirement: 最终产物必须直接使用 base、theme、markdown 拼接

该包 MUST 直接使用 `base`、当前主题对应的 `theme` 和 `markdown` 规则生成最终产物，而 MUST NOT 先把 token 重组成新的统一 `:root {}` 或统一容器块。

#### Scenario: 默认完整主题 artifact 直接拼接三类输入

- **WHEN** 包构建默认 `generic`、`primer` 或 `vscode` 的完整主题产物
- **THEN** 它会按既定顺序直接拼接 `base`、`theme` 和 `markdown`，而不是先合并 token 定义再生成最终文件

#### Scenario: pure artifact 跳过 token 定义但保持拼接模型

- **WHEN** 包构建 `pure` 产物
- **THEN** 它会在同一拼接模型下省略 token 定义输入，但保留 markdown 规则和 `var(--token)` 引用

#### Scenario: 不再生成新的统一 token 容器

- **WHEN** 包生成最终主题文件
- **THEN** 它不会再把来自 `base` 与 `theme` 的变量改写并合并进新的统一 `:root {}` 或统一容器块

### Requirement: 公开发布面必须同时提供默认 generic、pure、primer、vscode 四类导出分组

该包 MUST 将 npm 公开发布面组织为四类导出分组：默认 `generic`、`pure`、`primer`、`vscode`。其中默认 `generic`、`primer`、`vscode` 提供完整主题资产；`pure` 专门表示“只有规则、没有 token 定义”的产物族。

#### Scenario: 默认 generic 分组省略在导出路径中

- **WHEN** 使用方导入不带分组前缀的主题文件
- **THEN** 它表示默认 `generic` 分组的完整主题产物

#### Scenario: pure 分组不输出 token 定义

- **WHEN** 包构建 `pure.css`
- **THEN** 该产物会保留 markdown 规则和 `var(--token)` 引用，但不会包含 `--token: value` 形式的 token 定义

#### Scenario: pure 分组不再区分 light dark auto

- **WHEN** 使用方查看 `pure` 导出分组
- **THEN** 它只暴露单个 `pure.css`，主题来源完全由宿主自身的 token definitions 决定，而不是由包内文件名区分

### Requirement: 该包必须提供基于导出分组的 SCSS 组合入口

该包 MUST 提供 SCSS 组合入口，使下游可以在构建期基于公开导出分组语义生成最终规则，而不需要绕开本包的模型手工拼装 selector 和主题语义。SCSS token 入口 MUST 使用显式分支声明结构来表达 light dark auto 或其他自定义模式，而不再提供额外的隐式简写格式。

#### Scenario: 下游基于默认 generic 组合 SCSS

- **WHEN** 下游在构建期使用 SCSS 入口并选择默认 `generic`
- **THEN** 它可以复用默认 `generic` 的 selector 语义来生成对应规则

#### Scenario: 下游基于 vscode 组合 SCSS

- **WHEN** 下游在构建期使用 SCSS 入口并选择 `vscode`
- **THEN** 它可以复用 `vscode` 的自动主题语义，而不需要手写 VS Code light / dark selector 分支

#### Scenario: SCSS token 入口使用显式 modes 结构

- **WHEN** 下游通过 `render-theme-tokens()` 描述单色、双色或更复杂的模式分支
- **THEN** 它会通过显式 `modes` 结构传入 `selectors`、`tokens` 和可选的 `media`，而不是依赖隐式简写字段推断模式语义

#### Scenario: SCSS 入口允许自定义容器但不绕开导出分组语义

- **WHEN** 下游通过 SCSS 入口传入自定义容器 selector
- **THEN** 它可以改变最终规则落点，但仍然会服从所选导出分组的语义约束

#### Scenario: SCSS 入口允许定义非内置导出分组

- **WHEN** 下游需要一个不属于默认 `generic`、`pure`、`primer`、`vscode` 的自定义导出分组
- **THEN** 它可以通过 SCSS 入口显式传入该分组的 selector 语义与主题输入，而不需要先等待 npm 发布一个新的内置导出分组
