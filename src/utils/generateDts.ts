import { promises as fs } from 'node:fs'

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

export async function generateThemeComponentDts(contractsSourcePath: string, contractsImportId: string) {
  const source = await fs.readFile(contractsSourcePath, 'utf8')
  const names = parseContractNames(source)
  const union = names.length > 0
    ? names.map(name => `'${name}'`).join(' | ')
    : 'never'

  return `import type { DefineComponent } from 'vue'
import type { ThemeComponentContracts } from ${JSON.stringify(contractsImportId)}

declare module '#build/theme-engine.contracts.mjs' {
  export const themeEngineContracts: {
    entry: string
    importId: string
  }

  export type GeneratedThemeComponentName = ${union}
  export type GeneratedThemeComponentContracts = ThemeComponentContracts
  export type ThemeComponentDiscriminatedProps = {
    [K in keyof ThemeComponentContracts]: { name: K } & ThemeComponentContracts[K]
  }[keyof ThemeComponentContracts]
}

type ThemeComponentDiscriminatedProps = import('#build/theme-engine.contracts.mjs').ThemeComponentDiscriminatedProps
declare const ThemeComponent: DefineComponent<ThemeComponentDiscriminatedProps>

declare module 'vue' {
  export interface GlobalComponents {
    ThemeComponent: typeof ThemeComponent
  }
}

export {}
`
}
