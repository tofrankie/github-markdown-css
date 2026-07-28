## 1. 调整 markdown 构建入口

- [x] 1.1 新增 `src/primer-markdown-extended.scss`，并以 `@primer/css/markdown/index.scss` 作为基础组织本地扩展入口
- [x] 1.2 更新构建脚本中的 markdown 入口解析，使编译流程改为读取 `src/primer-markdown-extended.scss`
- [x] 1.3 保持现有 `dist/`、`dist/primer/` 和自动主题矩阵的输出结构不变

## 2. 明确扩展入口边界

- [x] 2.1 在构建配置或源码注释中区分“markdown 扩展入口”和“额外 token 来源钩子”的职责
- [x] 2.2 确保扩展入口示例或实现不混入全局 reset、页面级基础样式或整包 `@primer/css/base/index.scss`

## 3. 更新文档与验证

- [x] 3.1 更新 `artifacts/README.md`，说明新的 markdown 扩展入口位置、命名和适用范围
- [x] 3.2 运行现有构建与验证链路，确认 slim/full 资产、发布产物和报告在新入口下仍然成立
