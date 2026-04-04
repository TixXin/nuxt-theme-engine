import { promises as fs } from 'node:fs'
import fg from 'fast-glob'
import { dirname, join } from 'pathe'
import { z } from 'zod'
import type { ThemeDefinition, ThemeJson } from '../types'

const themeJsonSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9-]+$/),
  extends: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  meta: z.record(z.string(), z.unknown()).optional()
}) satisfies z.ZodType<ThemeJson>

async function fileExists(path: string) {
  try {
    await fs.access(path)
    return true
  }
  catch {
    return false
  }
}

function detectCycles(themesByName: Map<string, ThemeDefinition>) {
  const visited = new Set<string>()
  const visiting = new Set<string>()

  const visit = (themeName: string) => {
    if (visited.has(themeName)) {
      return
    }

    if (visiting.has(themeName)) {
      throw new Error(`Detected circular theme inheritance involving "${themeName}".`)
    }

    visiting.add(themeName)

    const theme = themesByName.get(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" is missing from the resolved theme map.`)
    }

    if (theme.extends) {
      if (!themesByName.has(theme.extends)) {
        throw new Error(`Theme "${themeName}" extends missing parent theme "${theme.extends}".`)
      }

      visit(theme.extends)
    }

    visiting.delete(themeName)
    visited.add(themeName)
  }

  for (const themeName of themesByName.keys()) {
    visit(themeName)
  }
}

function resolveInheritanceChain(themeName: string, themesByName: Map<string, ThemeDefinition>) {
  const chain: string[] = []
  let cursor = themesByName.get(themeName)

  while (cursor) {
    chain.push(cursor.name)
    cursor = cursor.extends ? themesByName.get(cursor.extends) : undefined
  }

  return chain
}

export async function loadThemeDefinitions(themesDir: string): Promise<ThemeDefinition[]> {
  const themeJsonFiles = await fg('*/theme.json', {
    cwd: themesDir,
    absolute: true,
    onlyFiles: true
  })

  const themes = await Promise.all(themeJsonFiles.map(async (themeJsonPath) => {
    const raw = await fs.readFile(themeJsonPath, 'utf8')
    const json = themeJsonSchema.parse(JSON.parse(raw))
    const themePath = dirname(themeJsonPath)
    const componentsDir = join(themePath, 'app/components')
    const assetsDir = join(themePath, 'app/assets')
    const cssFiles = await fileExists(assetsDir)
      ? await fg('**/*.{css,scss,sass,less,pcss}', {
          cwd: assetsDir,
          absolute: true,
          onlyFiles: true
        })
      : []

    return {
      name: json.name,
      label: json.label ?? json.name,
      description: json.description,
      extends: json.extends,
      meta: json.meta,
      path: themePath,
      themeJsonPath,
      componentsDir,
      assetsDir,
      cssFiles,
      inheritanceChain: []
    } satisfies ThemeDefinition
  }))

  const themesByName = new Map(themes.map(theme => [theme.name, theme]))
  detectCycles(themesByName)

  const resolvedThemes = await Promise.all(themes.map(async (theme) => {
    if (!await fileExists(theme.componentsDir)) {
      return {
        ...theme,
        inheritanceChain: resolveInheritanceChain(theme.name, themesByName)
      }
    }

    return {
      ...theme,
      inheritanceChain: resolveInheritanceChain(theme.name, themesByName)
    }
  }))

  return resolvedThemes.sort((left, right) => left.name.localeCompare(right.name))
}

export { themeJsonSchema }
