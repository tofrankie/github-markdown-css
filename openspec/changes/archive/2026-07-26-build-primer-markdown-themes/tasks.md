## 1. Build Pipeline

- [x] 1.1 Audit the current repository asset layout and decide the target `dist` directory structure for markdown, themes, and bundles
- [x] 1.2 Add `sass` and the Node build scripts needed to compile `@primer/css/markdown/index.scss` and emit CSS assets into `dist`
- [x] 1.3 Implement theme artifact generation based on the files discovered in `@primer/primitives/dist/css/functional/themes`
- [x] 1.4 Implement bundle artifact generation that combines one theme artifact with the generated markdown stylesheet

## 2. Package Exports

- [x] 2.1 Update `package.json` publish files and subpath exports for markdown, themes, and bundle artifacts
- [x] 2.2 Decide and document whether the top-level `markdown-reference.css` remains as a reference-only file or needs any compatibility/export mapping alongside the new `dist` asset path
- [x] 2.3 Keep the root JS entry minimal unless a packaging constraint requires additional metadata export

## 3. Consumer Validation

- [x] 3.1 Update the playground to consume the new package asset paths instead of relying on ad hoc local files
- [x] 3.2 Verify at least one markdown-only import path, one theme-only import path, and one bundle import path
- [x] 3.3 Confirm that the exported theme set matches the discovered upstream Primer theme files

## 4. Documentation

- [x] 4.1 Update README with the package structure, available theme types, and recommended import paths
- [x] 4.2 Document explicitly that unused CSS variable pruning is not part of this first-phase change and is reserved for a later follow-up
