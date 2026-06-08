<template>
  <div class="state-container">
    <p class="state-title">{{ text }}</p>
    <p v-if="desc" class="state-desc">{{ desc }}</p>
    <button v-if="actionText" class="action-btn" @click="$emit('action')">{{ actionText }}</button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ text?: string; desc?: string; actionText?: string }>()
defineEmits(['action'])
</script>
<style scoped lang="scss">
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 8px;
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
