<script setup lang="ts">
import type { PostDetailProps } from '@tixxin/theme-contracts'

defineProps<PostDetailProps>()
</script>

<template>
  <article class="post-detail">
    <header>
      <h3>{{ post.title }}</h3>
      <p>{{ post.excerpt }}</p>
    </header>

    <p>{{ post.content }}</p>
  </article>
</template>

<style scoped>
.post-detail {
  display: grid;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--theme-muted);
  border-radius: 16px;
  background: color-mix(in srgb, var(--theme-accent) 10%, transparent);
}

.post-detail h3,
.post-detail p {
  margin: 0;
}
</style>
