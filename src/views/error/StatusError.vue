<template><div class="err-page"><p>{{ msg }}</p><el-button type="primary" @click="$router.push('/forms')">返回首页</el-button></div></template>
<script setup lang="ts">import { useRoute } from 'vue-router'; const msg = useRoute().query.msg as string ?? '操作失败'</script>
<style scoped lang="scss">.err-page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px}p{font-size:16px;color:#6B6560}</style>
