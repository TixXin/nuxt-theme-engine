<script setup lang="ts">
import type { HomeLayoutProps } from '#theme-contracts'

defineProps<HomeLayoutProps>()
</script>

<template>
  <main class="base-layout">
    <header class="hero">
      <p class="eyebrow">Base Theme</p>
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>
    </header>

    <section class="content">
      <slot />
    </section>
  </main>
</template>

<style scoped>
.base-layout {
  padding: 0 24px 48px;
}

.hero {
  display: grid;
  gap: 8px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0;
  color: var(--theme-accent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

.hero h2,
.hero p {
  margin: 0;
}

.content {
  display: grid;
  gap: 16px;
}
</style>
