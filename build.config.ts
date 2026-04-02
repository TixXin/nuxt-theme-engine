import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/module'
  ],
  failOnWarn: false,
  externals: [
    '@tixxin/theme-contracts'
  ]
})
