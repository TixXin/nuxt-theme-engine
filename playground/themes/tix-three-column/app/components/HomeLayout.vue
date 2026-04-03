<script setup lang="ts">
import type { HomeLayoutProps } from '#theme-contracts'

defineProps<HomeLayoutProps>()
</script>

<template>
  <div class="tix-layout">
    <aside class="tix-layout__sidebar">
      <slot name="nav" />
      <slot name="widgets" />
    </aside>
    <div class="tix-layout__center">
      <main class="tix-layout__content">
        <slot />
      </main>
      <slot name="footer" />
    </div>
    <aside class="tix-layout__aside">
      <slot name="aside" />
    </aside>
  </div>
</template>
