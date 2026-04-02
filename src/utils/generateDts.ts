import { promises as fs } from 'node:fs'
import { resolve } from 'pathe'

function parseContractNames(source: string) {
  const match = source.match(/themeContractNames\s*=\s*\[([\s\S]*?)\]\s*as const/)
  if (!match) {
    return []
  }

  const contractListSource = match[1] ?? ''

  return Array.from(contractListSource.matchAll(/['"`]([^'"`]+)['"`]/g))
    .map(result => result[1])
    .filter((name): name is string => Boolean(name))
}

export async function generateThemeComponentDts(rootDir: string) {
  const contractsSourcePath = resolve(rootDir, 'packages/theme-contracts/src/index.ts')
  const source = await fs.readFile(contractsSourcePath, 'utf8')
  const names = parseContractNames(source)
  const union = names.length > 0
    ? names.map(name => `'${name}'`).join(' | ')
    : 'never'

  return `import type { DefineComponent } from 'vue'
import type { ThemeComponentContracts } from '@tixxin/theme-contracts'

export type GeneratedThemeComponentName = ${union}
export type GeneratedThemeComponentContracts = ThemeComponentContracts
export type ThemeComponentDiscriminatedProps = {
  [K in keyof ThemeComponentContracts]: { name: K } & ThemeComponentContracts[K]
}[keyof ThemeComponentContracts]

declare const ThemeComponent: DefineComponent<ThemeComponentDiscriminatedProps>

declare module 'vue' {
  export interface GlobalComponents {
    ThemeComponent: typeof ThemeComponent
  }
}

export {}
`
}
