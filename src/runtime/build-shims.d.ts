declare module '#build/theme-engine.options.mjs' {
  export const themeEngineOptions: {
    themesDir: string
    defaultTheme: string
    cookieKey: string
    lazyLoadThemes: boolean
    requiredCssVars: string[]
  }

  export const themeEngineThemeNames: string[]

  export const themeEngineThemes: Array<{
    name: string
    label: string
    extends: string | null
    inheritanceChain: string[]
  }>
}

declare module '#build/theme-engine.registry.mjs' {
  import type { Component } from 'vue'

  export const themeComponentRegistry: Record<string, Record<string, {
    alias: string
    sourceTheme: string
  }>>

  export const themeComponentLoaders: Record<string, Record<string, () => Promise<{ default: Component }>>>
}

declare module '#build/theme-engine.css-report.mjs' {
  export const themeCssVariableReport: Array<{
    theme: string
    provided: string[]
    missing: string[]
  }>
}
