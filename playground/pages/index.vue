<script setup lang="ts">
import { useThemeConfig, useThemeEngine } from '#imports'
import { computed, ref } from 'vue'
import type { NavItem, SiteStatsData, ThemePostDetail, ThemePostSummary } from '#theme-contracts'

const { currentTheme, availableThemes, setTheme } = useThemeEngine()
const { getThemeOption, setThemeOption } = useThemeConfig()

const devPanelOpen = ref(false)

const posts = ref<ThemePostSummary[]>([
  {
    id: 1,
    title: 'Nuxt Theme Engine V2',
    excerpt: '构建时别名 + 运行时分发 + 类型生成。',
    likesCount: 32,
    commentsCount: 8,
    readingTime: '5 min'
  },
  {
    id: 2,
    title: 'Aurora Theme Preview',
    excerpt: '展示继承主题如何重写列表组件。',
    likesCount: 18,
    commentsCount: 2,
    readingTime: '3 min'
  },
  {
    id: 3,
    title: 'CSS Variable Governance',
    excerpt: '使用 --theme-* 变量统一管理主题色彩体系。',
    likesCount: 45,
    commentsCount: 6,
    readingTime: '4 min'
  },
  {
    id: 4,
    title: 'Three Column Layout',
    excerpt: '复刻 tix.xin 三栏布局方案详解。',
    likesCount: 27,
    commentsCount: 14,
    readingTime: '8 min'
  }
])

const post = ref<ThemePostDetail>({
  id: 101,
  title: 'Theme Detail',
  excerpt: '验证 PostDetail 契约与父主题回退。',
  content: '这个详情组件只在基础主题中实现，Aurora 会通过继承别名复用它。',
  likesCount: 51,
  commentsCount: 12,
  readingTime: '7 min'
})

const navItems = ref<NavItem[]>([
  { label: '主页', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', path: '/' },
  { label: '文章', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>', path: '/posts' },
  { label: '项目', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', path: '/projects' },
  { label: '画廊', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', path: '/gallery' },
  { label: '友链', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', path: '/friends' },
  { label: '留言', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', path: '/guestbook' },
  { label: '关于', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', path: '/about' }
])

const stats = ref<SiteStatsData>({
  runningDays: 1888,
  postCount: 86,
  viewCount: '4.5w',
  commentCount: 326,
  tagCount: 18
})

const footerLinks = ref([
  { label: '关于本站', url: '/about' },
  { label: '隐私政策', url: '/privacy' },
  { label: 'RSS 订阅', url: '/feed' },
  { label: '站点地图', url: '/sitemap' }
])

const announcement = computed({
  get: () => getThemeOption<string>('announcement', '欢迎来到主题引擎 playground') ?? '欢迎来到主题引擎 playground',
  set: value => setThemeOption('announcement', value)
})
</script>

<template>
  <div class="playground-shell">
    <div class="dev-panel" :class="{ 'dev-panel--open': devPanelOpen }">
      <button class="dev-panel__toggle" @click="devPanelOpen = !devPanelOpen">
        {{ devPanelOpen ? '✕' : '⚙' }}
      </button>
      <div v-if="devPanelOpen" class="dev-panel__body">
        <div class="dev-panel__buttons">
          <button
            v-for="themeName in availableThemes"
            :key="themeName"
            :class="{ active: themeName === currentTheme }"
            type="button"
            @click="setTheme(themeName)"
          >
            {{ themeName }}
          </button>
        </div>
        <label class="dev-panel__field">
          <span>公告</span>
          <input v-model="announcement" type="text">
        </label>
      </div>
    </div>

    <ThemeComponent name="HomeLayout" title="Theme Engine V2" subtitle="运行时切换布局与组件实现">
      <template #nav>
        <ThemeComponent name="SidebarNav" :items="navItems" current-path="/" />
      </template>

      <template #widgets>
        <ThemeComponent name="SubscribeCard" description="获取最新文章和技术分享，不会发送垃圾邮件。" />
      </template>

      <template #default>
        <p class="announcement">{{ announcement }}</p>
        <ThemeComponent name="PostList" :posts="posts" />
        <ThemeComponent name="PostDetail" :post="post" />
      </template>

      <template #aside>
        <ThemeComponent name="SiteStats" :stats="stats" />
      </template>

      <template #footer>
        <ThemeComponent name="BlogFooter" copyright="2026 TixXin Blog. All rights reserved." powered-by="Nuxt & Vue" :links="footerLinks" />
      </template>
    </ThemeComponent>
  </div>
</template>

<style scoped>
.dev-panel {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 99999;
}

.dev-panel__toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--theme-muted, rgba(148, 163, 184, 0.35));
  background: var(--theme-card-bg, rgba(15, 23, 42, 0.95));
  color: var(--theme-text, #e2e8f0);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.dev-panel__body {
  position: absolute;
  bottom: 48px;
  right: 0;
  background: var(--theme-card-bg, rgba(15, 23, 42, 0.97));
  border: 1px solid var(--theme-muted, rgba(148, 163, 184, 0.25));
  border-radius: 12px;
  padding: 14px;
  min-width: 220px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dev-panel__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dev-panel__buttons button {
  border: 1px solid var(--theme-muted, rgba(148, 163, 184, 0.35));
  border-radius: 8px;
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.45);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dev-panel__buttons button.active {
  border-color: var(--theme-accent, #38bdf8);
  background: color-mix(in srgb, var(--theme-accent, #38bdf8) 25%, transparent);
}

.dev-panel__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.dev-panel__field input {
  border: 1px solid var(--theme-muted, rgba(148, 163, 184, 0.35));
  border-radius: 6px;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.45);
  color: inherit;
  font-size: 12px;
}

.announcement {
  margin: 0 0 16px;
  color: var(--theme-muted, #94a3b8);
}
</style>
