import { watchEffect } from 'vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { useThemeEngine } from '../composables/useThemeEngine'

export default defineNuxtPlugin(() => {
  const { currentTheme } = useThemeEngine()

  watchEffect(() => {
    document.documentElement.dataset.theme = currentTheme.value
  })
})
