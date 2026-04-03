import { promises as fs } from 'node:fs'
import { createRequire } from 'node:module'
import {
  addComponent,
  addImportsDir,
  addPlugin,
  addTemplate,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
  logger
} from '@nuxt/kit'
import { addCustomTab } from '@nuxt/devtools-kit'
import { resolve } from 'pathe'
import { checkCssVars } from './utils/checkCssVars'
import { generateThemeComponentDts } from './utils/generateDts'
import { generateThemeRegistry } from './utils/generateAlias'
import { loadThemeDefinitions } from './utils/parseThemeJson'
import type { CssVariableReport, GeneratedThemeRegistry, ThemeEngineOptions } from './types'

const DEFAULTS: Required<ThemeEngineOptions> = {
  themesDir: 'themes',
  defaultTheme: 'base',
  cookieKey: 'theme-pref',
  lazyLoadThemes: false,
  requiredCssVars: [],
  contractsEntry: '@tixxin/theme-contracts',
  contractsImportId: '@tixxin/theme-contracts'
}

const require = createRequire(import.meta.url)

async function pathExists(path: string) {
  try {
    await fs.access(path)
    return true
  }
  catch {
    return false
  }
}

function isLocalSpecifier(specifier: string) {
  return specifier.startsWith('.')
    || specifier.startsWith('/')
    || specifier.startsWith('~')
    || /^[A-Za-z]:[\\/]/.test(specifier)
}

async function resolveContractsEntry(
  entry: string,
  importId: string,
  rootDir: string,
  moduleRoot: string,
  aliases: Record<string, string | undefined>
) {
  const internalDefaultEntry = resolve(moduleRoot, 'packages/theme-contracts/src/index.ts')
  if ((entry === '@tixxin/theme-contracts' || entry === 'packages/theme-contracts/src/index.ts') && await pathExists(internalDefaultEntry)) {
    return internalDefaultEntry
  }

  const aliasTarget = aliases[entry] ?? aliases[importId]
  if (typeof aliasTarget === 'string') {
    return isLocalSpecifier(aliasTarget)
      ? resolve(rootDir, aliasTarget)
      : aliasTarget
  }

  if (isLocalSpecifier(entry)) {
    return resolve(rootDir, entry)
  }

  return require.resolve(entry, {
    paths: [rootDir, moduleRoot]
  })
}

function serializeRegistry(registry: GeneratedThemeRegistry) {
  const registryShape = Object.fromEntries(
    Object.entries(registry.themes).map(([themeName, entries]) => {
      return [themeName, Object.fromEntries(
        Object.entries(entries).map(([logicalName, entry]) => {
          return [logicalName, {
            alias: entry.alias,
            sourceTheme: entry.sourceTheme
          }]
        })
      )]
    })
  )

  const loaderEntries = registry.uniqueAliases.map((entry, index) => ({
    constName: `loader_${index}`,
    entry
  }))

  const loaderDefinitions = loaderEntries
    .map(item => `const ${item.constName} = () => import(${JSON.stringify(item.entry.importPath)})`)
    .join('\n')

  const loaderLookup = new Map(loaderEntries.map(item => [`${item.entry.theme}:${item.entry.logicalName}`, item.constName]))

  const loaderObject = Object.entries(registry.themes)
    .map(([themeName, entries]) => {
      const entrySource = Object.keys(entries)
        .map((logicalName) => {
          const loaderName = loaderLookup.get(`${themeName}:${logicalName}`)
          return `${JSON.stringify(logicalName)}: ${loaderName}`
        })
        .join(',\n      ')

      return `${JSON.stringify(themeName)}: {\n      ${entrySource}\n    }`
    })
    .join(',\n  ')

  return `${loaderDefinitions}

export const themeComponentRegistry = ${JSON.stringify(registryShape, null, 2)}

export const themeComponentLoaders = {
  ${loaderObject}
}
`
}

function serializeOptions(options: Required<ThemeEngineOptions>, themes: Awaited<ReturnType<typeof loadThemeDefinitions>>) {
  const serializedThemes = themes.map(theme => ({
    name: theme.name,
    label: theme.label,
    extends: theme.extends ?? null,
    inheritanceChain: theme.inheritanceChain
  }))

  return `export const themeEngineOptions = ${JSON.stringify(options, null, 2)}
export const themeEngineThemeNames = ${JSON.stringify(themes.map(theme => theme.name), null, 2)}
export const themeEngineThemes = ${JSON.stringify(serializedThemes, null, 2)}
`
}

function serializeCssReport(report: CssVariableReport[]) {
  return `export const themeCssVariableReport = ${JSON.stringify(report, null, 2)}\n`
}

function serializeContracts(entry: string, importId: string) {
  return `export const themeEngineContracts = ${JSON.stringify({
    entry,
    importId
  }, null, 2)}\n`
}

export default defineNuxtModule<ThemeEngineOptions>({
  meta: {
    name: '@tixxin/nuxt-theme-engine',
    configKey: 'themeEngine',
    compatibility: {
      nuxt: '>=4.0.0'
    }
  },
  defaults: DEFAULTS,
  async setup(moduleOptions, nuxt) {
    const resolver = createResolver(import.meta.url)
    const moduleRoot = resolver.resolve('..')
    const options = {
      ...DEFAULTS,
      ...moduleOptions
    }
    const themesDir = resolve(nuxt.options.rootDir, options.themesDir)
    const contractsImportId = options.contractsImportId
    const contractsEntry = await resolveContractsEntry(
      options.contractsEntry,
      contractsImportId,
      nuxt.options.rootDir,
      moduleRoot,
      nuxt.options.alias as Record<string, string | undefined>
    )
    const themes = await loadThemeDefinitions(themesDir)
    const defaultTheme = themes.some(theme => theme.name === options.defaultTheme)
      ? options.defaultTheme
      : (themes[0]?.name ?? options.defaultTheme)
    const resolvedOptions = {
      ...options,
      contractsEntry,
      contractsImportId,
      defaultTheme,
      lazyLoadThemes: options.lazyLoadThemes && !nuxt.options.dev
    }
    const registry = await generateThemeRegistry(themes, nuxt.options.buildDir)

    if (!nuxt.options.alias[contractsImportId]) {
      nuxt.options.alias[contractsImportId] = contractsEntry
    }

    addImportsDir(resolver.resolve('./runtime/composables'))
    addPlugin(resolver.resolve('./runtime/plugins/theme-sync.client'))
    addComponent({
      name: 'ThemeComponent',
      filePath: resolver.resolve('./runtime/components/ThemeComponent.vue')
    })

    if (!resolvedOptions.lazyLoadThemes) {
      for (const entry of registry.uniqueAliases) {
        addComponent({
          name: entry.alias,
          filePath: entry.filePath
        })
      }
    }

    for (const theme of themes) {
      for (const cssFile of theme.cssFiles) {
        if (!nuxt.options.css.includes(cssFile)) {
          nuxt.options.css.push(cssFile)
        }
      }
    }

    addTemplate({
      filename: 'theme-engine.options.mjs',
      getContents: () => serializeOptions(resolvedOptions, themes)
    })

    addTemplate({
      filename: 'theme-engine.registry.mjs',
      getContents: () => serializeRegistry(registry)
    })

    addTemplate({
      filename: 'theme-engine.contracts.mjs',
      getContents: () => serializeContracts(contractsEntry, contractsImportId)
    })

    const cssReportTemplate = addTemplate({
      filename: 'theme-engine.css-report.mjs',
      getContents: () => serializeCssReport([])
    })

    addTypeTemplate({
      filename: 'types/theme-components.d.ts',
      getContents: () => generateThemeComponentDts(contractsEntry, contractsImportId)
    })

    extendPages((pages) => {
      pages.push({
        name: 'theme-engine-devtools',
        path: '/_theme-engine-devtools',
        file: resolver.resolve('./runtime/devtools/page.vue')
      })
    })

    addCustomTab({
      name: 'theme-engine',
      title: 'Theme Engine',
      icon: 'carbon:paint-brush',
      category: 'modules',
      view: {
        type: 'iframe',
        src: '/_theme-engine-devtools'
      }
    }, nuxt)

    nuxt.hook('close', async () => {
      const report = await checkCssVars(nuxt.options.rootDir, themes, resolvedOptions.requiredCssVars)
      await fs.writeFile(cssReportTemplate.dst, serializeCssReport(report), 'utf8')

      for (const item of report.filter(entry => entry.missing.length > 0)) {
        logger.warn(`Theme "${item.theme}" is missing required CSS variables: ${item.missing.join(', ')}`)
      }
    })
  }
})
