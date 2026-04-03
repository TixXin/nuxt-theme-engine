<script setup lang="ts">
import type { PostListProps } from '#theme-contracts'

defineProps<PostListProps>()
</script>

<template>
  <section class="post-list">
    <article v-for="postItem in posts" :key="postItem.id" class="post-card">
      <h3>{{ postItem.title }}</h3>
      <p>{{ postItem.excerpt }}</p>
      <small>
        {{ postItem.likesCount ?? 0 }} likes ·
        {{ postItem.commentsCount ?? 0 }} comments ·
        {{ postItem.readingTime ?? 'n/a' }}
      </small>
    </article>
  </section>
</template>

<style scoped>
.post-list {
  display: grid;
  gap: 12px;
}

.post-card {
  padding: 16px;
  border: 1px solid var(--theme-muted);
  border-radius: 16px;
  background: color-mix(in srgb, var(--theme-bg) 82%, white 18%);
}

.post-card h3,
.post-card p,
.post-card small {
  margin: 0;
}

.post-card {
  display: grid;
  gap: 8px;
}
</style>
