## MODIFIED Requirements

### Requirement: 提供主题与 markdown 的组合产物

该包 MUST 将最终主题发布面按公开导出分组组织，而不是按内部历史作用域组织。每个导出分组都会产出一组可直接消费的 markdown 主题文件，并由该分组自己的 selector 语义和作用域策略定义最终结构。

#### Scenario: 发布面按目标宿主组织

- **WHEN** 包完成最终 CSS 发布
- **THEN** 使用方会先按导出分组选择产物，而不是先按内部 scope 类型选择产物

#### Scenario: 导出分组决定最终结构

- **WHEN** 包构建某个导出分组
- **THEN** 该分组的 selector strategy 和 `base + theme + markdown` 拼接策略会共同决定最终主题文件结构

### Requirement: 组合包命名与目录结构必须服务目标宿主选择

该包 MUST 使用以公开导出分组为中心的目录结构和文件命名方式，使使用方可以直接通过导入路径判断“这个文件面向哪个场景”。命名规则 MAY 随本次发布面重构而调整，而不受旧路径兼容性约束。

#### Scenario: 目录层级表达导出分组

- **WHEN** 使用方导入一个最终主题产物
- **THEN** 他可以从目录层级直接判断该文件属于默认 `generic`、`primer`、`vscode` 或 `pure` 分组，其中省略分组时表示默认 `generic`

#### Scenario: 文件命名表达主题语义

- **WHEN** 包写出某个导出分组下的主题文件
- **THEN** 文件名会优先表达主题语义，例如固定主题或 `auto*` 组合；默认完整主题包省略 `full`，而 `pure` 仅暴露为单个 `pure.css`

### Requirement: 自动浅深色切换产物必须服从目标宿主语义

该包 MUST 为支持自动切换的导出分组提供 `auto*` 产物，并且 `auto*` 的实现机制 MUST 服从对应导出分组的自动主题语义，而不是统一依赖单一媒体查询模型。

#### Scenario: generic 分组的自动切换

- **WHEN** 包构建默认 `generic` 的 `auto.css`
- **THEN** 该产物会按默认 `generic` 定义的自动主题机制生成 light / dark 组合规则

#### Scenario: primer 或 vscode 分组的自动切换

- **WHEN** 包构建 `primer` 或 `vscode` 的 `auto.css`
- **THEN** 该产物会按对应分组的自动主题语义生成 light / dark 组合规则，而不是复用其他分组的自动切换机制

### Requirement: 固定主题产物必须继续作为正式发布面提供

该包 MUST 为每个需要自带 token 定义的导出分组提供固定主题产物。固定主题产物 MUST 与 `auto*` 产物并列存在，并且 MUST 通过对应导出分组的 selector 语义表达固定主题，而不是退化为另一种统一的自动切换模型。

#### Scenario: 发布 fixed theme 文件

- **WHEN** 包为某个导出分组写出主题文件
- **THEN** 它会同时提供固定主题文件和 `auto*` 文件，而不是只保留自动切换版本

#### Scenario: fixed theme 文件表达目标宿主语义

- **WHEN** 验证流程检查某个导出分组的固定主题文件
- **THEN** 它会确认该产物使用了该分组的 selector 语义来表达固定主题

#### Scenario: 第一阶段固定主题至少覆盖 light 与 dark

- **WHEN** 包完成第一阶段发布
- **THEN** 每个需要自带 token 定义的导出分组至少覆盖 `light` 与 `dark`

#### Scenario: fixed theme 文件在 dark 媒体分支重复定义固定主题变量

- **WHEN** 验证流程检查某个导出分组的固定主题文件并命中 `@media (prefers-color-scheme: dark)` 分支
- **THEN** 它会确认该分支继续定义同一固定主题的变量，而不是回退到别的主题变量集

### Requirement: 发布验证必须围绕公开导出分组展开

该包 MUST 在保留 token 完整性与 markdown 展示校验目标的前提下，把最终发布验证改为围绕公开导出分组展开，以证明每个发布面的最终产物都结构正确且语义完整。

#### Scenario: 验证每个导出分组的最终结构

- **WHEN** 验证流程检查某个导出分组的最终主题文件
- **THEN** 它会校验该分组的 selector 结构、固定主题或 `auto*` 语义、`base + theme + markdown` 拼接顺序和 markdown 规则落点是否符合该分组定义

#### Scenario: 验证每个导出分组的 auto 语义

- **WHEN** 验证流程检查某个导出分组的 `auto.css`
- **THEN** 它会校验该产物是否正确表达了该分组的自动主题语义

#### Scenario: 验证 pure artifact

- **WHEN** 验证流程检查 `pure.css`
- **THEN** 它会确认产物没有输出 token 定义，同时保留必要的 `var(--token)` 引用和 markdown 规则

#### Scenario: 验证 pure 主题来源完全交给宿主

- **WHEN** 验证流程检查 `pure.css`
- **THEN** 它会确认该产物没有内建 light dark auto 主题区分，而是把主题来源完全留给宿主 token definitions

#### Scenario: 验证完整主题分组与 pure 的对应关系

- **WHEN** 验证流程比较默认 `generic`、`primer` 或 `vscode` 与 `pure` 的同主题文件
- **THEN** 它会确认两者的 markdown 规则语义一致，差异聚焦在 token 定义是否由产物提供以及 selector 语义是否不同

### Requirement: 用户文档必须按目标宿主组织导入说明

该包 MUST 在用户文档中把“按导出分组选择产物”作为首要入口，而不是让使用方先理解内部作用域或历史目录语义。维护者文档 MUST 说明如何新增导出分组、如何定义其 selector strategy，以及如何验证其最终产物。

#### Scenario: README 先引导选择目标宿主

- **WHEN** 普通使用者阅读根 `README.md`
- **THEN** 他会先看到按导出分组选择导入方式的说明，而不是先阅读内部作用域差异

#### Scenario: 维护者文档说明如何新增导出分组

- **WHEN** 维护者阅读 `artifacts/README.md`
- **THEN** 他可以直接找到导出分组的配置入口、作用域策略说明和验证步骤

#### Scenario: 用户文档说明 CSS 与 SCSS 两类消费入口

- **WHEN** 使用者阅读文档中的接入示例
- **THEN** 他可以区分“直接导入最终 CSS 产物”和“通过 SCSS 入口在构建期组合规则”这两类使用方式
