<template><div class="state-container"><div class="spinner" /><p v-if="text" class="state-text">{{ text }}</p></div></template>
<script setup lang="ts">defineProps<{ text?: string }>()</script>
<style scoped>
.state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 0; gap: 16px; }
.spinner { width: 24px; height: 24px; border: 2px solid #E8E5E0; border-top-color: #2858C8; border-radius: 50%; animation: spin 1s linear infinite; }
.state-text { font-size: 14px; color: #6B6560; }
@keyframes spin { to { transform: rotate(360deg) } }
</style>
