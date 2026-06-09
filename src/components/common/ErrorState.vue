<template>
  <div class="state-container">
    <component :is="icon" class="state-icon" :size="48" stroke-width="2" />
    <p class="error-title">{{ text }}</p>
    <p v-if="desc" class="error-desc">{{ desc }}</p>
    <button v-if="actionText" class="retry-btn" @click="$emit('action')">{{ actionText }}</button>
  </div>
</template>
<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
defineProps<{ text?: string; desc?: string; actionText?: string }>()
defineEmits(['action'])
const icon = AlertTriangle
</script>
<style scoped lang="scss">
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 16px;
}

.state-icon {
  color: var(--color-warning);
  margin-bottom: 8px;
}
.error-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.error-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: -4px;
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
