<template>
  <div class="state-container">
    <component :is="icon" class="state-icon" :size="48" stroke-width="2" />
    <p class="state-title">{{ text }}</p>
    <p v-if="desc" class="state-desc">{{ desc }}</p>
    <button v-if="actionText" class="action-btn" @click="$emit('action')">{{ actionText }}</button>
  </div>
</template>
<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
defineProps<{ text?: string; desc?: string; actionText?: string; icon?: any }>()
defineEmits(['action'])
const icon = FileText
</script>
<style scoped lang="scss">
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 8px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image:
      linear-gradient(var(--color-primary) 1px, transparent 1px),
      linear-gradient(90deg, var(--color-primary) 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: 20px 20px;
    pointer-events: none;
  }
}

.state-title {
  font-size: 16px;
  color: var(--color-text-secondary);
  font-weight: 500;
}
.state-desc {
  font-size: 14px;
  color: var(--color-text-muted);
}

.action-btn {
  margin-top: 16px;
  padding: 8px 24px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: var(--color-card);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    background: var(--color-primary-hover);
  }

  &:active {
    transform: scale(0.97);
  }
}
</style>
