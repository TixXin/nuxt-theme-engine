import { promises as fs } from 'node:fs'
import fg from 'fast-glob'
import { basename, extname, relative } from 'pathe'
import type { GeneratedThemeRegistry, ThemeComponentEntry, ThemeComponentSource, ThemeDefinition } from '../types'

const COMPONENT_GLOB = '**/*.{vue,js,ts,tsx}'

function toPascalCase(segment: string) {
  return segment
    .replace(/\.[^.]+$/, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function toComponentName(relativePath: string) {
  return relativePath
    .split(/[\\/]/)
    .map(segment => toPascalCase(segment.replace(extname(segment), '')))
    .join('')
}

function toThemePrefix(themeName: string) {
  return themeName
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
}

function toImportPath(buildDir: string, filePath: string) {
  const relativePath = relative(buildDir, filePath).replace(/\\/g, '/')
  return relativePath.startsWith('.')
    ? relativePath
    : `./${relativePath}`
}

async function scanThemeComponentSources(theme: ThemeDefinition): Promise<ThemeComponentSource[]> {
  try {
    await fs.access(theme.componentsDir)
  }
  catch {
    return []
  }

  const files = await fg(COMPONENT_GLOB, {
    cwd: theme.componentsDir,
    absolute: true,
    onlyFiles: true
  })

  return files.map((filePath) => {
    const relativePath = relative(theme.componentsDir, filePath)

    return {
      logicalName: toComponentName(relativePath),
      filePath,
      relativePath,
      ownerTheme: theme.name
    }
  })
}

export async function generateThemeRegistry(themes: ThemeDefinition[], buildDir: string): Promise<GeneratedThemeRegistry> {
  const themeMap = new Map(themes.map(theme => [theme.name, theme]))
  const componentSourcesByTheme = new Map<string, Map<string, ThemeComponentSource>>()

  for (const theme of themes) {
    const sources = await scanThemeComponentSources(theme)
    componentSourcesByTheme.set(
      theme.name,
      new Map(sources.map(source => [source.logicalName, source]))
    )
  }

  const registry: GeneratedThemeRegistry = {
    themes: {},
    uniqueAliases: []
  }

  const seenAliases = new Set<string>()

  for (const theme of themes) {
    const entries: Record<string, ThemeComponentEntry> = {}

    for (const themeName of theme.inheritanceChain) {
      const sourceMap = componentSourcesByTheme.get(themeName)
      if (!sourceMap) {
        continue
      }

      for (const [logicalName, source] of sourceMap.entries()) {
        if (entries[logicalName]) {
          continue
        }

        const entry: ThemeComponentEntry = {
          logicalName,
          alias: `${toThemePrefix(theme.name)}${logicalName}`,
          theme: theme.name,
          sourceTheme: source.ownerTheme,
          filePath: source.filePath,
          importPath: toImportPath(buildDir, source.filePath)
        }

        entries[logicalName] = entry

        if (!seenAliases.has(entry.alias)) {
          seenAliases.add(entry.alias)
          registry.uniqueAliases.push(entry)
        }
      }
    }

    registry.themes[theme.name] = entries
  }

  registry.uniqueAliases.sort((left, right) => left.alias.localeCompare(right.alias))

  return registry
}

export function getThemePrefix(themeName: string) {
  return toThemePrefix(themeName)
}

export function inferLogicalComponentName(filePath: string) {
  return toComponentName(basename(filePath))
}
