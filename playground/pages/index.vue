<script setup lang="ts">
import { useThemeConfig, useThemeEngine } from '#imports'
import { computed, ref } from 'vue'
import type { ThemePostDetail, ThemePostSummary } from '@tixxin/theme-contracts'

const { currentTheme, availableThemes, setTheme } = useThemeEngine()
const { getThemeOption, setThemeOption } = useThemeConfig()

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

const announcement = computed({
  get: () => getThemeOption<string>('announcement', '欢迎来到主题引擎 playground') ?? '欢迎来到主题引擎 playground',
  set: value => setThemeOption('announcement', value)
})
</script>

<template>
  <div class="playground-shell">
    <header class="toolbar">
      <h1>Nuxt Theme Engine Playground</h1>

      <div class="toolbar-buttons">
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

      <label class="config-field">
        <span>主题公告</span>
        <input v-model="announcement" type="text">
      </label>
    </header>

    <ThemeComponent name="HomeLayout" title="Theme Engine V2" subtitle="运行时切换布局与组件实现">
      <template #default>
        <p class="announcement">{{ announcement }}</p>

        <ThemeComponent name="PostList" :posts="posts" />
        <ThemeComponent name="PostDetail" :post="post" />
      </template>
    </ThemeComponent>
  </div>
</template>

<style scoped>
.toolbar {
  display: grid;
  gap: 12px;
  padding: 24px;
}

.toolbar-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-buttons button,
.config-field input {
  border: 1px solid var(--theme-muted, rgba(148, 163, 184, 0.35));
  border-radius: 10px;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.45);
  color: inherit;
}

.toolbar-buttons button.active {
  border-color: var(--theme-accent, #38bdf8);
  background: color-mix(in srgb, var(--theme-accent, #38bdf8) 25%, transparent);
}

.config-field {
  display: grid;
  gap: 8px;
  max-width: 420px;
}

.announcement {
  margin: 0 0 16px;
  color: var(--theme-muted, #94a3b8);
}
</style>
