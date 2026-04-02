<div align="center">

# @tixxin/nuxt-theme-engine

**基于 Nuxt 4 Layers 的高性能、类型安全自定义主题引擎**

[![npm version](https://img.shields.io/npm/v/@tixxin/nuxt-theme-engine.svg)](https://npmjs.com/package/@tixxin/nuxt-theme-engine)
[![Nuxt 4 Compatible](https://img.shields.io/badge/Nuxt-4.x-00C58E.svg)](https://nuxt.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## 简介

`@tixxin/nuxt-theme-engine` 是一个面向 Nuxt 4 的通用主题管理模块。它利用 Nuxt Layers 与组件自动导入能力，实现运行时切换主题组件，同时保留良好的性能、类型安全和可维护性。

如果你的项目不仅需要换色，还需要在运行时切换不同主题下的布局结构、组件实现与样式体系，这个模块就是为此设计的。

## 核心特性

- **高性能**：采用构建时前缀化和运行时动态分发，减少运行时查找成本。
- **按需加载**：支持静态异步映射，未激活主题的组件不进入初始包。
- **类型安全**：基于组件契约自动生成类型声明。
- **样式解耦**：支持 Tailwind CSS、UnoCSS、SCSS 或纯 CSS。
- **多级继承**：支持主题 `extends` 与自动 fallback 别名。
- **调试友好**：可扩展 Nuxt DevTools 面板查看主题状态和变量覆盖。

## 快速开始

### 1. 安装

```bash
npm install @tixxin/nuxt-theme-engine
```

### 2. 配置

```ts
export default defineNuxtConfig({
  modules: ['@tixxin/nuxt-theme-engine'],
  themeEngine: {
    themesDir: '~/themes',
    defaultTheme: 'nexus',
    lazyLoadThemes: true,
    cookieKey: 'theme-pref'
  }
})
```

### 3. 使用

```vue
<template>
  <ThemeComponent name="PostList" :posts="postsData" />
</template>
```

## 文档

- [用户使用指南](./用户使用指南.md)
- [架构与目录结构说明](./架构与目录结构说明.md)
- [Nuxt 4 自定义主题系统 V2 需求文档](./Nuxt4-自定义主题系统-V2-需求文档.md)
- [NPM 发布指南](./NPM-发布指南.md)

## 贡献

欢迎通过 Issue 和 Pull Request 参与改进。

本地开发：

1. `git clone https://github.com/tixxin/nuxt-theme-engine.git`
2. `pnpm install`
3. `pnpm dev`

## License

[MIT](./LICENSE) License
