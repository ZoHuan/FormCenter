<template>
  <div class="skeleton" :style="{ width, height }" />
</template>

<script setup lang="ts">
defineProps<{ width?: string; height?: string }>()
</script>

<style scoped lang="scss">
.skeleton {
  background: linear-gradient(90deg, var(--color-canvas) 25%, var(--color-border) 50%, var(--color-canvas) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
