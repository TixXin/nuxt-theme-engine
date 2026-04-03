<div align="center">

# @tixxin/nuxt-theme-engine

**面向 Nuxt 4 的主题引擎：支持主题继承、运行时分发、类型安全契约与自定义契约入口**

[![npm version](https://img.shields.io/npm/v/@tixxin/nuxt-theme-engine.svg)](https://npmjs.com/package/@tixxin/nuxt-theme-engine)
[![Nuxt 4 Compatible](https://img.shields.io/badge/Nuxt-4.x-00C58E.svg)](https://nuxt.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

## 这个项目解决什么问题

如果你的站点不只是“换一套颜色”，而是需要在运行时切换：

- 不同主题下的布局结构
- 不同主题下的组件实现
- 不同主题下的样式体系和主题配置

那么 `@tixxin/nuxt-theme-engine` 的目标就是把这些能力从具体业务里抽离出来，变成一套可复用的 Nuxt 模块。

## 适用场景

- 博客、内容站、多主题门户
- 同一套业务模型，需要支持多套前台主题
- 需要主题继承、组件 fallback 和按需加载
- 需要在 IDE 中保留 `<ThemeComponent>` 的类型提示和 Props 校验

## 核心能力

- **分层主题**：每个主题都是独立目录，包含 `theme.json`、组件和 CSS，可通过 `extends` 继承父主题
- **运行时分发**：统一使用 `<ThemeComponent>` 按逻辑组件名渲染当前主题实现
- **构建时注册**：自动生成主题前缀别名和继承 fallback，减少运行时查找成本
- **类型安全**：基于契约自动生成类型声明，给 `name` 和 Props 提供补全与校验
- **自定义契约**：支持通过 `contractsEntry` / `contractsImportId` 接入你自己的契约入口
- **主题配置隔离**：`useThemeConfig()` 按主题维护独立展示配置
- **样式治理**：按 `[data-theme="..."]` 作用域管理 CSS 变量，并支持必需变量校验
- **调试能力**：可接入 Nuxt DevTools 查看主题、继承链和 CSS 变量覆盖情况

## 项目案例

当前使用主题引擎的项目：

- 在线预览：[https://tix.xin](https://tix.xin)
- GitHub：[TixXin/TixXinBlog](https://github.com/TixXin/TixXinBlog)



## 快速开始

```bash
pnpm add @tixxin/nuxt-theme-engine
```

默认博客契约已经内置在 `@tixxin/nuxt-theme-engine` 发布包内，消费者**不需要额外安装** `@tixxin/theme-contracts`。

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    themesDir: './themes',
    defaultTheme: 'base',
    cookieKey: 'site-theme',
    lazyLoadThemes: true,
    requiredCssVars: ['--theme-bg', '--theme-text', '--theme-accent', '--theme-muted']
  }
})
```

```vue
<template>
  <ThemeComponent name="HomeLayout">
    <template #nav>
      <ThemeComponent name="SidebarNav" :items="navItems" />
    </template>
    <template #default>
      <ThemeComponent name="PostList" :posts="posts" />
    </template>
    <template #aside>
      <ThemeComponent name="SiteStats" :stats="stats" />
    </template>
  </ThemeComponent>
</template>
```

`ThemeComponent` 在主题切换时会优先保留当前已显示的组件树，等目标主题组件实际加载完成后再原子切换，以减少异步主题组件带来的空白闪屏。

## 自定义契约

引擎本身不强绑定某一套业务契约。

模块默认会使用内置的博客示例契约，等价导入路径为 `@tixxin/nuxt-theme-engine/default-contracts`。

仓库里的 `@tixxin/theme-contracts` 现在只是**开发期/示例来源**。如果你的项目是电商、文档站、社区或其他业务，可以直接换成自己的契约入口。

### 使用本地契约文件

```ts
import { fileURLToPath } from 'node:url'

const contractsEntry = fileURLToPath(new URL('./theme-contracts/index.ts', import.meta.url))

export default defineNuxtConfig({
  alias: {
    '#theme-contracts': contractsEntry
  },
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    contractsEntry: '#theme-contracts',
    contractsImportId: '#theme-contracts'
  }
})
```

### 使用你自己的契约包

```ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    contractsEntry: '@your-scope/theme-contracts',
    contractsImportId: '@your-scope/theme-contracts'
  }
})
```

你的契约入口至少需要导出：

- `ThemeComponentContracts`
- `themeContractNames`

## 示例主题与 Playground

`playground/` 中提供了完整示例，既覆盖默认博客契约，也演示了项目内本地契约入口：

| 主题 | 布局 | 说明 |
|---|---|---|
| `base` | 单栏 | 基础回退主题 |
| `aurora` | 单栏 | 继承 `base`，以卡片风格重写列表 |
| `tix-three-column` | 三栏 | 复刻 tix.xin 风格布局，浏览器无滚动条 |
| `tix-classic` | 双栏 + 顶部导航 | 继承三栏主题，经典博客布局 |

```bash
pnpm install
pnpm dev
```

## 文档导航

- [用户使用指南](./docs/用户使用指南.md)
- [架构与目录结构说明](./docs/架构与目录结构说明.md)
- [设计提案：主题引擎架构](./docs/设计提案-主题引擎架构.md)
- [NPM 发布指南](./docs/NPM-发布指南.md)

## 开发与发布

```bash
pnpm dev           # 启动 playground
pnpm dev:prepare   # 生成 .nuxt 类型声明
pnpm typecheck     # 类型检查模块与 playground
pnpm build         # 构建主题引擎模块与内置默认契约
```

仓库结构：

```text
nuxt-theme-engine/
├── src/                     # 模块源码
├── packages/theme-contracts # 默认博客示例契约
├── playground/              # 示例应用与主题
└── docs/                    # 面向公开仓库的长期文档
```

## 贡献

欢迎通过 Issue 和 Pull Request 参与改进。开始前可先阅读：

- [贡献指南](./CONTRIBUTING.md)
- [架构与目录结构说明](./docs/架构与目录结构说明.md)

## 许可证

本项目采用 [MIT License](./LICENSE)。
这是一种宽松开源许可证，允许你在保留原始版权与许可证声明的前提下自由使用、修改、分发，甚至用于商业项目。
