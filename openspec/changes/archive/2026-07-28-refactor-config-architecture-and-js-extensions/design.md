## Context

当前仓库已经具备较完整的 CSS 构建能力，包括：

- 基于 Primer 源文件编译 markdown CSS
- 按 token 引用生成 slim base/theme 资产
- 生成 Primer 兼容与 `.markdown-body` scoped 两套发布产物
- 通过 `artifacts/` 保留 full/slim/published/report 资产用于验证

但维护体验存在明显问题：

- `scripts/build-config.mjs` 同时承载主题矩阵、主题文案、补丁 token 输入和项目级路径语义，职责过重
- 新增 token 来源时，维护者需要理解 `build-config`、`paths.hooks`、`readBaseArtifacts()` 和验证报告之间的隐式约定，缺少统一注册入口
- 用户向与维护者向信息没有清晰分层，`artifacts/README.md` 虽然覆盖了不少内容，但还没有先总览、再操作、再细节的结构
- 仓库在 ESM 前提下继续使用 `.mjs`，会让“这是 Node ESM 项目，还是混合脚本项目”这件事变得不够直接

本次设计要解决的是“配置和维护体验的结构性问题”，而不是重写现有构建算法的业务目标。npm 对外暴露的 CSS 产物、主题选择模型、slim/full 验证思路都应该尽量保留。

## Goals / Non-Goals

**Goals:**

- 把“维护者声明什么”和“构建流程如何执行”分层，建立清晰的声明式配置模型
- 让新增 token 来源、扩展主题元数据、增加 `auto*` 发布组合时，默认只需修改集中配置模块，而不是跨文件理解内部工具实现
- 让脚本结构按阶段拆分，降低 `scripts/utils` 的隐式耦合
- 重写维护者文档，让贡献者能先看到全局流程，再知道如何改配置、何时改代码、如何验证
- 统一仓库内 Node ESM 脚本扩展名为 `.js`

**Non-Goals:**

- 不改变当前对外发布的 CSS import 路径和主题命名
- 不引入新的运行时依赖或配置文件格式
- 不改变 slim token 闭包、双作用域输出和验证链路的核心目标
- 不把根 README 从用户文档改成维护者文档

## Decisions

### 1. 用集中 registry 取代补丁式构建入口

把当前 `build-config` 中混合的配置拆成几个职责清晰的模块，例如：

- `config/project.js`：项目级固定入口、目录与共享常量
- `config/token-sources.js`：token 来源注册表
- `config/themes.js`：主题元数据注册表
- `config/published-bundles.js`：最终发布矩阵，包括单主题与 `auto*` 组合

其中 `token-sources.js` 是本次重构的核心。每个来源都必须是显式对象，而不是仅靠数组路径让下游脚本推断。例如每个来源至少应包含：

- `key`
- `kind`，如 `base`、`theme-extension`
- `format`，如 `css`、`scss`、`json`
- `path`
- `purpose`
- 可选的 `tokenPatterns`、`notes` 或 `scope`

这样维护者新增一个来源时，首先面对的是“注册一个来源对象”，而不是“去理解哪一类 hook 会被哪个工具解释”。

备选方案：

- 保留单一 `build-config`，只补充注释和 README
  不采用，因为问题不是信息缺失，而是配置层级与实现机制耦合
- 改成 JSON/YAML 配置
  不采用，因为本仓库需要路径解析、共享常量和导出复用，JS 模块仍然更适合

### 2. 构建脚本按流水线阶段拆分，而不是按“杂项工具”堆叠

当前 `scripts/utils` 中既有来源读取、又有 published 组装、又有写盘和验证。重构后，脚本应围绕流水线阶段组织，例如：

- `core/load-config.js`
- `core/collect-sources.js`
- `core/resolve-token-scope.js`
- `core/create-slim-artifacts.js`
- `core/create-published-artifacts.js`
- `core/validate-artifacts.js`
- `core/write-artifacts.js`

顶层 `scripts/build-css.js`、`scripts/build-artifacts.js`、`scripts/validate-css.js` 只负责编排阶段，不再承载过多领域细节。

备选方案：

- 仅把文件名从 `utils` 改成别的目录而不调整边界
  不采用，因为这只会换名字，不会降低维护者理解成本

### 3. 主题元数据与发布矩阵分开建模

`themeDescriptions` 不应继续和来源补丁、脚本路径、发布组合放在同一个模块里。主题相关信息应该至少分为两层：

- 主题定义与说明
  包括主题 key、分组、显示文案、简要说明
- 产物发布矩阵
  包括哪些单主题产物要发布、哪些 `auto*` 组合要发布、每个组合对应的 light/dark 主题

这样 README 和维护者文档可以直接消费主题元数据，而构建脚本只消费发布矩阵和主题 key。

### 4. 用“维护者任务导向文档”重写 `artifacts/README.md`

维护者文档应改成以下结构：

1. 项目总览与核心流程图
2. 核心概念说明：source、theme、bundle、full、slim、published、report
3. 日常命令
4. 如何新增来源
5. 如何新增主题元数据或 `auto*` 组合
6. 如何扩展 markdown 入口
7. 注意事项与边界
8. 实现细节

根 README 保持用户向，主要介绍 import 方式和主题选择，不承载内部流水线细节。

备选方案：

- 继续在现有 `artifacts/README.md` 基础上补段落
  不采用，因为当前主要问题是信息结构顺序不对，不是信息量不足

### 5. 统一仓库内 Node ESM 脚本为 `.js`

本仓库 `package.json` 已声明 `"type": "module"`，因此构建脚本应统一使用 `.js`。这次重构会一并完成：

- `scripts/*.mjs` -> `scripts/*.js`
- `scripts/utils/*.mjs` -> 对应新的 `.js`
- 脚本间 import 路径、`package.json` scripts、文档示例同步更新

这样仓库的 ESM 心智模型会更一致：Node 侧统一 `.js + type: module`，不再混用历史 `.mjs`。

备选方案：

- 只在新增文件使用 `.js`，旧文件保留 `.mjs`
  不采用，因为会继续制造两套约定并存的维护成本

## Risks / Trade-offs

- [重构过程涉及多文件搬迁与重命名] → 先固定新的配置与目录边界，再逐步迁移实现，迁移后跑完整 `check:css`
- [声明式 registry 设计过度抽象] → 保持字段最小化，只覆盖当前确实存在的维护动作，不提前设计过多插件能力
- [文档和实现脱节] → 让维护者文档直接围绕 `config/*.js` 的真实入口撰写，避免再描述不存在的抽象层
- [`.mjs` 改 `.js` 时遗漏 import 或脚本命令] → 把文件扩展名迁移作为单独任务清单执行，并用全仓检索校验遗留引用
- [规格写得过宽，导致实现范围膨胀] → 在任务拆分里明确先做配置模型与文档主线，再做文件名统一与验证收尾

## Migration Plan

1. 先引入新的配置模块和目录结构，保持旧脚本仍可作为参考
2. 将来源注册、主题元数据、发布矩阵迁移到新的 registry 模块
3. 重构构建脚本阶段边界，让顶层入口改为消费新配置
4. 迁移并统一 `.mjs` 到 `.js`，同步修正 import 和 `package.json` scripts
5. 重写 `artifacts/README.md`，必要时微调根 README 的维护者链接或描述
6. 运行构建与验证命令，确保外部产物命名和验证链路保持可用

如果中途发现新 registry 设计无法覆盖现有 slim/full 验证需求，回滚策略是保留现有输出结构与验证口径，缩小 registry 首次落地范围，但不回退到单一 `build-config` 模式。

## Open Questions

- `config/` 是否直接放在仓库根目录，还是继续归属于 `scripts/` 下的某个子目录
- token 来源对象是否需要显式区分“参与 scope 归属判断”和“只提供补充 token 定义”两类角色
- 维护者文档是否需要补一张实际文件树，帮助贡献者快速定位新结构
