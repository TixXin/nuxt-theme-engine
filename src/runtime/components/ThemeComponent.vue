<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, h, useAttrs, useSlots } from 'vue'
import { themeComponentLoaders, themeComponentRegistry } from '#build/theme-engine.registry.mjs'
import { useThemeEngine } from '../composables/useThemeEngine'

type GeneratedThemeComponentName = import('#build/theme-engine.contracts.mjs').GeneratedThemeComponentName

const asyncComponentCache = new Map<string, ReturnType<typeof defineAsyncComponent>>()

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

    const entry = computed(() => {
      return themeComponentRegistry[currentTheme.value]?.[props.name]
        ?? themeComponentRegistry[firstThemeName]?.[props.name]
    })

    const resolvedComponent = computed(() => {
      const resolvedEntry = entry.value
      if (!resolvedEntry) {
        return null
      }

      const loader = themeComponentLoaders[currentTheme.value]?.[props.name]
        ?? themeComponentLoaders[firstThemeName]?.[props.name]

      if (!loader) {
        return null
      }

      const cacheKey = `${resolvedEntry.sourceTheme}:${props.name}`
      if (!asyncComponentCache.has(cacheKey)) {
        asyncComponentCache.set(cacheKey, defineAsyncComponent(loader as never))
      }

      return asyncComponentCache.get(cacheKey) ?? null
    })

    return () => {
      if (!resolvedComponent.value) {
        return null
      }

      return h(resolvedComponent.value as never, attrs, slots)
    }
  }
})
</script>
