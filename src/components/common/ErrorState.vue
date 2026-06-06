<template><div class="state-container"><p class="error-title">{{ text }}</p><button v-if="actionText" class="retry-btn" @click="$emit('action')">{{ actionText }}</button></div></template>
<script setup lang="ts">defineProps<{ text?: string; actionText?: string }>(); defineEmits(['action'])</script>
<style scoped>
.state-container { display: flex; flex-direction: column; align-items: center; padding: 64px 0; gap: 16px; }
.error-title { font-size: 16px; font-weight: 600; color: #1A1814; }
.retry-btn { padding: 8px 20px; border-radius: 6px; border: 1.5px solid #2858C8; background: transparent; color: #2858C8; font-size: 14px; cursor: pointer; }
.retry-btn:hover { background: #EBF1FB; }
</style>
