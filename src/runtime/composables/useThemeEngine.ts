import { computed, readonly, watch } from 'vue'
import { useCookie, useRoute, useState } from 'nuxt/app'
import { themeEngineOptions, themeEngineThemeNames, themeEngineThemes } from '#build/theme-engine.options.mjs'

const CURRENT_THEME_KEY = 'theme-engine:current-theme'
const STORAGE_KEY = 'theme-engine:storage'

let themeEngineInitialized = false
let themeEngineWatchRegistered = false

function isThemeName(value: string | null | undefined): value is string {
  return Boolean(value) && themeEngineThemeNames.includes(value as never)
}

function resolveRouteTheme() {
  const route = useRoute()
  const queryTheme = route.query.theme
  return typeof queryTheme === 'string' ? queryTheme : undefined
}

function resolveInitialTheme(cookieKey: string, fallbackTheme: string) {
  const routeTheme = resolveRouteTheme()
  if (isThemeName(routeTheme)) {
    return routeTheme
  }

  const cookie = useCookie<string | undefined>(cookieKey)
  if (isThemeName(cookie.value)) {
    return cookie.value
  }

  if (import.meta.client) {
    const storageTheme = window.localStorage.getItem(STORAGE_KEY)
    if (isThemeName(storageTheme)) {
      return storageTheme
    }
  }

  return fallbackTheme
}

export function useThemeEngine() {
  const currentTheme = useState<string>(CURRENT_THEME_KEY, () => themeEngineOptions.defaultTheme)

  if (import.meta.server || !themeEngineInitialized) {
    currentTheme.value = resolveInitialTheme(themeEngineOptions.cookieKey, themeEngineOptions.defaultTheme)

    if (import.meta.client) {
      themeEngineInitialized = true
    }
  }

  const cookie = useCookie<string | undefined>(themeEngineOptions.cookieKey)

  if (import.meta.client && !themeEngineWatchRegistered) {
    watch(currentTheme, (themeName) => {
      cookie.value = themeName

      if (import.meta.client) {
        window.localStorage.setItem(STORAGE_KEY, themeName)
      }
    }, {
      immediate: true
    })

    themeEngineWatchRegistered = true
  }

  const availableThemes = computed(() => [...themeEngineThemeNames])
  const themeDefinitions = computed(() => [...themeEngineThemes])

  function setTheme(themeName: string) {
    if (!isThemeName(themeName)) {
      return false
    }

    currentTheme.value = themeName
    return true
  }

  return {
    currentTheme: readonly(currentTheme),
    availableThemes,
    themeDefinitions,
    setTheme
  }
}
