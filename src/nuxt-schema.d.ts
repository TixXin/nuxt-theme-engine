import type { ThemeEngineOptions } from './types'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    themeEngine?: ThemeEngineOptions
  }

  interface NuxtOptions {
    themeEngine?: ThemeEngineOptions
  }
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    themeEngine?: ThemeEngineOptions
  }

  interface NuxtOptions {
    themeEngine?: ThemeEngineOptions
  }
}

export {}
