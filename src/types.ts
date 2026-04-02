export interface ThemeEngineOptions {
  themesDir?: string
  defaultTheme?: string
  cookieKey?: string
  lazyLoadThemes?: boolean
  requiredCssVars?: string[]
}

export interface ThemeJson {
  name: string
  extends?: string
  label?: string
  description?: string
}

export interface ThemeDefinition {
  name: string
  label: string
  description?: string
  extends?: string
  path: string
  themeJsonPath: string
  componentsDir: string
  assetsDir: string
  cssFiles: string[]
  inheritanceChain: string[]
}

export interface ThemeComponentSource {
  logicalName: string
  filePath: string
  relativePath: string
  ownerTheme: string
}

export interface ThemeComponentEntry {
  logicalName: string
  alias: string
  theme: string
  sourceTheme: string
  filePath: string
  importPath: string
}

export interface GeneratedThemeRegistry {
  themes: Record<string, Record<string, ThemeComponentEntry>>
  uniqueAliases: ThemeComponentEntry[]
}

export interface CssVariableReport {
  theme: string
  provided: string[]
  missing: string[]
}
