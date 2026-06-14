<template>
  <div class="state-container">
    <div class="spinner" />
    <p v-if="text" class="state-text">{{ text }}</p>
  </div>
</template>
<script setup lang="ts">
defineProps<{ text?: string }>()
</script>
<style scoped lang="scss">
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
  gap: 16px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.state-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
