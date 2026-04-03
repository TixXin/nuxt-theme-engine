<script setup lang="ts">
import type { HomeLayoutProps } from '#theme-contracts'

defineProps<HomeLayoutProps>()
</script>

<template>
  <div class="classic-layout">
    <slot name="nav" />
    <div class="classic-layout__body">
      <main class="classic-layout__main">
        <slot />
      </main>
      <aside class="classic-layout__sidebar">
        <slot name="aside" />
        <slot name="widgets" />
      </aside>
    </div>
    <slot name="footer" />
  </div>
</template>
