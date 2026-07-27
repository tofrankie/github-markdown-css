## 1. 收敛发布产物边界

- [x] 1.1 调整构建产物结构，让 `dist/` 只输出最终发布的 `github-markdown-*.css`
- [x] 1.2 更新 `package.json` 导出和 README，移除对 `base`、`themes`、`bundles`、`slim` 等内部路径的 npm 消费说明
- [x] 1.3 确认每个发布文件都由 `base + theme + markdown` 组合而成，并保持主题命名稳定

## 2. 迁移中间资产与验证资产

- [x] 2.1 将 full/slim 中间资产迁移到 `artifacts/` 下的稳定目录结构
- [x] 2.2 将对照页面、报告等验证产物迁移到 `artifacts/`，保留 `scripts/fixtures/markdown-fixture.html` 作为模板输入
- [x] 2.3 更新构建与验证流程，确保上游依赖升级时可以直接使用该目录做差异对照

## 3. 增加显式配置钩子

- [x] 3.1 为额外 markdown token 名单增加一个或多个自定义 JSON 文件钩子，并在合并后去重再进入瘦身流程
- [x] 3.2 为 `--fontStack-sansSerif` 等自定义来源增加一个或多个 SCSS 文件钩子，并参与最终构建与验证
- [x] 3.3 将上述配置集中放在构建入口附近，保持一眼可见、易修改并附带简短注释

## 4. 拆分脚本并回归验证

- [x] 4.1 将构建与验证逻辑拆分到 `scripts/utils/`，让 `build-css.mjs` 与 `validate-css.mjs` 只保留主流程编排
- [x] 4.2 保留并验证现有瘦身流程：markdown token 提取、来源分桶、同源依赖闭包、CSS 过滤
- [x] 4.3 运行构建、验证、lint 与 publint，确认新的目录结构、发布面、配置钩子和验证资产全部通过检查
