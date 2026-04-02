# Nuxt 4 自定义主题系统 V2 需求文档

## 1. 背景与目标

### 1.1 V1 方案的痛点
当前项目的 V1 自定义主题系统采用了“构建时扫描生成虚拟文件映射表，运行时通过 `<component :is>` 动态导入”的实验性方案。该方案在实践中暴露了以下问题：

1. **性能开销与包体积**：运行时动态解析增加了开销，且全量打包所有主题组件会导致 bundle 体积膨胀。
2. **开发体验不足**：HMR 在虚拟模块重新生成时存在明显延迟；IDE 无法提供准确的组件类型推导和属性补全。
3. **耦合严重**：主题引擎与博客业务逻辑深度耦合，难以抽离为通用的 npm 包。

### 1.2 V2 重构目标
彻底放弃虚拟模块，拥抱 Nuxt 4 原生能力，重新设计一套现代化、高性能、高可扩展的自定义主题系统。

1. **极致性能**：采用“构建时前缀化别名 + 运行时动态分发 + 异步按需加载”机制，控制包体积并消除运行时 fallback 查找开销。
2. **完美开发体验**：完全支持 HMR，通过组件契约与动态生成的 `.d.ts` 实现 IDE 完整的组件类型推导和 Props 补全。
3. **高度解耦**：将主题引擎抽离为独立 npm 包 `@tixxin/nuxt-theme-engine`。
4. **开发者友好**：集成 Nuxt DevTools 面板，方便调试主题状态、CSS 变量覆盖和组件继承链。

---

## 2. 核心架构设计

### 2.1 主题即 Layer
每一个主题都是一个独立的 Nuxt Layer，拥有自己的 `nuxt.config.ts`、`app/components/`、`app/assets/` 和 `theme.json`，可通过 `extends` 继承基础主题。

### 2.2 构建时前缀化与继承别名解析
在主题引擎的构建阶段，利用 Nuxt 的 `components:extend` 或等价注册能力，为每个主题目录下的组件自动生成带前缀的组件名，并处理多级继承链的 fallback：

- **细粒度注册**：逐个组件注册，避免简单 `prefix` 配置导致的目录命名异常。
- **循环继承检测**：解析 `theme.json` 的 `extends` 链时必须检测循环依赖，如 A 继承 B、B 又继承 A，则构建中止并报错。
- **继承别名生成**：若 `aurora` 缺失 `PostList.vue`，但其父主题存在该组件，引擎应自动注册 `AuroraPostList` 指向父主题实现。
- **运行时零 fallback 查找**：分发组件只需要拼接“当前主题前缀 + 组件名”即可完成渲染。

### 2.3 运行时动态分发
提供一个极轻量、类型安全的 `<ThemeComponent>` 分发组件。开发者在页面中只编写逻辑组件名，例如：

```vue
<template>
  <ThemeComponent name="PostList" :posts="postList" />
</template>
```

运行时根据当前主题状态解析为 `<AuroraPostList>`、`<NexusPostList>` 等具体实现。

### 2.4 路由与渲染模式约束
- **路由收口**：主题引擎只负责组件和样式覆盖，页面路由由主项目统一定义。主题提供的是页面级布局组件，不直接定义业务路由。
- **SSR/SPA 优先**：V2 主要面向 SSR 和 SPA。
- **SSG 限制**：若项目采用 SSG，仅支持 CSS 变量级主题切换，不建议切换组件结构，否则容易产生 hydration mismatch。

---

## 3. 组件契约与类型安全

### 3.1 契约定义
所有基础组件的 Props 接口必须抽离到独立契约层，例如 `@tixxin/theme-contracts`。所有主题都必须实现这些契约组件。

```ts
export interface PostListProps {
  posts: Post[]
  loading?: boolean
}
```

### 3.2 动态生成类型声明
构建时扫描所有契约组件，动态生成 `#build/theme-components.d.ts`，为 `<ThemeComponent>` 的 `name` 属性提供精确联合类型，如 `'PostList' | 'PostDetail' | 'HomeLayout'`。

### 3.3 类型安全的 ThemeComponent
利用 TypeScript 泛型和生成的联合类型，为 `<ThemeComponent>` 提供完善的 IDE 补全与类型校验。

```ts
const props = defineProps<{
  name: T
  props: ComponentContracts[T]
}>()
```

### 3.4 宽泛契约策略
当不同主题需要展示不同层级的业务数据时，契约不应只覆盖最小字段，而应允许合理的“宽泛契约”：

- 核心字段必须强制存在。
- 扩展字段允许定义为可选属性。
- 主项目应尽可能一次性聚合可复用的业务数据，再透传给主题组件。

例如文章对象除了 `title`、`content` 外，还可以约定可选字段 `likesCount?: number`、`commentsCount?: number`。基础主题可忽略这些字段，扩展主题可直接消费。

---

## 4. 高级主题扩展与数据流向

### 4.1 混合存储策略
为了同时兼顾类型安全和主题扩展能力，主题系统采用“强类型核心数据 + 灵活主题配置”的混合存储方案：

- **核心业务数据**：如文章、分类、用户信息、导航树，必须遵循 `@tixxin/theme-contracts` 的强类型接口，由主项目 API 或统一 composable 提供。
- **主题特有配置**：如公告文案、布局开关、侧边栏模块显示状态、主题自定义文案等，使用 KV 形式的主题配置存储。

### 4.2 独立配置原则
每个主题的 KV 配置必须按主题隔离，不做自动迁移：

- 存储层面按 `theme_name` 隔离。
- 主题切换时只读取当前主题配置。
- 若新主题没有兼容旧主题字段，由新主题自行定义并渲染自己的配置项。

这样可以避免主题之间进行复杂字段映射，降低维护成本与错误风险。

### 4.3 主题配置读写抽象
引擎内部应封装统一的主题配置接口，例如 `useThemeConfig()`，向主题组件提供类似 KV 的读取与写入能力。

```ts
const { getThemeOption, setThemeOption } = useThemeConfig()
```

该抽象只负责“主题特有展示配置”，不替代核心业务数据接口。

### 4.4 不同布局的支持方式
主题系统天然支持单栏、双栏、三栏等不同布局。原因是主题组件接管的是“组件实现”，不是简单样式皮肤：

- 只要组件契约一致，主题可以完全重写内部 DOM 结构。
- 主项目只依赖逻辑组件名，例如 `HomeLayout`、`PostList`、`PostDetail`。
- 当前主题决定最终采用哪一种内部布局。

这意味着主题 A 的 `HomeLayout` 可以是单栏，主题 B 可以是左右双栏，主题 C 可以是三栏加浮动侧边区域。

### 4.5 主题专属组件
若主题 B 继承自主题 A，并新增了 A 没有的组件，例如 `ThemeBPromoCard`：

- 该组件可以在主题 B 内部直接导入并使用。
- 该组件不应纳入全局 `<ThemeComponent>` 分发体系，除非它被提升为跨主题统一契约组件。
- 主题专属组件适合承载仅对该主题有意义的挂件、交互模块和视觉增强部件。

### 4.6 数据扩展的两种路径
当主题 B 需要显示主题 A 不展示的数据，例如点赞数、评论数、阅读时长时，应采用以下两种路径之一：

#### 路径一：主项目聚合后透传
适用于通用业务数据：

- 后端返回更丰富的数据结构。
- 主项目在页面层统一聚合。
- 通过 `<ThemeComponent>` 或页面布局 props 统一传递。

这是首选方案，因为它有利于 SSR、一致缓存、统一权限控制和类型安全。

#### 路径二：主题内部独立获取
适用于主题专属交互或仅局部使用的数据：

- 主项目后端提供原子化公共 API，例如 `/api/posts/:id/stats`。
- 主题自身编写 composable，例如 `usePostStats(postId)`。
- 主题组件在内部独立获取数据并展示。

该方案适合主题专属挂件、实验性交互、只在某一主题出现的数据块，但要注意请求数量、缓存策略与 SSR 行为。

### 4.7 数据流向约束
为避免主题系统变成“业务逻辑收容所”，必须明确以下边界：

1. **主题负责展示，不主导核心业务模型定义。**
2. **主项目负责业务主数据聚合、鉴权、缓存和 API 稳定性。**
3. **主题专属配置只能扩展展示行为，不应反向污染通用业务契约。**
4. **若某个主题专属字段逐步变成通用需求，应将其上升为正式契约字段。**

---

## 5. 样式系统与 CSS 变量治理

### 5.1 样式方案解耦与 CSS 变量规范
- 推荐使用 Tailwind CSS v4，但允许使用纯 CSS、SCSS、UnoCSS 等任意 CSS 方案。
- 基础主题层必须声明所有 `--theme-*` 变量。
- 主题切换统一依赖 `<html>` 或顶层容器上的 `data-theme="xxx"` 状态。
- 为避免多主题样式冲突，除基础 reset 外，所有主题特有全局样式都必须包裹在 `[data-theme="xxx"]` 或 `.dark [data-theme="xxx"]` 选择器中。

### 5.2 构建产物 CSS 变量校验
禁止扫描源码提取 CSS 变量，而应在构建完成后扫描最终 CSS 产物：

- 提取各主题选择器下的 `--theme-*` 变量。
- 与 `requiredCssVars` 对比。
- 缺失时给出警告并在 DevTools 中展示覆盖报告。

### 5.3 主题切换性能
- 禁止全局 `transition: all`。
- 允许在主题切换时临时为根节点添加 `.theme-transition`。
- 过渡仅限颜色、背景、阴影等属性，避免对宽高、定位等布局属性做动画。
- 可通过 `will-change`、空闲预加载等方式优化切换体验。

---

## 6. 主题引擎模块需求

### 6.1 模块配置项
```ts
interface ThemeEngineOptions {
  themesDir?: string
  defaultTheme?: string
  cookieKey?: string
  lazyLoadThemes?: boolean
  requiredCssVars?: string[]
}
```

### 6.2 构建时能力
1. 组件前缀化与继承别名生成。
2. 扫描并使用 Zod 校验 `theme.json`。
3. 基于构建产物的 CSS 变量校验。
4. 动态生成 `#build/theme-components.d.ts`。

### 6.3 运行时能力
1. 注入 `useThemeEngine()`：
   - `currentTheme`
   - `availableThemes`
   - `setTheme(name)`
2. 持久化优先级：
   - `URL 参数 ?theme=xxx`
   - `Cookie`
   - `localStorage`
   - 默认配置
3. 注入 DOM 同步插件，自动维护 `data-theme`。
4. 提供 `useThemeConfig()` 用于读取和维护主题特有 KV 配置。

### 6.4 按需加载的静态映射
当 `lazyLoadThemes: true` 时，引擎在构建时生成静态异步组件映射表，保证仅在激活某个主题时才加载该主题特有组件代码。

开发环境下可默认关闭该能力，以避免影响 HMR 调试体验。

### 6.5 Nuxt DevTools 集成
在 Nuxt DevTools 中增加主题调试面板，展示：

- 当前激活主题与快速切换按钮。
- 主题继承链。
- CSS 变量覆盖情况。
- 主题配置项读取结果。
- 当前主题组件 chunk 信息与切换耗时。

---

## 7. 实施路径与验收标准

### 7.1 实施路径
- **Phase 1**：完成 `@tixxin/nuxt-theme-engine` MVP，支持组件前缀化、继承别名、基础状态管理与主题切换。
- **Phase 2**：补充按需加载、CSS 产物校验、DevTools 集成。
- **Phase 3**：沉淀 `@tixxin/theme-contracts` 和基础主题 Layer。
- **Phase 4**：开发多个业务主题，验证不同布局、主题专属组件、宽泛契约与主题配置 KV 方案。
- **Phase 5**：在真实博客项目中接入，完成业务数据对接与性能验证。

### 7.2 可量化验收标准
1. **开发体验**
   - 主题目录中修改组件代码，HMR 延迟小于 500ms。
   - IDE 可准确推导 `<ThemeComponent>` 的 `name` 联合类型及其对应 props。
2. **性能指标**
   - 开启 `lazyLoadThemes` 时，未激活主题的组件代码不进入初始 JS bundle。
   - 主题切换的 JS 执行时间小于 50ms。
   - 初始 JS bundle 增量控制在 20KB 以内。
3. **解耦验证**
   - `@tixxin/nuxt-theme-engine` 能在全新 Nuxt 4 项目中独立运行。
   - 不依赖具体博客业务模型即可完成基础主题切换。
4. **扩展能力验证**
   - 至少验证单栏、双栏、三栏三类布局实现。
   - 至少验证一个主题专属组件场景。
   - 至少验证一种“主项目聚合透传”和一种“主题内部独立获取”的扩展数据方案。
