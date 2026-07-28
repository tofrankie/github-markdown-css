## ADDED Requirements

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
