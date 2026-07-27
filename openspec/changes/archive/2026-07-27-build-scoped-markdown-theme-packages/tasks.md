## 1. 定义双作用域发布模型

- [x] 1.1 修改构建规格与发布结构，明确 `dist/primer/*.css` 与 `dist/*.css` 的职责边界
- [x] 1.2 固定文件命名规则为 `<theme>.css` 与 `auto.css`，移除 `github-markdown-` 前缀
- [x] 1.3 固定自动组合命名规则为 `auto*.css`，第一阶段先只启用 `auto.css`
- [x] 1.4 固定第一阶段 `auto.css` 使用 `light` + `dark`，并为后续 `auto-dimmed.css` 等变体保留同一扩展模型
- [x] 1.5 显式列出当前支持的自动组合矩阵，避免 light 与 dark 主题关系被误读成一对一

## 2. 设计 `.markdown-body` 作用域转换规则

- [x] 2.1 明确 `base size`、`base typography` token 如何落入新的 `.markdown-body {}` 块
- [x] 2.2 明确 scoped 单主题文件的最终组织形式，以及 theme token 如何落入 `.markdown-body`
- [x] 2.3 明确 Primer 单主题文件与 Primer `auto*` 文件的最终组织形式
- [x] 2.4 明确第一阶段 `auto.css` 如何从“light + dark”配对生成，并验证该模型不依赖硬编码特例
- [x] 2.5 明确自动组合矩阵中各条目的 light/dark 主题配对关系
- [x] 2.6 明确 scoped 产物继续复用现有 markdown 规则，而不是改写 markdown 源样式

## 3. 扩展构建与验证契约

- [x] 3.1 调整构建脚本的数据模型与写出逻辑，使其同时产出 Primer scope、scoped scope 和一组 `auto*` 产物
- [x] 3.2 优先为 `auto.css` 建立 artifacts 与验证报告闭环，再按同一模型扩展 `auto-dimmed.css` 等产物
- [x] 3.3 扩展 `artifacts/` 与验证报告，让 full/slim 对照能够覆盖新的 scope 维度
- [x] 3.4 为每个主题准备一句简短说明，作为 README 和选择界面的文案来源
- [x] 3.5 更新 README、`artifacts/README.md`、`package.json` 导出与消费说明

## 4. 验证变更边界

- [x] 4.1 用 OpenSpec 校验新增 proposal/design/spec/tasks 结构是否合法
- [x] 4.2 在实现阶段前确认旧的 `github-markdown-*.css` 是否完全退出主发布面，并在文档中说明迁移方式
