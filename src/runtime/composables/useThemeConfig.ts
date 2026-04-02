import { computed, watch } from 'vue'
import { useCookie, useState } from 'nuxt/app'
import { themeEngineOptions } from '#build/theme-engine.options.mjs'
import { useThemeEngine } from './useThemeEngine'

type ThemeConfigValue = string | number | boolean | null | Record<string, unknown> | unknown[]
type ThemeConfigRecord = Record<string, ThemeConfigValue>
type ThemeConfigStore = Record<string, ThemeConfigRecord>

const CONFIG_STATE_KEY = 'theme-engine:config-store'
const CONFIG_STORAGE_KEY = 'theme-engine:theme-config'
const CONFIG_COOKIE_KEY_SUFFIX = '-config'

let themeConfigInitialized = false
let themeConfigWatchRegistered = false

function parseStoredConfig(raw: string | null): ThemeConfigStore {
  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw) as ThemeConfigStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  }
  catch {
    return {}
  }
}

export function useThemeConfig() {
  const { currentTheme } = useThemeEngine()
  const cookie = useCookie<ThemeConfigStore>(`${themeEngineOptions.cookieKey}${CONFIG_COOKIE_KEY_SUFFIX}`, {
    default: () => ({})
  })
  const store = useState<ThemeConfigStore>(CONFIG_STATE_KEY, () => cookie.value ?? {})

  if (import.meta.client && !themeConfigInitialized) {
    const storageValue = parseStoredConfig(window.localStorage.getItem(CONFIG_STORAGE_KEY))
    store.value = Object.keys(storageValue).length > 0 ? storageValue : (cookie.value ?? {})
    themeConfigInitialized = true
  }

  if (import.meta.client && !themeConfigWatchRegistered) {
    watch(store, (value) => {
      cookie.value = value

      if (import.meta.client) {
        window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(value))
      }
    }, {
      deep: true,
      immediate: true
    })

    themeConfigWatchRegistered = true
  }

  const activeThemeConfig = computed(() => {
    return store.value[currentTheme.value] ?? {}
  })

  function getThemeOption<T = ThemeConfigValue>(key: string, fallback?: T) {
    const value = activeThemeConfig.value[key]
    return (value ?? fallback) as T | undefined
  }

  function setThemeOption(key: string, value: ThemeConfigValue) {
    const themeName = currentTheme.value
    const currentConfig = store.value[themeName] ?? {}
    store.value = {
      ...store.value,
      [themeName]: {
        ...currentConfig,
        [key]: value
      }
    }
  }

  function removeThemeOption(key: string) {
    const themeName = currentTheme.value
    const currentConfig = {
      ...(store.value[themeName] ?? {})
    }
    delete currentConfig[key]
    store.value = {
      ...store.value,
      [themeName]: currentConfig
    }
  }

  function replaceThemeConfig(nextConfig: ThemeConfigRecord) {
    store.value = {
      ...store.value,
      [currentTheme.value]: {
        ...nextConfig
      }
    }
  }

  return {
    activeThemeConfig,
    getThemeOption,
    setThemeOption,
    removeThemeOption,
    replaceThemeConfig
  }
}
