# NPM 发布指南：@tixxin/nuxt-theme-engine

本文档说明如何将 `@tixxin/nuxt-theme-engine` 及其相关包（如 `@tixxin/theme-contracts`）发布到 NPM 仓库，以便其他项目可以通过 `npm install` 引入并使用。

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

## 3. 发布流程

### 3.1 登录 NPM
如尚未登录：

```bash
npm login
```

### 3.2 发布包
在每个需要发布的包目录内执行发布命令：

```bash
cd packages/theme-contracts
npm publish --access public

cd ../nuxt-theme-engine
npm publish --access public
```

如果包名包含 scope，例如 `@tixxin/`，首次发布时必须带上 `--access public`，否则 NPM 会默认按私有包处理。

## 4. 自动化发布

建议使用 GitHub Actions 搭配 Changesets 或 Release-it 实现自动化发布流程：

1. 自动生成 changelog 并更新版本号。
2. 在 CI 中执行构建。
3. 在 CI 中执行测试。
4. 当代码合并到主分支且版本号变更后，自动执行 `npm publish`。

## 5. 常见问题

- **包名冲突**：若 `@tixxin` scope 已被占用，需要更换 scope 或包名。
- **构建产物缺失**：检查 `files` 字段是否正确包含 `dist`。
- **依赖错误**：运行时依赖放入 `dependencies`，开发依赖放入 `devDependencies`。

## 6. 在其他项目中使用

发布成功后，其他 Nuxt 4 项目可直接安装：

```bash
npm install @tixxin/nuxt-theme-engine @tixxin/theme-contracts
```

然后在 `nuxt.config.ts` 中注册模块：

```ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    // 你的配置
  }
})
```
