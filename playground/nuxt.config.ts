import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '../src/module'
  ],
  devtools: {
    enabled: true
  },
  compatibilityDate: '2026-04-02',
  themeEngine: {
    themesDir: './themes',
    defaultTheme: 'base',
    cookieKey: 'playground-theme',
    lazyLoadThemes: true,
    requiredCssVars: [
      '--theme-bg',
      '--theme-text',
      '--theme-accent',
      '--theme-muted'
    ]
  }
})
