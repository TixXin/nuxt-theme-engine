<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, h, onServerPrefetch, shallowRef, useAttrs, useSlots, watch } from 'vue'
import type { Component } from 'vue'
import { themeComponentLoaders, themeComponentRegistry } from '#build/theme-engine.registry.mjs'
import { useThemeEngine } from '../composables/useThemeEngine'

type GeneratedThemeComponentName = import('#build/theme-engine.contracts.mjs').GeneratedThemeComponentName

type ThemeComponentLoader = () => Promise<{ default: Component }>

const asyncComponentCache = new Map<string, ReturnType<typeof defineAsyncComponent>>()
const loadedComponentCache = new Map<string, Component>()
const loadingTaskCache = new Map<string, Promise<Component | null>>()

function resolveThemeComponent(themeName: string, componentName: GeneratedThemeComponentName, firstThemeName: string) {
  const entry = themeComponentRegistry[themeName]?.[componentName]
    ?? themeComponentRegistry[firstThemeName]?.[componentName]
  const loader = themeComponentLoaders[themeName]?.[componentName]
    ?? themeComponentLoaders[firstThemeName]?.[componentName]

  if (!entry || !loader) {
    return null
  }

  return {
    cacheKey: `${entry.sourceTheme}:${componentName}`,
    loader: loader as ThemeComponentLoader
  }
}

async function loadThemeComponent(cacheKey: string, loader: ThemeComponentLoader) {
  const cachedComponent = loadedComponentCache.get(cacheKey)
  if (cachedComponent) {
    return cachedComponent
  }

  const loadingTask = loadingTaskCache.get(cacheKey)
  if (loadingTask) {
    return loadingTask
  }

  const task = loader()
    .then((module) => {
      const component = module.default ?? null
      if (component) {
        loadedComponentCache.set(cacheKey, component)
      }
      return component
    })
    .finally(() => {
      loadingTaskCache.delete(cacheKey)
    })

  loadingTaskCache.set(cacheKey, task)

  return task
}

function getAsyncComponent(cacheKey: string, loader: ThemeComponentLoader) {
  if (!asyncComponentCache.has(cacheKey)) {
    asyncComponentCache.set(cacheKey, defineAsyncComponent(async () => {
      const component = await loadThemeComponent(cacheKey, loader)
      if (!component) {
        throw new Error(`Theme component "${cacheKey}" failed to load.`)
      }
      return component
    }))
  }

  return asyncComponentCache.get(cacheKey) ?? null
}

export default defineComponent({
  name: 'ThemeComponent',
  inheritAttrs: false,
  props: {
    name: {
      type: String as () => GeneratedThemeComponentName,
      required: true
    }
  },
  setup(props: { name: GeneratedThemeComponentName }) {
    const attrs = useAttrs()
    const slots = useSlots()
    const { currentTheme } = useThemeEngine()
    const firstThemeName = Object.keys(themeComponentRegistry)[0] ?? ''
    const displayedComponent = shallowRef<Component | null>(null)
    const displayedCacheKey = shallowRef<string | null>(null)
    const targetComponent = computed(() => resolveThemeComponent(currentTheme.value, props.name, firstThemeName))
    let activeRequestId = 0

    async function syncDisplayedComponent() {
      const requestId = ++activeRequestId
      const resolvedTarget = targetComponent.value

      if (!resolvedTarget) {
        displayedComponent.value = null
        displayedCacheKey.value = null
        return
      }

      if (displayedCacheKey.value === resolvedTarget.cacheKey && displayedComponent.value) {
        return
      }

      const cachedComponent = loadedComponentCache.get(resolvedTarget.cacheKey)
      if (cachedComponent) {
        displayedComponent.value = cachedComponent
        displayedCacheKey.value = resolvedTarget.cacheKey
        return
      }

      // 首次没有任何可显示组件时，先挂上异步包装器；后续切换则继续保留旧树。
      const hasDisplayedComponent = Boolean(displayedComponent.value)
      if (!hasDisplayedComponent) {
        displayedComponent.value = getAsyncComponent(resolvedTarget.cacheKey, resolvedTarget.loader)
        displayedCacheKey.value = resolvedTarget.cacheKey
      }

      const loadedComponent = await loadThemeComponent(resolvedTarget.cacheKey, resolvedTarget.loader)
      if (!loadedComponent || requestId !== activeRequestId) {
        return
      }

      displayedComponent.value = loadedComponent
      displayedCacheKey.value = resolvedTarget.cacheKey
    }

    watch([
      () => currentTheme.value,
      () => props.name
    ], () => {
      void syncDisplayedComponent()
    }, {
      immediate: true
    })

    onServerPrefetch(syncDisplayedComponent)

    return () => {
      if (!displayedComponent.value) {
        return null
      }

      return h(displayedComponent.value as never, attrs, slots)
    }
  }
})
</script>
