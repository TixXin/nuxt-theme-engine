# @tixxin/nuxt-theme-engine

基于 Nuxt 4 的主题引擎，支持分层主题、类型化契约和运行时主题切换。

## 特性

- **分层主题** -- 每个主题是独立目录，包含 `theme.json`、组件和 CSS。通过 `extends` 实现主题继承与组件回退。
- **类型化契约** -- 引擎支持通过 `contractsEntry` / `contractsImportId` 接入自定义契约；仓库内的 `@tixxin/theme-contracts` 只是默认博客示例契约。
- **运行时切换** -- `useThemeEngine()` 组合式函数支持运行时切换主题，自动持久化到 Cookie/localStorage，无需刷新页面。
- **构建时别名生成** -- 每个主题组件生成唯一前缀别名（如 `AuroraPostList`）和动态加载器，支持同步与懒加载两种策略。
- **CSS 变量治理** -- 主题在 `[data-theme="..."]` 作用域下声明 `--theme-*` 变量，引擎在构建时校验必需变量。
- **`<ThemeComponent>` 分发** -- 单一组件按契约名解析并渲染主题实现，支持 named slot 多栏布局。
- **主题专属配置** -- `useThemeConfig()` 提供按主题隔离的 KV 存储，自动持久化到 localStorage 和 Cookie。
- **Nuxt DevTools 集成** -- 自定义面板，可查看已注册主题、组件映射和 CSS 变量覆盖情况。

## 快速开始

```bash
pnpm add @tixxin/nuxt-theme-engine
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    themesDir: './themes',
    defaultTheme: 'base',
    cookieKey: 'site-theme',
    lazyLoadThemes: true,
    requiredCssVars: ['--theme-bg', '--theme-text', '--theme-accent', '--theme-muted'],
    contractsEntry: '@tixxin/theme-contracts',
    contractsImportId: '@tixxin/theme-contracts'
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

## 主题目录结构

```
themes/my-theme/
  theme.json              # name, label, extends, description
  app/
    assets/
      theme.css           # [data-theme="my-theme"] 下的 CSS 变量
      layout.css          # 布局样式
    components/
      HomeLayout.vue      # 布局容器（支持 named slots）
      PostList.vue        # 文章列表
      ...
```

## 可用契约

默认仓库内置了一套博客场景契约，定义在 `packages/theme-contracts` 中。它是**默认/示例契约**，不是所有项目都必须共用的唯一标准。

| 契约名 | Props 接口 | 说明 |
|---|---|---|
| `HomeLayout` | `HomeLayoutProps` | 页面布局容器 |
| `PostList` | `PostListProps` | 文章列表 |
| `PostDetail` | `PostDetailProps` | 文章详情 |
| `SidebarNav` | `SidebarNavProps` | 导航栏（侧栏或顶栏） |
| `SiteStats` | `SiteStatsProps` | 站点统计小部件 |
| `SubscribeCard` | `SubscribeCardProps` | 邮件订阅卡片 |
| `BlogFooter` | `BlogFooterProps` | 底部栏 |

## 自定义契约

如果你的项目不是博客场景，可以提供自己的契约入口文件或独立 npm 包。

### 方式 1：使用本地契约文件

```ts
// nuxt.config.ts
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

### 方式 2：使用你自己的契约包

```ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    contractsEntry: '@your-scope/theme-contracts',
    contractsImportId: '@your-scope/theme-contracts'
  }
})
```

你的契约入口需要导出：

- `ThemeComponentContracts`
- `themeContractNames`
- 可选的各类 Props / 数据接口

## Playground

`playground/` 目录包含一个可运行的 Nuxt 应用，内含四个示例主题：

| 主题 | 布局 | 说明 |
|---|---|---|
| `base` | 单栏 | 基础回退主题 |
| `aurora` | 单栏 | 继承 base，以卡片风格重写 PostList |
| `tix-three-column` | 三栏 | 复刻 tix.xin 布局，浏览器无滚动条 |
| `tix-classic` | 双栏 + 顶部导航 | 继承三栏主题，经典博客布局 |

```bash
pnpm install
pnpm dev
# 打开 http://localhost:3000
```

## 开发命令

```bash
pnpm dev           # 启动 playground 开发服务器
pnpm dev:prepare   # 生成 .nuxt 类型声明
pnpm typecheck     # 类型检查模块 + playground
pnpm build         # 构建契约包 + 模块
```

## 仓库结构

```
nuxt-theme-engine/
  src/                    # Nuxt 模块源码
    module.ts             # 模块入口
    runtime/              # 组合式函数、组件、插件
    utils/                # 构建时工具
  packages/
    theme-contracts/      # @tixxin/theme-contracts 契约包
  playground/             # 示例 Nuxt 应用
    themes/               # 示例主题
  docs/                   # 文档
```

## 许可证

[MIT](./LICENSE)
