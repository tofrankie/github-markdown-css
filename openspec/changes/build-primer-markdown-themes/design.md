## Context

当前仓库只有一个空的 `src/index.css`、一个空的 `src/index.ts`，以及一个顶层 `markdown-reference.css` 参考文件，还没有正式的样式构建流程、产物目录和包导出约定。经过对本地依赖的勘察，可以确认：

- `@primer/css/markdown/index.scss` 提供 markdown 样式入口
- `@primer/css` 的 markdown 样式本身消费 CSS 变量，但不负责定义完整主题变量
- `@primer/primitives/dist/css/functional/themes/*.css` 提供更完整的主题变量产物，数量多于 `@primer/css/color-modes/index.scss` 聚合的主题集合

这说明本仓库的第一阶段目标不应是自己重写 GitHub Markdown 样式，而应围绕 Primer 官方来源建立一条稳定的样式产物管线，并公开清晰的消费边界。

## Goals / Non-Goals

**Goals:**

- 建立基于 Primer 官方源文件的 markdown 样式构建流程
- 定义主题文件、markdown 样式文件、组合包三层产物结构
- 以 `@primer/primitives` 的主题产物为准，覆盖完整主题集合
- 定义可发布、可引用的子路径导出约定
- 为后续变量裁剪保留稳定的目录和职责边界

**Non-Goals:**

- 不在本次设计中实现未使用 CSS 变量裁剪
- 不在本次设计中发明自定义主题系统或替换 Primer 变量命名
- 不承诺提供 JavaScript 运行时 API，本次以 CSS 资产消费为主
- 不修改 Primer 上游样式语义，只做构建、组织和导出

## Decisions

### 1. 将产物拆分为 markdown、themes、bundles 三层

决策：

- `dist/github-markdown.css` 仅包含 markdown 结构样式
- `dist/themes/*.css` 每个文件仅包含一套主题变量
- `dist/bundles/*.css` 每个文件包含单主题变量与 markdown 样式的组合产物

原因：

- 让“主题变量”和“markdown 规则”职责分离，便于用户按需组合
- 让后续变量裁剪仅作用于主题层，不影响 markdown 样式层
- 兼顾灵活消费和开箱即用消费两类用户

备选方案：

- 只输出一个大而全的 CSS 文件
  - 放弃原因：主题不可按需消费，后续裁剪空间和导出语义都不清晰
- 只输出 markdown 文件和主题文件，不输出 bundle
  - 放弃原因：虽然更纯粹，但会增加消费者组合成本，不利于与现有 `github-markdown.css` 心智对齐

### 2. 主题清单以 `@primer/primitives` 产物为准

决策：

- 公开主题列表时，以 `@primer/primitives/dist/css/functional/themes/*.css` 中实际存在的主题文件为准

原因：

- 该目录包含的主题集合比 `@primer/css/color-modes/index.scss` 更完整
- 直接对齐已编译主题产物，避免人为维护映射时丢失高对比等变体

备选方案：

- 以 `@primer/css/color-modes/index.scss` 为准
  - 放弃原因：主题覆盖不完整，无法准确表达可重导出的全部主题包

### 3. markdown 样式来源于 `@primer/css/markdown/index.scss`

决策：

- markdown 样式构建直接以 `@primer/css/markdown/index.scss` 为编译入口
- 第一阶段使用 `sass` 负责编译 SCSS，并使用轻量 Node 脚本负责主题扫描、文件复制和 bundle 生成

原因：

- 与 Primer 官方维护的 markdown 规则保持一致
- 比手动复制已有顶层 `markdown-reference.css` 更可复现，也更容易随依赖升级
- `sass + Node 脚本` 足以覆盖 SCSS 编译、主题发现和多产物编排，复杂度低于将应用型打包器接入发布流程

备选方案：

- 直接提交并维护仓库内拷贝版 CSS
  - 放弃原因：升级路径差，难以证明来源，容易与依赖版本漂移

### 4. 第一阶段只做结构化重导出，不做变量裁剪

决策：

- 本次变更不对主题变量做删除、折叠或最小化裁剪

原因：

- 主题变量内部存在别名和相互引用关系，直接裁剪容易破坏兼容性
- 第一阶段先把“来源、目录、导出、引用方式”稳定下来，后续才能独立评估优化效果

备选方案：

- 在首个变更里一并做变量使用分析和裁剪
  - 放弃原因：范围耦合过深，风险高，验证成本大

### 5. 子路径导出优先围绕 CSS 资产设计

决策：

- 包导出以 CSS 文件路径为核心，而不是先设计 JS API
- 根入口可以保持最小化，仅服务包发布完整性或后续元信息扩展

原因：

- 当前包的主要价值是可消费的 CSS 产物
- 可以减少不必要的 API 面设计和长期维护成本

## Risks / Trade-offs

- [主题集合随上游变化而变化] → 构建逻辑应从主题目录动态发现文件，不手写固定列表
- [Bundle 数量增加会提高发布产物数量] → 保持文件命名规则稳定，并在 README 中清晰说明消费方式
- [顶层历史 `markdown-reference.css` 与新 `dist` 产物并存可能引起歧义] → 在实现阶段明确其参考角色，并迁移正式消费路径到 `dist` 目录和子路径导出
- [后续变量裁剪可能要求额外产物形态] → 当前设计先保持分层，给未来新增 `slim` 类产物预留空间

## Migration Plan

1. 建立新的构建脚本和 `dist` 产物目录
2. 使用 `sass` 编译 `@primer/css/markdown/index.scss`，并由 Node 脚本完成主题与 bundle 产物编排
3. 生成 markdown 样式文件、主题文件和 bundle 文件
4. 调整包导出和发布文件清单，使消费者通过子路径访问新产物
5. 更新 README 和 playground，验证推荐引用路径
6. 在后续单独变更中评估变量裁剪是否需要引入新产物或新导出

本次变更不涉及线上服务迁移，也不需要回滚数据库或运行时状态。若实现效果不理想，回滚策略为恢复此前的发布文件结构和引用方式。

## Open Questions

- 组合包文件名是否保留 `github-markdown-<theme>.css` 的显式命名，还是统一收敛到 `bundles/<theme>.css`
- 是否需要在第一阶段就暴露一个主题名清单的 JS 常量，还是继续保持纯 CSS 消费模型
- 顶层 `markdown-reference.css` 在实现阶段是仅保留为参考文件，还是需要额外提供兼容导出或生成映射
