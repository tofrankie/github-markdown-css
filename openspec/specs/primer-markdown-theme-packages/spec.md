## ADDED Requirements

### Requirement: 基于 Primer 源文件构建 markdown 样式

该包 MUST 基于 `@primer/css/markdown/index.scss` 生成独立的 markdown 样式文件，以确保 GitHub Markdown 展示样式可以从 Primer 官方源文件稳定复现，而不是依赖手工拷贝维护的本地样式文件。

#### Scenario: 生成 markdown 样式文件

- **WHEN** the package build runs
- **THEN** 它会生成一个从 `@primer/css/markdown/index.scss` 编译得到的独立 markdown 样式产物

#### Scenario: 保持 markdown 样式文件的单一职责

- **WHEN** a consumer imports only the markdown stylesheet artifact
- **THEN** 该产物只包含 markdown 展示规则，并依赖主题变量工作，而不会把所有主题变量都打进同一个文件

### Requirement: 重导出全部受支持的 Primer 主题包

该包 MUST 基于 `@primer/primitives/dist/css/functional/themes` 下可用的主题文件，为每个受支持的 GitHub 主题暴露一个独立 CSS 产物，以便使用方只加载所需主题，而不必连带引入无关主题变体。

#### Scenario: 主题覆盖范围跟随 Primer 可用产物

- **WHEN** the build discovers theme files in `@primer/primitives/dist/css/functional/themes`
- **THEN** 它会为发现到的每个主题文件生成对应的包内主题产物

#### Scenario: 主题产物可被独立消费

- **WHEN** a consumer imports a single exported theme artifact
- **THEN** 该产物只提供该主题对应的变量定义，且不依赖引入其他主题文件

### Requirement: 提供主题与 markdown 的组合产物

该包 MUST 提供便捷的组合包产物，将单个导出的主题与生成的 markdown 样式文件合并在一起，以便使用方通过一次 CSS 引入即可获得可直接使用的 GitHub Markdown 主题。

#### Scenario: 构建便捷组合包

- **WHEN** the package build completes
- **THEN** 它会生成同时包含单个主题产物和 markdown 样式文件的组合包产物

#### Scenario: 组合包命名对使用方保持稳定

- **WHEN** a consumer follows the documented bundle import path
- **THEN** 该路径会稳定解析到一个对应具体主题、可直接使用的组合包产物

### Requirement: 将第一阶段打包与变量裁剪优化分离

该包 MUST 将主题重导出与 markdown 打包视为第一阶段交付内容，并且 MUST NOT 以“移除未使用变量”为第一阶段完成的前置条件。

#### Scenario: 第一阶段可在不做变量裁剪的前提下完成

- **WHEN** the first implementation phase is delivered
- **THEN** 即使仍完整保留上游 Primer 主题变量，该包也可以发布 markdown、theme 和 bundle 三类产物

#### Scenario: 后续仍可继续做优化

- **WHEN** a later change introduces variable-pruning logic
- **THEN** 当前 markdown 产物与主题产物的分层结构，仍允许后续优化仅面向主题输出进行，而不必重定义整体打包模型
