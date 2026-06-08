<template>
  <div class="state-container">
    <p class="error-title">{{ text }}</p>
    <button v-if="actionText" class="retry-btn" @click="$emit('action')">{{ actionText }}</button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ text?: string; actionText?: string }>()
defineEmits(['action'])
</script>
<style scoped lang="scss">
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 16px;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.retry-btn {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    background: var(--color-primary-bg);
  }

  &:active {
    transform: scale(0.97);
  }
}
</style>
