## Context

本次设计建立在“基于 Primer 官方源文件生成 markdown 主题 CSS”这条链路之上，并继续围绕 token 来源与瘦身流程演进。基于这个前提，仍有三个需要明确的点：

1. `github-markdown.css` 实际依赖的不只是 theme semantic token，还包括 `base size` 与 `base typography` token
2. 最终发布面与仓库内中间/验证资产的目录边界还需要正式收敛
3. 构建与验证脚本过长，阅读性和维护性都较差
4. markdown token 提取与 `fontStack` 补充来源需要预留低门槛的自定义入口

这次变更的前提是：

- `--base-size-*` 来源于 `@primer/primitives/dist/css/base/size/size.css`
- `--base-text-*` 来源于 `@primer/primitives/dist/css/base/typography/typography.css`
- `--fontStack-sansSerif` 允许通过显式配置的自定义 SCSS 来源补充，并参与构建与验证
- 旧命名 fallback token 暂不纳入本次 slim 产物的保留与删除判定

## Goals / Non-Goals

**Goals:**

- 明确 npm 发布面与仓库内中间/验证资产的目录边界
- 把 `markdown`、`base`、`theme`、`bundle` 的职责边界整理为“最终发布组合物 + 仓库内 full/slim 资产”
- 保留 slim 产物生成流程，用于验证瘦身策略和上游升级对比
- 以 `github-markdown.css` 的实际 token 依赖为起点，对 `base` 与 `theme` 分仓做最小保留集裁剪
- 为额外 markdown token 名单与额外 `fontStack` 来源预留简单、显眼、可注释的配置钩子
- 定义 slim 产物的静态验证和渲染一致性验证口径
- 将构建与验证逻辑拆到 `scripts/utils/`，让入口脚本只保留主流程编排

**Non-Goals:**

- 本次不修改 `@primer/css/markdown/index.scss` 的编译输入，也不重写 markdown 规则
- 本次不要求 `--fontStack-sansSerif` 必须来自 Primer 官方 source of truth
- 本次不把旧命名 fallback token 纳入 slim 算法的裁剪对象
- 本次不把 full/slim 中间资产继续作为 npm 消费导出面
- 本次不把自定义钩子做成复杂插件系统或隐藏式动态发现机制

## Decisions

### 1. `dist/` 只保留最终发布产物

决策：

- `dist/` 只输出最终 npm 发布产物：
  - `dist/github-markdown-light.css`
  - `dist/github-markdown-dark.css`
  - 以及其他主题同类文件
- 每个发布文件都由 slim 后的 `base + theme + markdown` 组合而成

原因：

- `dist/` 应该保持简单，直接表达“这是发布给消费者的最终 CSS”
- 发布面应直接体现经过瘦身校验后的最终结果，而 full 资产只作为仓库内对照基线保留
- 避免把 full/slim 中间资产、报告和对照页面一起打进 npm 包
- 让 README 与 `exports` 更聚焦最终消费模型

备选方案：

- 继续导出 `dist/base/*`、`dist/themes/*`、`dist/bundles/*`
  - 放弃原因：发布面过宽，把内部编排细节暴露给使用方
- 把 full/slim 报告也继续放在 `dist/`
  - 放弃原因：会把验证资产和 npm 发布资产混在一起

### 2. 用 `artifacts/` 保存中间与验证资产

决策：

- 仓库内使用 `artifacts/`，承载：
  - `full/`：base、theme、bundle 的 full 资产
  - `slim/`：base、theme、bundle 的 slim 资产
  - `reports/`：校验结果和对照报告
  - 其他构建生成的验证页面
- `scripts/fixtures/markdown-fixture.html` 继续作为源码级 fixture 模板输入，不放入 `artifacts/`

原因：

- `artifacts` 明确表达“这是仓库内构建/验证资产，不是发布面”
- 便于在上游依赖升级时做新旧对照、人工 spot-check 和 review
- fixture 模板属于脚本输入，和生成产物应分开管理

备选方案：

- 使用 `dist/validation` 继续承载这些资产
  - 放弃原因：仍然没有解决发布面与验证面的混杂
- 把 fixture 模板也挪进 `artifacts/`
  - 放弃原因：模板是脚本源码的一部分，不应伪装成生成物

### 3. 将 markdown 的依赖来源显式拆为 base 与 theme 两类

决策：

- markdown 规则继续由 `@primer/css/markdown/index.scss` 编译得到
- `base` 负责来自 `@primer/primitives/dist/css/base/**` 的基础 token
- `theme` 负责来自 `@primer/primitives/dist/css/functional/themes/**` 的主题语义 token
- 最终发布产物由 `base + theme + markdown` 组合而成

原因：

- 这样才能让“缺什么 token”与“从哪个来源补 token”有稳定映射
- 也能让后续瘦身按来源分仓，而不是在一个混合文件里做粗粒度删除

备选方案：

- 继续把 base token 暴露为 npm 独立消费入口
  - 放弃原因：新的发布目标是只提供最终主题 CSS，而不是暴露内部拼装部件

### 4. slim 算法以 markdown 实际引用为入口，再按来源做依赖闭包

决策：

- 从 `dist/github-markdown.css` 提取全部 `var(--token)` 引用，形成初始引用集合
- 从一个或多个自定义 token JSON 文件读取额外 token 名单，并在去重后与 `markdown` 提取结果合并
- 按命名与来源规则分桶：
  - `--base-size-*` -> `base/size`
  - `--base-text-*` -> `base/typography`
  - 其余纳入本次范围的语义 token -> `themes`
- 对每个来源文件分别做内部依赖闭包
  - 若保留的 token 定义体中继续引用同源 token，则递归保留其依赖
- 只把闭包后的保留集合写入仓库内 slim 资产

原因：

- 以 markdown 的真实消费为起点，避免对上游 theme 文件做纯静态“猜测式删除”
- 允许少量自定义 token 名单显式并入，覆盖 markdown 文本提取之外的已知依赖
- 分仓闭包更容易解释，也更便于在出问题时定位是 `base size`、`base typography` 还是 `theme semantic`

备选方案：

- 对 full theme 文件做一次性全局裁剪
  - 放弃原因：会把不同来源与不同职责的 token 混在一起，验证难度更高
- 直接根据文本命中保留 token，不做依赖闭包
  - 放弃原因：会误删 alias 链上的必要依赖

### 5. 为 token 名单与 `fontStack` 来源提供显式配置钩子

决策：

- 在构建入口附近保留一眼可见的配置常量或配置对象，明确列出：
  - 一个或多个额外 markdown token JSON 文件路径
  - 一个或多个额外 `fontStack` SCSS 文件路径
- 额外 token JSON 文件中的 token 名单会与从 `markdown` 抽取出的 token 集合合并并去重
- 额外 `fontStack` SCSS 文件用于补充 `--fontStack-sansSerif` 等自定义来源，并参与最终构建与验证
- 这些配置项必须带简短注释，方便后续直接修改

原因：

- 这类自定义输入是预期内扩展点，应该显式存在，而不是散落在工具模块内部
- 把配置放在构建入口附近，更容易让维护者第一眼发现和修改
- JSON 与 SCSS 各自对应“额外 token 名单”和“额外样式来源”，职责清晰

备选方案：

- 通过脚本内部隐式扫描固定目录发现配置
  - 放弃原因：可见性差，不利于维护
- 做成通用插件机制
  - 放弃原因：对当前仓库规模来说过重

### 6. 构建与验证入口保持轻量，复杂逻辑拆到 `scripts/utils/`

决策：

- `scripts/build-css.mjs` 与 `scripts/validate-css.mjs` 只保留 `main()` 和主流程编排
- token 解析、来源分桶、依赖闭包、CSS 过滤、路径管理、写出逻辑、报告校验等能力拆到 `scripts/utils/`

原因：

- 构建与验证逻辑需要按职责拆分，以降低后续调整目录边界或验证口径时的维护复杂度
- 入口脚本按 `main()` 组织，配合 `scripts/utils/` 更符合仓库脚本可读性要求

备选方案：

- 保持单文件实现
  - 放弃原因：阅读成本和变更风险都会持续升高
- 使用更深层的 `scripts/lib/primer-markdown-css/`
  - 放弃原因：仓库规模下层级偏深，不如 `scripts/utils/` 直观

### 7. 显式排除暂不处理的 token 类别

决策：

- `--fontStack-sansSerif` 默认不依赖 Primer 官方来源解决，但允许通过显式配置的自定义 SCSS 来源补充
- 旧命名 fallback token 不参与 slim 删除判定，也不作为本次闭包分析的来源文件输入

原因：

- 这些变量的来源与兼容语义尚未完全收束，但 `fontStack` 已有明确的自定义补充入口需求
- 先把 base 与 theme 这两类来源清理干净，能显著降低本次范围与风险

备选方案：

- 在同一变更中一并解决 font stack 与 legacy fallback
  - 放弃原因：范围扩大过快，容易让“能安全瘦身”的核心问题失焦

### 8. 验证分为静态完整性和对照资产两层

决策：

- 静态验证：
  - 检查 slim 产物内是否仍存在指向同源已删除 token 的悬空引用
  - 检查 slim 资产是否包含 markdown 所需的 in-scope base 与 theme token
- 对照资产：
  - 用统一 markdown fixture 同时生成 full 与 slim 的 HTML 对照页面
  - 生成报告，比较关键 token 定义是否一致
  - 保留这些资产在 `artifacts/` 中，供人工复核

原因：

- 仅有文本级 token 检查，不足以证明最终视觉行为不变
- 仅靠自动报告不足以支持上游升级后的人工审查，因此还需要保留可打开的对照资产

备选方案：

- 只做静态验证
  - 放弃原因：无法支持对照新旧产物和上游升级差异
- 只保留自动报告，不保留页面对照资产
  - 放弃原因：不利于后续人工验证关键节点样式

## Risks / Trade-offs

- [发布路径调整会影响导出与文档] → 在实现阶段同步更新 `exports`、README 和消费示例，明确不再暴露内部产物路径
- [把 full/slim 资产迁到仓库目录会增加版本库体积] → 只保留必要的中间资产、对照页面和报告，并让目录语义保持稳定
- [base token 与 theme token 的边界判断错误] → 把来源规则写死在构建逻辑和规格里，并用来源文件路径做验证
- [自定义 token / SCSS 钩子位置不明显] → 在构建入口顶部集中声明配置，并附带简短注释说明用途
- [依赖闭包未覆盖特殊写法] → 先支持当前产物里稳定可解析的 `var(--token)` 依赖形式，并在验证阶段暴露遗漏
- [脚本拆分后职责漂移] → 让 `build-css.mjs` / `validate-css.mjs` 只做编排，工具模块按单一职责划分
- [对照资产覆盖不全] → 固定一份包含标题、引用、代码、表格、列表等高频节点的 markdown fixture 作为基线

## Migration Plan

1. 先把 `dist` 的最终发布文件命名与导出面收敛到 `github-markdown-*.css`
2. 再把 full/slim 中间资产、报告和对照页面迁移到 `artifacts/`
3. 增加自定义 token JSON 与 `fontStack` SCSS 配置钩子，并放在构建入口附近
4. 拆分构建与验证脚本到 `scripts/utils/`
5. 更新 README、`package.json` 和验证流程说明
6. 如果新目录结构效果不理想，可先回滚 `exports` 与 `dist` 发布面定义，同时保留算法本身

## Open Questions

- 自定义 `fontStack` SCSS 钩子最终是仅补 `--fontStack-sansSerif`，还是顺带承载更多非 Primer 官方来源的排版 token
