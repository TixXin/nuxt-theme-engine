import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'

const playgroundContractsEntry = fileURLToPath(new URL('./theme-contracts/index.ts', import.meta.url))

export default defineNuxtConfig({
  alias: {
    '#theme-contracts': playgroundContractsEntry
  },
  modules: [
    '@unocss/nuxt',
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
    contractsEntry: '#theme-contracts',
    contractsImportId: '#theme-contracts',
    requiredCssVars: [
      '--theme-bg',
      '--theme-text',
      '--theme-accent',
      '--theme-muted'
    ]
  }
})
