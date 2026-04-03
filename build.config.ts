import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/module',
    './src/default-contracts'
  ],
  failOnWarn: false
})
