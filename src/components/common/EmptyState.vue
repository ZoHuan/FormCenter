<template><div class="state-container"><p class="state-title">{{ text }}</p><p v-if="desc" class="state-desc">{{ desc }}</p><button v-if="actionText" class="action-btn" @click="$emit('action')">{{ actionText }}</button></div></template>
<script setup lang="ts">defineProps<{ text?: string; desc?: string; actionText?: string }>(); defineEmits(['action'])</script>
<style scoped>
.state-container { display: flex; flex-direction: column; align-items: center; padding: 64px 0; gap: 8px; }
.state-title { font-size: 16px; color: #6B6560; font-weight: 500; }
.state-desc { font-size: 14px; color: #9C9790; }
.action-btn { margin-top: 12px; padding: 8px 20px; border-radius: 6px; border: none; background: #2858C8; color: #fff; font-size: 14px; cursor: pointer; }
.action-btn:hover { background: #4A80D5; }
</style>
