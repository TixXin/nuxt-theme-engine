<script setup lang="ts">
import type { PostListProps } from '@tixxin/theme-contracts'
import PromoCard from './PromoCard.vue'

defineProps<PostListProps>()
</script>

<template>
  <section class="aurora-list">
    <PromoCard />

    <article v-for="postItem in posts" :key="postItem.id" class="aurora-card">
      <div>
        <p class="badge">Aurora</p>
        <h3>{{ postItem.title }}</h3>
      </div>

      <p>{{ postItem.excerpt }}</p>

      <footer>
        <span>{{ postItem.likesCount ?? 0 }} likes</span>
        <span>{{ postItem.commentsCount ?? 0 }} comments</span>
        <span>{{ postItem.readingTime ?? 'n/a' }}</span>
      </footer>
    </article>
  </section>
</template>

<style scoped>
.aurora-list {
  display: grid;
  gap: 16px;
}

.aurora-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--theme-muted);
  border-radius: 20px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--theme-accent) 14%, transparent), transparent 55%),
    color-mix(in srgb, var(--theme-bg) 85%, white 15%);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.2);
}

.badge,
.aurora-card h3,
.aurora-card p,
.aurora-card span {
  margin: 0;
}

.badge {
  color: var(--theme-accent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

footer {
  display: flex;
  gap: 16px;
  color: var(--theme-muted);
  flex-wrap: wrap;
}
</style>
