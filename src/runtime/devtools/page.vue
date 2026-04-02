<script setup lang="ts">
import { computed } from 'vue'
import { themeCssVariableReport } from '#build/theme-engine.css-report.mjs'
import { themeComponentRegistry } from '#build/theme-engine.registry.mjs'
import { themeEngineOptions } from '#build/theme-engine.options.mjs'
import { useThemeConfig } from '../composables/useThemeConfig'
import { useThemeEngine } from '../composables/useThemeEngine'

const { currentTheme, availableThemes, themeDefinitions, setTheme } = useThemeEngine()
const { activeThemeConfig } = useThemeConfig()

const currentRegistryEntries = computed(() => {
  return Object.entries(themeComponentRegistry[currentTheme.value] ?? {})
})
</script>

<template>
  <main class="theme-engine-devtools">
    <section class="theme-engine-card">
      <h1>Theme Engine</h1>
      <p>当前主题：<strong>{{ currentTheme }}</strong></p>
      <div class="theme-engine-actions">
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
    </section>

    <section class="theme-engine-grid">
      <article class="theme-engine-card">
        <h2>模块选项</h2>
        <pre>{{ themeEngineOptions }}</pre>
      </article>

      <article class="theme-engine-card">
        <h2>主题定义</h2>
        <pre>{{ themeDefinitions }}</pre>
      </article>

      <article class="theme-engine-card">
        <h2>当前主题组件映射</h2>
        <pre>{{ currentRegistryEntries }}</pre>
      </article>

      <article class="theme-engine-card">
        <h2>主题配置 KV</h2>
        <pre>{{ activeThemeConfig }}</pre>
      </article>

      <article class="theme-engine-card">
        <h2>CSS 变量报告</h2>
        <pre>{{ themeCssVariableReport }}</pre>
      </article>
    </section>
  </main>
</template>

<style scoped>
.theme-engine-devtools {
  min-height: 100vh;
  padding: 24px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: Inter, system-ui, sans-serif;
}

.theme-engine-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.theme-engine-card {
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85);
}

.theme-engine-card pre {
  overflow: auto;
  padding: 12px;
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.85);
  white-space: pre-wrap;
  word-break: break-word;
}

.theme-engine-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.theme-engine-actions button {
  padding: 8px 12px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.theme-engine-actions button.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.7);
}
</style>
