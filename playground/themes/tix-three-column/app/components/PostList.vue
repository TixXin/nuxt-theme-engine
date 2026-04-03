<script setup lang="ts">
import type { PostListProps } from '#theme-contracts'

defineProps<PostListProps>()
</script>

<template>
  <div class="tix-post-list">
    <template v-if="posts.length">
      <div v-for="post in posts" :key="post.id" class="tix-post-item">
        <p class="tix-post-item__title">{{ post.title }}</p>
        <div class="tix-post-item__meta">
          <span v-if="post.readingTime">{{ post.readingTime }}</span>
          <span v-if="post.likesCount">♥ {{ post.likesCount }}</span>
          <span v-if="post.commentsCount">💬 {{ post.commentsCount }}</span>
        </div>
      </div>
    </template>
    <div v-else class="tix-post-list__placeholder">
      <svg class="tix-post-list__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
      <h3 class="tix-post-list__placeholder-title">页面建设中</h3>
      <p class="tix-post-list__placeholder-desc">主内容正在设计中，敬请期待...</p>
    </div>
  </div>
</template>
