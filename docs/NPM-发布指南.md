# NPM 发布指南：@tixxin/nuxt-theme-engine

本文档说明如何将 `@tixxin/nuxt-theme-engine` 及其相关包发布到 NPM 仓库。注意：默认博客契约已经内置到 `@tixxin/nuxt-theme-engine` 发布包中；`@tixxin/theme-contracts` 只是当前仓库里的开发期/示例契约来源，并不是所有使用者都必须发布和安装的统一标准契约。

## 1. 包结构规划

建议采用 Monorepo 结构，例如使用 `pnpm workspace` 管理主题引擎及其相关依赖包。

```text
tixxin-theme-system/
├── packages/
│   ├── theme-contracts/
│   │   ├── package.json
│   │   └── src/
│   └── nuxt-theme-engine/
│       ├── package.json
│       └── src/
├── package.json
└── pnpm-workspace.yaml
```

## 2. 发布前准备

### 2.1 完善 `package.json`
确保每个需要发布的包包含以下关键信息：

- `name`：唯一包名，例如 `@tixxin/nuxt-theme-engine`。
- `version`：遵循语义化版本控制。
- `main`、`module`、`types`：确保入口和类型定义路径正确。
- `exports`：限制并声明对外可用 API。
- `files`：确保发布产物包含 `dist` 等必要目录。
- `peerDependencies`：Nuxt 模块通常应将 `nuxt` 声明为 peer dependency。

### 2.2 构建产物
发布前必须先构建：

```bash
pnpm run build
```

对于 `@tixxin/nuxt-theme-engine`，通常会由 `unbuild` 生成 `dist/`，其中包含 `module.mjs`、`module.cjs`、`module.d.ts` 等文件。

## 3. 哪些包需要发布

### 3.1 `@tixxin/nuxt-theme-engine`

这是主题引擎本体，通常应该发布。

### 3.2 `@tixxin/theme-contracts`

这个包是否发布，取决于你的产品定位：

- 如果你维护的是一套博客主题体系，希望多项目复用同一组博客契约，那么可以发布它。
- 如果你的使用方会定义自己的契约入口，那么**不必**强制发布它。
- 如果你只是把它当作默认/示例契约，也可以只在仓库内保留，不对外强调必须安装。

## 4. 发布流程

### 4.1 登录 NPM
如尚未登录：

```bash
npm login
```

### 4.2 发布包
在每个需要发布的包目录内执行发布命令：

```bash
cd packages/theme-contracts
npm publish --access public

cd ../..
npm publish --access public
```

如果包名包含 scope，例如 `@tixxin/`，首次发布时必须带上 `--access public`，否则 NPM 会默认按私有包处理。

如果你只发布主题引擎本体，则只需要执行根目录的发布命令。

## 5. 在其他项目中使用

### 5.1 复用内置默认契约

```bash
npm install @tixxin/nuxt-theme-engine
```

```ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine']
})
```

如果你需要直接复用默认博客 Props 类型，可从 `@tixxin/nuxt-theme-engine/default-contracts` 导入。

### 5.2 使用你自己的契约包

```bash
npm install @tixxin/nuxt-theme-engine @your-scope/theme-contracts
```

```ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    contractsEntry: '@your-scope/theme-contracts',
    contractsImportId: '@your-scope/theme-contracts'
  }
})
```

### 5.3 使用项目内本地契约文件

```ts
export default defineNuxtConfig({
  alias: {
    '#theme-contracts': './theme-contracts/index.ts'
  },
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    contractsEntry: '#theme-contracts',
    contractsImportId: '#theme-contracts'
  }
})
```

你的契约入口应至少导出：

- `ThemeComponentContracts`
- `themeContractNames`

## 6. 自动化发布

建议使用 GitHub Actions 搭配 Changesets 或 Release-it 实现自动化发布流程：

1. 自动生成 changelog 并更新版本号。
2. 在 CI 中执行构建。
3. 在 CI 中执行测试。
4. 当代码合并到主分支且版本号变更后，自动执行 `npm publish`。

## 7. 常见问题

- **包名冲突**：若 `@tixxin` scope 已被占用，需要更换 scope 或包名。
- **构建产物缺失**：检查 `files` 字段是否正确包含 `dist`。
- **依赖错误**：发布前务必检查 `package.json` 与 `pnpm pack` 产物，确保不会把 `workspace:*` 原样带进最终 tarball。
- **是否必须发布 `@tixxin/theme-contracts`**：不必须。默认博客契约已内置在主题引擎包里。只有当你希望把自己的契约包独立发版时，才需要额外发布契约包。
