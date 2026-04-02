<template>
  <aside class="promo-card">
    <strong>Aurora Exclusive</strong>
    <p>这是 Aurora 主题的专属组件，不接入全局 ThemeComponent 分发。</p>
  </aside>
</template>

<style scoped>
.promo-card {
  padding: 16px;
  border: 1px dashed var(--theme-accent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--theme-accent) 10%, transparent);
}

.promo-card strong,
.promo-card p {
  margin: 0;
}

.promo-card {
  display: grid;
  gap: 8px;
}
</style>
