## 1. Export Groups

- [x] 1.1 设计并落地统一的导出分组配置模型，覆盖 selector strategy、composition strategy 和 output strategy
- [x] 1.2 为首批正式导出分组补齐配置，至少覆盖默认 `generic`、`pure`、`primer`、`vscode`
- [x] 1.3 定义公开导出分组语义，至少覆盖默认 `generic`、单文件 `pure`、`primer`、`vscode`
- [x] 1.4 为第一阶段主题矩阵写死 `light`、`dark`、`auto` 的最小交付范围
- [x] 1.5 设计 SCSS 组合入口与公开导出分组语义的映射方式，统一使用显式 `modes` 结构，避免后续二次重构核心链路
- [x] 1.6 基于新的导出分组模型重审现有 `themes`、`published-bundles` 与 token source 配置边界，收敛哪些仍是共享配置，哪些应转入导出分组

## 2. Publish Surface Redesign

- [x] 2.1 重新设计最终 `dist/` 目录结构，使导入路径围绕公开导出分组组织而不是围绕旧 scope 组织
- [x] 2.2 重构最终主题文件生成逻辑，直接按 `base + theme + markdown` 拼接，让每类导出分组自己决定固定主题与 `auto` 的最终结构
- [x] 2.3 实现默认 `generic`、`primer`、`vscode` 的完整主题产物，并在路径上省略 `full`
- [x] 2.4 实现单文件 `pure.css`，只保留 `var(--token)` 引用和 markdown 规则，不输出 token 定义
- [x] 2.5 为默认 `generic`、`primer`、`vscode` 生成对应 selector 语义下的 `light` 与 `dark` 单主题文件
- [x] 2.6 为默认 `generic`、`primer`、`vscode` 生成 `auto` 产物，并确认 `pure` 不参与主题拆分
- [x] 2.7 让固定主题文件在 `@media (prefers-color-scheme: dark)` 分支下继续输出同一固定主题变量
- [x] 2.8 为默认 `generic`、`primer`、`vscode` 跑通 `light`、`dark`、`auto` 输出，同时生成单文件 `pure.css`
- [x] 2.9 提供 SCSS 组合入口，支持基于默认 `generic`、`pure`、`primer`、`vscode` 导出分组的构建期组合
- [x] 2.9.1 提供自定义导出分组的 SCSS 输入能力，使下游可以在构建期传入非内置 selector 语义
- [x] 2.9.2 让 `render-theme-tokens()` 固定采用显式 `modes` 结构，不再额外支持隐式简写参数
- [x] 2.10 移除“把 token 合并到统一 `:root {}` 或统一容器块”的旧处理，统一改为直接拼接链路

## 3. Validation

- [x] 3.1 将 published artifacts 与 report 输出改为按导出分组分组，便于逐个发布面检查
- [x] 3.2 重构验证逻辑，分别校验各导出分组的 selector 结构、单主题语义、token 作用域和 `auto` 语义
- [x] 3.3 增加默认 `generic` / `primer` / `vscode` 与 `pure.css` 的对应关系验证，确保差异聚焦在 token 定义提供方式
- [x] 3.4 增加固定主题 dark 媒体分支校验，确认其重复定义的是同一固定主题变量
- [x] 3.5 先仅针对 `light`、`dark`、`auto` 建立稳定验证断言，暂不阻塞其他颜色主题
- [x] 3.6 增加 SCSS 入口到导出分组的映射验证，确保示例组合结果与最终 CSS 语义一致
- [x] 3.7 增加直接拼接链路验证，确认最终产物没有再生成新的统一 token 容器
- [x] 3.8 运行并修正 `pnpm build`、`pnpm build:artifacts`、`pnpm check:css` 暴露出的 target-first 发布问题

## 4. Documentation Rewrite

- [x] 4.1 重写 `README.md` 的导入说明，让“按目标宿主选择产物”成为首要入口
- [x] 4.2 更新 `artifacts/README.md`，说明导出分组、SCSS 入口、变量来源与分组级验证方式
- [x] 4.3 为默认 `generic`、`pure`、`primer`、`vscode` 整理最小接入示例，覆盖 CSS 导入与 SCSS 组合、单主题 / `auto`，并明确 `pure` 只有 `pure.css`
- [x] 4.3.1 补充一个非内置自定义导出分组的 SCSS 示例，直观说明这类扩展入口如何使用
- [x] 4.3.2 所有 SCSS 示例统一改为显式 `modes` 写法，避免简写和展开两套 API 并存
