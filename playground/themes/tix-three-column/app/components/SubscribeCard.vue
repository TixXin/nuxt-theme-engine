<script setup lang="ts">
import type { SubscribeCardProps } from '#theme-contracts'

const props = withDefaults(defineProps<SubscribeCardProps>(), {
  description: '获取最新文章和技术分享，不会发送垃圾邮件。',
  placeholder: '输入您的邮箱...'
})
</script>

<template>
  <div class="tix-subscribe">
    <div class="tix-subscribe__header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      订阅更新
    </div>
    <p class="tix-subscribe__desc">{{ props.description }}</p>
    <input class="tix-subscribe__input" type="email" :placeholder="props.placeholder">
    <button class="tix-subscribe__btn">立即订阅</button>
  </div>
</template>
