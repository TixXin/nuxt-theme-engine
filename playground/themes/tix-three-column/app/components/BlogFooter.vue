<script setup lang="ts">
import type { BlogFooterProps } from '@tixxin/theme-contracts'

const props = withDefaults(defineProps<BlogFooterProps>(), {
  copyright: '2026 TixXin Blog. All rights reserved.',
  poweredBy: 'Nuxt & Vue'
})
</script>

<template>
  <footer class="tix-footer">
    <div class="tix-footer__left">
      <span>&copy; {{ props.copyright }}</span>
      <template v-if="props.links?.length">
        <a
          v-for="link in props.links"
          :key="link.url"
          :href="link.url"
          class="tix-footer__link"
        >{{ link.label }}</a>
      </template>
    </div>
    <div class="tix-footer__right">
      <span class="tix-footer__powered">
        Powered by <strong>{{ props.poweredBy }}</strong>
      </span>
      <span class="tix-footer__status">
        <span class="tix-footer__status-dot" />
        All Systems Operational
      </span>
    </div>
  </footer>
</template>
