## Context

当前仓库的主题构建能力本质上已经具备三类信息：

- token 来源
- markdown 规则入口
- light / dark / auto 主题组合

真正限制发布设计的，不是构建能力本身，而是历史导出结构把最终消费面组织成了“Primer scope”与“`.markdown-body` scope”。这种组织方式更接近内部实现，而不是使用方心里的问题。

使用方真正关心的是：

- 我是在普通网页里用，还是在 Primer 环境里用
- 我是在 VS Code WebView 里用，还是在其他带宿主 selector 的环境里用
- 当前主题是由系统媒体查询决定，还是由宿主 selector 决定

因此，这次重构不再把“保留现有导入方式”作为前提，而是重新定义发布面的主轴：最终 CSS 应该按目标宿主组织，而不是按历史作用域组织。

## NPM 产物总览

第一阶段希望用户一眼就能理解 npm 发布面长什么样，可以先收敛成这一条路径规则：

```text
@tofrankie/github-markdown-css[/<group>]/<theme>.css
```

第一阶段的两个维度分别是：

- `group`：默认 `generic`、`pure`、`primer`、`vscode`
- `theme`：`light`、`dark`、`auto`

额外规则：

- 省略 `group` 时，默认表示 `generic`
- `pure` 是独立导出分组，专门表示“只有规则、没有 token 定义”

也就是第一阶段的 npm 产物会落在下面这 10 个路径中：

### `generic`

- `@tofrankie/github-markdown-css/light.css`
- `@tofrankie/github-markdown-css/dark.css`
- `@tofrankie/github-markdown-css/auto.css`

### `pure`

- `@tofrankie/github-markdown-css/pure.css`

### `primer`

- `@tofrankie/github-markdown-css/primer/light.css`
- `@tofrankie/github-markdown-css/primer/dark.css`
- `@tofrankie/github-markdown-css/primer/auto.css`

### `vscode`

- `@tofrankie/github-markdown-css/vscode/light.css`
- `@tofrankie/github-markdown-css/vscode/dark.css`
- `@tofrankie/github-markdown-css/vscode/auto.css`

为了让这 10 个文件不显得太散，可以再压成下面这张内容摘要表：

| group          | `light.css`                                                                          | `dark.css`                                                                          | `auto.css`                                                                                                |
| -------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 默认 `generic` | `base definitions + light theme definitions + markdown rules`                        | `base definitions + dark theme definitions + markdown rules`                        | `base definitions + auto 机制所需的 light/dark theme definitions + markdown rules`                        |
| `primer`       | `base definitions + light theme definitions + markdown rules，挂到 Primer selector`  | `base definitions + dark theme definitions + markdown rules，挂到 Primer selector`  | `base definitions + auto 机制所需的 light/dark theme definitions + markdown rules，挂到 Primer selector`  |
| `vscode`       | `base definitions + light theme definitions + markdown rules，挂到 VS Code selector` | `base definitions + dark theme definitions + markdown rules，挂到 VS Code selector` | `base definitions + auto 机制所需的 light/dark theme definitions + markdown rules，挂到 VS Code selector` |

`pure` 单独说明：

- `@tofrankie/github-markdown-css/pure.css`
  只包含 markdown 规则和 `var(--token)` 引用
  不包含任何 token 定义
  不区分 `light` / `dark` / `auto`
  主题完全由宿主自身提供的 token definitions 决定

一眼判断时可以只记住下面这两句：

- 先选导出分组：默认 `generic` / `pure` / `primer` / `vscode`
- 再选主题：`light` / `dark` / `auto`

## Goals / Non-Goals

**Goals:**

- 将最终发布面重构为按目标宿主组织，而不是按内部作用域组织
- 定义统一的导出分组模型，描述 selector 语义、拼接策略和 `auto*` 语义
- 提供至少三类一等目标：`generic`、`primer`、`vscode`
- 提供默认 `generic`、`pure`、`primer`、`vscode` 四类公开导出分组
- 为需要自带 token 定义的导出分组提供单主题与 `auto*` 两类主题文件
- 在本次重构中同时提供 SCSS 组合入口，支持下游在构建期按导出分组组合
- 第一阶段只要求跑通 `light`、`dark`、`auto`，其他颜色主题与扩展 `auto*` 组合延后
- 让目录结构、文件命名和验证规则都围绕公开导出分组展开
- 让 README 的核心入口变成“按宿主选择”，而不是“先理解内部 scope 再选择”

**Non-Goals:**

- 不在本次引入运行时 JavaScript API
- 不在第一版同时覆盖所有宿主长尾变体
- 不在第一版同时覆盖所有颜色主题与扩展自动组合
- 不承诺兼容现有导入路径、旧目录层级或旧命名规则

## Decisions

### 决策一：发布面改为按导出分组组织，而不是按旧 scope 组织

新的公开发布面不再把 `dist/*` 和 `dist/primer/*` 视为核心概念，而是把导出分组视为一级概念。每个导出分组表达一个完整消费场景，而不是“某种内部作用域变体”。

建议的心智模型：

- `generic`：普通网页或任意自定义容器
- `primer`：已接入 Primer 主题 selector 语义的环境
- `vscode`：由 `data-vscode-theme-kind` 控制主题的环境

备选方案：

- 继续以 scope-first 为主，再叠加 host adapter
  这样会把“宿主选择”降级成附加层，使用方仍然要先理解内部实现语义。

### 决策二：用统一的导出分组描述三件事

每个导出分组至少需要统一描述三类信息：

- selector strategy：light / dark / auto 如何挂接 selector
- composition strategy：`base`、`theme`、`markdown` 如何直接拼接成最终产物
- output strategy：要输出哪些主题文件、目录层级和命名规则

这样 host adapter 就不再是特殊机制，而只是导出分组体系里的一个实例。`primer` 和默认 `generic` 也被视为导出分组，而不是“默认基础层 + 特殊扩展层”。

备选方案：

- 继续拆成“scoped 规则”“primer 规则”“host adapter 规则”三套并列系统
  缺点是长期会出现重复配置和重复验证逻辑。

### 决策三：`pure` 是独立导出分组，不是宿主分组下的子模式

`pure` 不是把 CSS 变量替换成静态值，而是只移除 token 定义，保留规则中的 `var(--token)` 引用。

各导出分组的职责分别是：

- 默认 `generic`：输出 `base token definitions + theme token definitions + markdown rules`
- `primer`：输出 `base token definitions + theme token definitions + markdown rules`，并挂到 Primer selector
- `vscode`：输出 `base token definitions + theme token definitions + markdown rules`，并挂到 VS Code selector
- `pure`：只输出 markdown 规则和 `var(--token)` 引用，不输出 `base` 或 `theme` 的 token 定义，要求宿主自行提供对应 token

因此，`pure` 适合已经拥有 Primer 或自定义 token 体系的宿主，可以避免重复注入变量定义；其他三个导出分组适合希望直接引入完整主题资产的场景。

默认 `generic`、`primer`、`vscode` 都要覆盖 `light`、`dark`、`auto` 三类主题文件；而 `pure` 只暴露单个 `pure.css`。

备选方案：

- 把 `pure` 继续挂在 `generic`、`primer` 或 `vscode` 下面
  这样会让公开路径和心智模型都更绕，也会错误暗示 `pure` 继承这些宿主的 token 定义语义。

### 导出矩阵

为了避免概念歧义，第一阶段可以先把公开导出分组理解成下面这个矩阵：

| group          | `light.css`                                                      | `dark.css`                                                   | `auto.css`                                                                         |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 默认 `generic` | `base definitions + light theme definitions + markdown rules`    | `base definitions + dark theme definitions + markdown rules` | `base definitions + auto 机制所需的 light/dark theme definitions + markdown rules` |
| `pure`         | colspan=3: `pure.css = markdown rules + var(--token) references` |

这里需要特别注意：

- `pure` 不是 `theme + markdown`
- 因为 `theme` 通常就包含 token definition blocks
- `pure` 的本质是“保留规则和变量引用，移除变量定义”

### 决策四：同时暴露最终 CSS 发布面与 SCSS 组合入口

这次 change 不只提供最终 CSS 文件，还要同时提供 SCSS composition entry，原因是两者解决的问题不同：

- 最终 CSS 发布面：面向直接消费方，开箱即用
- SCSS 组合入口：面向需要在自己构建期重组 selector 或注入策略的下游

SCSS 入口不应该绕开导出分组模型单独存在，而应该复用同一套导出分组语义。也就是说，下游通过 SCSS 入口做自由组合时，仍然是在既有导出分组之上组合，而不是回到完全无约束的手工拼装。

建议的能力边界：

- 可以基于导出分组复用 selector strategy
- 可以选择默认 `generic`、`pure`、`primer`、`vscode` 中的一类导出语义
- 可以在构建期挂接自定义容器 selector
- 不要求下游重新实现 token 来源归属和主题矩阵算法

备选方案：

- 只先做最终 CSS，后续再补 SCSS
  这样会让本次实现时的内部模块边界偏向“只服务最终产物”，后续再补 SCSS 时容易再次改动核心生成链路。

### 决策五：`auto*` 的语义由导出分组决定

`auto*` 不再被定义成“始终等于 `prefers-color-scheme`”，而是被定义成“由当前导出分组的自动主题机制决定”。

因此：

- 默认 `generic` 下，`auto*` 可以继续基于媒体查询
- `primer` 下，`auto*` 基于 Primer 的 auto selector 语义
- `vscode` 下，`auto*` 基于宿主 light / dark selector 分支

默认 `generic`、`primer`、`vscode` 与 `pure` 都必须遵循同一套 `auto*` 语义框架，区别只在于是否包含 token 定义。

这样 `auto*` 会保留“单文件覆盖 light / dark 切换”的统一含义，但切换机制由导出分组决定，而不是全包统一强绑媒体查询。

与此同时，单主题文件也必须继续存在，并由对应导出分组的 selector strategy 表达“固定主题”的含义。例如：

- 默认 `generic` 单主题文件在容器作用域下提供固定 light 或 dark 主题
- `primer` 单主题文件使用 Primer 对应主题 selector 语义
- `vscode` 单主题文件使用 VS Code 对应 light 或 dark selector 语义，而不是退化成媒体查询

另外，固定主题文件在 `@media (prefers-color-scheme: dark)` 条件下也要继续定义该固定主题自己的变量，而不是省略该分支。这样即使运行环境命中 dark 媒体条件，固定主题文件仍然会稳定落回同一套 token，而不会因为分支缺失而暴露出其他变量来源。

备选方案：

- 让所有导出分组的 `auto*` 都保留媒体查询
  这会让宿主 selector 型场景重新回到错误模型。

### 决策六：最终产物直接使用 `base + theme + markdown` 拼接，而不再合并 token 容器

本次 change 明确不再沿用“把 token 收敛进统一 `:root {}` 或统一容器块”的做法。生成链路的默认原则改为：

1. 读取 `base`
2. 读取当前主题对应的 `theme`
3. 拼接 `markdown`
4. 按导出分组的 selector strategy 包装最终结构

也就是说，系统不再试图把多处 token 定义改写成一个新的聚合 token 容器，而是保留 `base` 和 `theme` 的原始分层，只在最终发布阶段按导出分组语义拼接。

这样做的好处是：

- 更接近上游 Primer token 的原始结构
- 避免重组 token 容器带来的额外变量漂移
- 让默认 `generic`、`primer`、`vscode`、`pure` 和 SCSS 入口都可以共享同一条拼接链路

备选方案：

- 继续把 token 合并到新的 `:root {}` 或统一容器块
  这样会继续保留旧的重组复杂度，也更容易让 fixed theme、`pure` 和 SCSS 入口之间出现不一致。

### 决策七：不同导出分组可以拥有不同的 selector 语义

不同宿主不应被强行压成统一 selector 模型。

- `generic` 适合显式容器作用域，例如 `.markdown-body`
- `primer` 适合复用 Primer 自身 selector 和变量语义
- `vscode` 适合以宿主 selector 为顶层作用域，再落到 markdown 容器

这意味着“是否必须先收敛到 `.markdown-body` 再做二次包裹”不再是固定前提。某些导出分组可以直接从更接近最终形态的 `base + theme + markdown` 拼接结构生成产物。

备选方案：

- 所有导出分组统一先生成 `.markdown-body` scoped 中间产物再派生
  好处是复用多，但它把内部实现限制错误地上升成架构约束。

### 决策八：验证体系也改为按导出分组组织，并区分完整主题、`pure` 与 SCSS 入口

验证不再以“primer vs scoped”作为核心维度，而改为“每个导出分组是否生成了结构正确的最终产物”。

每个导出分组至少需要校验：

- 主题文件是否完整生成
- 单主题文件是否正确表达固定主题且落在对应导出分组 selector 下
- 固定主题文件在 `prefers-color-scheme: dark` 分支下是否仍重复定义同一套固定主题变量
- `base + theme + markdown` 是否按既定顺序直接拼接，而不是再次被合并为新的统一 token 容器
- light / dark / auto 语义是否符合该导出分组定义
- markdown 规则是否落在该导出分组预期的 selector 结构中
- `pure.css` 是否没有输出 token 定义，但仍保留所有必要的 `var(--token)` 引用
- 默认 `generic`、`primer`、`vscode` 是否分别包含对应场景所需的完整 token 定义
- SCSS 入口是否能稳定映射到对应导出分组，而不是暴露一组脱离模型的零散源码文件

### 决策九：主题矩阵分阶段推进，第一阶段只交付 light / dark / auto

这次重构本身已经包含导出分组、selector strategy 和目录重组几个维度。如果第一阶段同时覆盖全部颜色主题，会把验证矩阵和调试成本放大过快。

因此第一阶段先只承诺：

- `light`
- `dark`
- `auto`

其中：

- `light` 与 `dark` 代表固定主题路径
- `auto` 代表每个导出分组自己定义的自动切换路径

其他颜色主题，例如 colorblind、tritanopia、high-contrast 及其扩展 `auto*` 组合，留到 target-first 结构稳定后再补齐。

备选方案：

- 第一阶段直接迁移全部主题矩阵
  这样可以一次完成功能迁移，但会显著增加第一版的验证面和排错成本。

这会让未来新增宿主时，只需要补导出分组配置和对应断言，而不是继续扩展一组隐式特殊规则。

## Risks / Trade-offs

- [重构幅度明显变大] → 接受这次 change 是发布面重构，而不是增量补丁
- [旧文档和旧路径会整体失效] → 在 README 和 change 文档中明确这是一次公开 API 重整
- [导出分组抽象过早] → 第一版只内建少量稳定分组，用真实场景反推模型边界
- [不同分组生成路径变复杂] → 把复杂度收敛在分组模型和直接拼接链路，而不是散落在发布脚本分支里
- [`pure` 产物被误认为可独立运行] → 在文件命名、README 和验证报告中明确它依赖宿主提供 token 定义
- [第一版主题范围过大] → 第一阶段只交付 `light`、`dark`、`auto`，等结构稳定后再扩展其他主题
- [SCSS 入口过于自由导致模型失真] → 让 SCSS 入口复用导出分组语义，而不是提供完全脱离约束的裸源码拼装

## Examples

下面这些示例不是最终文件名定稿，而是用于说明方案的直观心智模型。

额外约束：

- 允许：同一作用域出现多个来源块
- 不允许：同一个 token 在最终产物里被重复定义

也就是说，`base + theme + markdown` 可以不合并成单个作用域块，但必须去重 token 定义。

### Example 1: 默认 generic 的完整主题单主题产物

使用方希望直接引入一个可独立工作的浅色主题文件：

```css
@import '@tofrankie/github-markdown-css/light.css';
```

它对应的结构语义类似：

```css
.markdown-body {
  --base-size-16: 1rem;
}

.markdown-body {
  --fgColor-default: #1f2328;
}

.markdown-body {
  color: var(--fgColor-default);
}
```

也就是：

- `base` 与 `theme` 定义按顺序直接拼接进入产物
- 即使存在多个同作用域块，也不应重复定义同一个 token
- markdown 规则由产物提供
- 固定主题通过默认 `generic` 的容器作用域表达

### Example 2: `pure.css` 产物

使用方已经在宿主里提供了主题 token，只想复用 markdown 规则：

```css
@import '@tofrankie/github-markdown-css/pure.css';
```

它对应的结构语义类似：

```css
.markdown-body {
  color: var(--fgColor-default);
}
```

也就是：

- 仍然保留 `var(--fgColor-default)`
- 不再输出 `--fgColor-default: ...`
- 由宿主自己决定这些 token 的来源

### Example 2.1: `pure.css` 表示什么

```text
pure.css
  = markdown rules + var(--token) 引用
  = 不包含 token definitions
  = 不区分 light dark auto
  = 主题来源完全由宿主自己提供的 token definitions 决定
```

它们都不包含下面这类 token definition blocks：

```css
.markdown-body {
  --fgColor-default: #1f2328;
}
```

但会保留下面这类规则引用：

```css
.markdown-body {
  color: var(--fgColor-default);
}
```

### Example 3: `vscode` 的完整主题单主题产物

使用方在 VS Code WebView 中固定使用浅色主题：

```css
@import '@tofrankie/github-markdown-css/vscode/light.css';
```

它对应的结构语义类似：

```css
body[data-vscode-theme-kind='vscode-light'] .markdown-body {
  --fgColor-default: #1f2328;
}

@media (prefers-color-scheme: dark) {
  body[data-vscode-theme-kind='vscode-light'] .markdown-body {
    --fgColor-default: #1f2328;
  }
}

body[data-vscode-theme-kind='vscode-light'] .markdown-body {
  color: var(--fgColor-default);
}
```

也就是：

- 单主题产物仍然存在
- 它不是 generic CSS 的简单复制
- 它必须落在 `vscode` 这组导出语义下
- 即使命中 dark 媒体条件，也会继续声明同一套 light 主题变量

### Example 4: `primer` 的完整主题产物

使用方希望直接使用带 Primer selector 语义和 token 定义的完整主题文件：

```css
@import '@tofrankie/github-markdown-css/primer/light.css';
```

它对应的结构语义类似：

```css
[data-color-mode='light'][data-light-theme='light'],
[data-color-mode='auto'][data-light-theme='light'] {
  --fgColor-default: #1f2328;
}

@media (prefers-color-scheme: dark) {
  [data-color-mode='auto'][data-dark-theme='light'] {
    --fgColor-default: #1f2328;
  }
}
```

也就是：

- `primer/light.css` 的 token selector 语义应与 [theme-example.md](/Users/frankie/Web/Git/github-markdown-css/proposals/theme-example.md:3) 保持一致
- 主题 token 定义挂在 Primer 自身 selector 上，而不是挂在 `.markdown-body` 上
- markdown 规则本身再单独使用这些 token

### Example 4.1: `primer/auto.css` 的完整主题产物

使用方希望直接使用带 Primer `auto` 语义和 token 定义的完整主题文件：

```css
@import '@tofrankie/github-markdown-css/primer/auto.css';
```

它对应的结构语义类似：

```css
[data-color-mode='light'][data-light-theme='light'] {
  --fgColor-default: #1f2328;
}

[data-color-mode='auto'][data-light-theme='light'] {
  @media (prefers-color-scheme: light) {
    --fgColor-default: #1f2328;
  }
}

[data-color-mode='dark'][data-dark-theme='dark'] {
  --fgColor-default: #f0f6fc;
}

[data-color-mode='auto'][data-dark-theme='dark'] {
  @media (prefers-color-scheme: dark) {
    --fgColor-default: #f0f6fc;
  }
}
```

也就是：

- `primer/auto.css` 的 token selector 语义应与 [theme-example.md](/Users/frankie/Web/Git/github-markdown-css/proposals/theme-example.md:37) 保持一致
- light token 需要同时覆盖 fixed light 与 auto light
- dark token 需要同时覆盖 fixed dark 与 auto dark
- markdown 规则本身再单独使用这些 token

## SCSS 使用设计

SCSS 入口建议明确拆成两类能力：

- `render-rules()`
  只输出 markdown 规则和 `var(--token)` 引用
- `render-theme-tokens()`
  只输出 token 定义，并负责主题 selector / 媒体分支

这样可以和前面的设计原则保持一致：

- markdown 规则本身不带主题 selector
- 只有 token 定义才带主题 selector
- `pure.css` 本质上就是 `render-rules()` 的发布产物
- SCSS 输入统一采用显式分支声明，不再提供隐式简写

### 显式分支结构

`render-theme-tokens()` 的推荐输入形状统一为显式 `modes`：

```scss
@include markdown.render-theme-tokens(
  (
    container: '.markdown-body',
    modes: (
      light: (
        selectors: ('.theme-light'),
        tokens: 'light',
      ),
      dark: (
        selectors: ('.theme-dark'),
        tokens: 'dark',
      ),
    ),
  )
);
```

每个 mode 至少显式描述：

- `selectors`
- `tokens`

可选描述：

- `media`

这样单色、双色、宿主 selector、媒体查询分支都使用同一种结构，避免一部分场景用简写、一部分场景用展开写法。

### Example 5: `pure.css` 对应的 SCSS 入口

下游希望只拿规则，并把规则挂到自定义容器：

```scss
@use '@tofrankie/github-markdown-css/scss' as markdown;

@include markdown.render-rules(
  (
    container: '.article-body',
  )
);
```

它对应的结构语义类似：

```css
.article-body {
  color: var(--fgColor-default);
}
```

也就是：

- 这里只输出规则
- 不输出 token 定义
- 也不输出主题 selector

### Example 6: 单色主题的 SCSS 用法

下游希望在 VS Code WebView 中固定使用浅色主题：

```scss
@use '@tofrankie/github-markdown-css/scss' as markdown;

@include markdown.render-theme-tokens(
  (
    container: '.markdown-body',
    modes: (
      light: (
        selectors: ("body[data-vscode-theme-kind='vscode-light']"),
        tokens: 'light',
      ),
    ),
  )
);

@include markdown.render-rules(
  (
    container: '.markdown-body',
  )
);
```

它对应的结构语义类似：

```css
.markdown-body {
  --base-size-16: 1rem;
}

body[data-vscode-theme-kind='vscode-light'] .markdown-body {
  --fgColor-default: #1f2328;
}

@media (prefers-color-scheme: dark) {
  body[data-vscode-theme-kind='vscode-light'] .markdown-body {
    --fgColor-default: #1f2328;
  }
}

.markdown-body {
  color: var(--fgColor-default);
}
```

也就是：

- 单色主题 = 一次 token 定义入口 + 一次规则入口
- 主题无关 token 只在公共作用域定义一次
- 主题相关 token 才进入 `vscode` selector

### Example 7: 双色自动主题的 SCSS 用法

下游希望在 VS Code WebView 里复用 `vscode` 的自动主题语义：

```scss
@use '@tofrankie/github-markdown-css/scss' as markdown;

@include markdown.render-theme-tokens(
  (
    container: '.markdown-body',
    modes: (
      light: (
        selectors: ("body[data-vscode-theme-kind='vscode-light']"),
        tokens: 'light',
      ),
      dark: (
        selectors: ("body[data-vscode-theme-kind='vscode-dark']"),
        tokens: 'dark',
      ),
    ),
  )
);

@include markdown.render-rules(
  (
    container: '.markdown-body',
  )
);
```

它对应的结构语义类似：

```css
.markdown-body {
  --base-size-16: 1rem;
}

body[data-vscode-theme-kind='vscode-light'] .markdown-body {
  --fgColor-default: #1f2328;
}

body[data-vscode-theme-kind='vscode-dark'] .markdown-body {
  --fgColor-default: #f0f6fc;
}

.markdown-body {
  color: var(--fgColor-default);
}
```

也就是：

- 双色主题 = 一个带 light/dark 语义的 token 定义入口 + 一个共享规则入口
- 规则本身仍然只输出一份
- 真正切换的是宿主 selector 下的 token 定义

### Example 8: 非内置自定义导出分组的 SCSS 组合入口

下游希望在自己的宿主环境里定义一组非内置 selector 语义，例如：

- 宿主根节点使用 `[data-app-theme='light']` / `[data-app-theme='dark']`
- markdown 容器使用 `.doc-body`

这时可以直接通过 SCSS 入口传入自定义配置，而不必先等待 npm 里新增一个内置导出分组：

```scss
@use '@tofrankie/github-markdown-css/scss' as markdown;

@include markdown.render-theme-tokens(
  (
    container: '.doc-body',
    modes: (
      light: (
        selectors: ("[data-app-theme='light']"),
        tokens: 'light',
      ),
      dark: (
        selectors: ("[data-app-theme='dark']"),
        tokens: 'dark',
      ),
    ),
  )
);

@include markdown.render-rules(
  (
    container: '.doc-body',
  )
);
```

它对应的结构语义类似：

```css
.doc-body {
  --base-size-16: 1rem;
}

[data-app-theme='light'] .doc-body {
  --fgColor-default: #1f2328;
}

[data-app-theme='dark'] .doc-body {
  --fgColor-default: #f0f6fc;
}

.doc-body {
  color: var(--fgColor-default);
}
```

如果宿主自己提供 token 定义，那么可以只用 `render-rules()`；如果宿主希望在构建期同时生成自己的主题 token，则再加上 `render-theme-tokens()`。无论简单场景还是复杂场景，都统一使用显式 `modes` 结构来描述 token 分支。

## Migration Plan

1. 先定义导出分组数据模型和目标目录结构
2. 用默认 `generic`、`pure`、`primer`、`vscode` 跑通完整生成链路
3. 更新验证逻辑和文档入口，使它们按导出分组组织
4. 在实现落地时再决定是否保留少量兼容别名，但这不属于本 change 的设计前提

回滚方式：

- 如果当前按导出分组的设计证明过重，可以回退到 scope-first + adapter 方案，但那将是新的设计决策，不是本方案的默认路径

## Open Questions

- 默认 `generic` 是否应继续固定使用 `.markdown-body`，还是允许更抽象的默认容器命名
- `primer` 是否需要同时暴露“复用上层变量”和“自带完整 token”两种模式
- 导出分组的公开导入路径是否应该完全镜像分组 key
- 其他颜色主题未来是沿用旧主题 key 体系，还是在 target-first 之后重新整理分组与命名
