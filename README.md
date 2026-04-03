# @tixxin/nuxt-theme-engine

A Nuxt 4 theme engine with layered themes, typed contracts, and runtime theme switching.

## Features

- **Layered Themes** -- Each theme is a self-contained directory with `theme.json`, components, and CSS. Themes can extend other themes via `extends` for component inheritance and fallback.
- **Typed Contracts** -- Shared component props are defined in `@tixxin/theme-contracts`. Adding a new theme only requires implementing the contract interfaces.
- **Runtime Switching** -- `useThemeEngine()` composable for switching themes at runtime with cookie/localStorage persistence. No page reload needed.
- **Build-time Alias Generation** -- Each theme component gets a unique prefixed alias (e.g. `AuroraPostList`) and a dynamic loader, enabling both eager and lazy loading strategies.
- **CSS Variable Governance** -- Themes declare `--theme-*` CSS variables scoped under `[data-theme="..."]`. The engine validates required variables at build time.
- **`<ThemeComponent>` Distribution** -- A single component that resolves and renders theme-specific implementations by contract name, with named slot support for multi-column layouts.
- **Theme-specific Config** -- `useThemeConfig()` provides per-theme KV storage isolated by theme name, persisted to localStorage and cookies.
- **Nuxt DevTools Integration** -- Custom panel for inspecting registered themes, component mappings, and CSS variable coverage.

## Quick Start

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

## Theme Structure

```
themes/my-theme/
  theme.json              # name, label, extends, description
  app/
    assets/
      theme.css           # CSS variables under [data-theme="my-theme"]
      layout.css           # Layout-specific styles
    components/
      HomeLayout.vue       # Layout container with named slots
      PostList.vue          # Article list
      ...
```

## Available Contracts

| Contract | Props Interface | Description |
|---|---|---|
| `HomeLayout` | `HomeLayoutProps` | Page layout container |
| `PostList` | `PostListProps` | Article list |
| `PostDetail` | `PostDetailProps` | Article detail |
| `SidebarNav` | `SidebarNavProps` | Navigation (sidebar or top bar) |
| `SiteStats` | `SiteStatsProps` | Site statistics widget |
| `SubscribeCard` | `SubscribeCardProps` | Email subscription card |
| `BlogFooter` | `BlogFooterProps` | Footer bar |

## Playground

The `playground/` directory contains a working Nuxt app with four example themes:

| Theme | Layout | Description |
|---|---|---|
| `base` | Single column | Foundational fallback theme |
| `aurora` | Single column | Inherits base, overrides PostList with card style |
| `tix-three-column` | Three columns | Replicates tix.xin layout, no browser scrollbar |
| `tix-classic` | Two columns + top nav | Extends tix-three-column, classic blog layout |

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

## Development

```bash
pnpm dev           # Start playground dev server
pnpm dev:prepare   # Generate .nuxt types
pnpm typecheck     # Type check module + playground
pnpm build         # Build contracts + module
```

## Monorepo Structure

```
nuxt-theme-engine/
  src/                    # Nuxt module source
    module.ts             # Module entry
    runtime/              # Composables, components, plugins
    utils/                # Build-time utilities
  packages/
    theme-contracts/      # @tixxin/theme-contracts
  playground/             # Example Nuxt app
    themes/               # Example themes
  docs/                   # Documentation
```

## License

[MIT](./LICENSE)
