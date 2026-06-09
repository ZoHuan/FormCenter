<template>
  <div class="err-page">
    <AlertCircle :size="40" class="err-icon" />
    <p>{{ msg }}</p>
    <el-button type="primary" @click="$router.push('/forms')">返回首页</el-button>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'
const msg = (useRoute().query.msg as string) ?? '操作失败'
</script>
<style scoped lang="scss">
.err-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  text-align: center;
  padding: 24px;
}
.err-page .icon {
  width: 48px;
  height: 48px;
  color: var(--color-warning);
  margin-bottom: 8px;
}
p {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}
</style>
