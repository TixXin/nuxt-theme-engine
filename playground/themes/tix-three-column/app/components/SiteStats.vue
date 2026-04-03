<script setup lang="ts">
import type { SiteStatsProps } from '#theme-contracts'

defineProps<SiteStatsProps>()

const heatmapLevels = [
  0,1,0,2,1,3,0,0,1,2,4,0,1,0,3,2,0,1,0,0,
  1,0,2,0,1,0,3,4,2,1,0,0,1,2,0,1,3,0,2,1,
  0,0,1,0,2,3,0,1,4,2,0,1,0,0,1,2,3,0,1,0,
  2,1,0,3,0,1,2,0,0,1,4,3,2,1,0,0,1,0,2,1,
  0,1,2,0,3,1,0,2,0,1,0,0,4,1,2,3,0,1,0,2,
  1,0,0,2,1,3,0,1,2,0,1,0,0,2,1,0,3,4,2,1
]
</script>

<template>
  <div class="tix-stats">
    <div class="tix-stats__header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
      站点统计
    </div>

    <div class="tix-stats__running">
      <div>
        <div class="tix-stats__running-label">站点已运营计</div>
        <div class="tix-stats__running-value">{{ stats.runningDays.toLocaleString() }} 天</div>
      </div>
      <div class="tix-stats__running-check">✓</div>
    </div>

    <div class="tix-stats__grid">
      <div class="tix-stats__item">
        <div class="tix-stats__item-value">{{ stats.postCount }}</div>
        <div class="tix-stats__item-label">文章</div>
      </div>
      <div class="tix-stats__item">
        <div class="tix-stats__item-value">{{ stats.viewCount }}</div>
        <div class="tix-stats__item-label">浏览</div>
      </div>
      <div class="tix-stats__item">
        <div class="tix-stats__item-value">{{ stats.commentCount }}</div>
        <div class="tix-stats__item-label">评论</div>
      </div>
      <div class="tix-stats__item">
        <div class="tix-stats__item-value">{{ stats.tagCount }}</div>
        <div class="tix-stats__item-label">标签</div>
      </div>
    </div>

    <div class="tix-stats__heatmap-header">
      <span class="tix-stats__heatmap-title">活跃度</span>
      <span class="tix-stats__heatmap-range">最近 6 月</span>
    </div>

    <div class="tix-stats__heatmap">
      <div
        v-for="(level, i) in heatmapLevels"
        :key="i"
        class="tix-stats__heatmap-cell"
        :class="{
          'tix-stats__heatmap-cell--l1': level === 1,
          'tix-stats__heatmap-cell--l2': level === 2,
          'tix-stats__heatmap-cell--l3': level === 3,
          'tix-stats__heatmap-cell--l4': level === 4
        }"
      />
    </div>

    <div class="tix-stats__legend">
      Less
      <span class="tix-stats__legend-cell tix-stats__heatmap-cell" />
      <span class="tix-stats__legend-cell tix-stats__heatmap-cell--l1" />
      <span class="tix-stats__legend-cell tix-stats__heatmap-cell--l2" />
      <span class="tix-stats__legend-cell tix-stats__heatmap-cell--l3" />
      <span class="tix-stats__legend-cell tix-stats__heatmap-cell--l4" />
      More
    </div>
  </div>
</template>
