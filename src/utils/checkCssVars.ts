import { promises as fs } from 'node:fs'
import fg from 'fast-glob'
import { resolve } from 'pathe'
import type { CssVariableReport, ThemeDefinition } from '../types'

function extractThemeScopedCss(css: string, themeName: string) {
  const selectors = [
    new RegExp(`\\[data-theme=["']${themeName}["']\\][^{]*\\{([\\s\\S]*?)\\}`, 'g'),
    new RegExp(`\\.dark\\s+\\[data-theme=["']${themeName}["']\\][^{]*\\{([\\s\\S]*?)\\}`, 'g')
  ]

  return selectors.flatMap((pattern) => {
    return Array.from(css.matchAll(pattern)).map(match => match[1] ?? '')
  })
}

function extractCssVars(css: string) {
  return Array.from(css.matchAll(/(--theme-[a-zA-Z0-9-_]+)\s*:/g))
    .map(match => match[1])
    .filter((value): value is string => Boolean(value))
}

export async function checkCssVars(
  rootDir: string,
  themes: ThemeDefinition[],
  requiredCssVars: string[]
): Promise<CssVariableReport[]> {
  if (requiredCssVars.length === 0) {
    return []
  }

  const cssFiles = await fg([
    '.nuxt/dist/client/**/*.css',
    '.output/public/_nuxt/**/*.css'
  ], {
    cwd: rootDir,
    absolute: true,
    onlyFiles: true
  })

  if (cssFiles.length === 0) {
    return Promise.all(themes.map(async (theme) => {
      const sourceCss = await Promise.all(theme.cssFiles.map(file => fs.readFile(resolve(file), 'utf8')))
      const provided = Array.from(new Set(extractCssVars(sourceCss.join('\n')))).sort()

      return {
        theme: theme.name,
        provided,
        missing: requiredCssVars.filter(variable => !provided.includes(variable))
      }
    }))
  }

  const cssChunks = await Promise.all(cssFiles.map(file => fs.readFile(resolve(file), 'utf8')))
  const joinedCss = cssChunks.join('\n')

  return themes.map((theme) => {
    const scopedBlocks = extractThemeScopedCss(joinedCss, theme.name).join('\n')
    const provided = Array.from(new Set(extractCssVars(scopedBlocks))).sort()
    const missing = requiredCssVars.filter(variable => !provided.includes(variable))

    return {
      theme: theme.name,
      provided,
      missing
    }
  })
}
