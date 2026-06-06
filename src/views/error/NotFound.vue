<template><div class="err-page"><h1>404</h1><p>页面不存在</p><el-button type="primary" @click="$router.push('/forms')">返回首页</el-button></div></template>
<script setup lang="ts"></script>
<style scoped lang="scss">.err-page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px}.err-page h1{font-size:48px;color:var(--color-text-muted)}</style>
