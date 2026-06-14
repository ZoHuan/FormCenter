<template>
  <div class="err-page">
    <div class="err-card">
      <div class="err-icon"><AlertCircle :size="32" /></div>
      <h2>出错了</h2>
      <p>{{ msg }}</p>
      <el-button type="primary" size="large" @click="$router.push('/forms')">返回首页</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'
const msg = (useRoute().query.msg as string) ?? '操作失败'
</script>
<style scoped lang="scss">
.err-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--color-page) 0%, #f5f3f0 100%);
  padding: 24px;
}

.err-card {
  background: var(--color-card);
  border-radius: 24px;
  padding: 56px 48px;
  text-align: center;
  max-width: 440px;
  width: 100%;
  box-shadow:
    0 2px 4px rgba(28, 25, 23, 0.03),
    0 8px 24px rgba(28, 25, 23, 0.06);

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text);
    margin: 20px 0 8px;
  }

  p {
    font-size: 15px;
    color: var(--color-text-secondary);
    margin: 0 0 28px;
    line-height: 1.5;
  }

  .el-button {
    height: 44px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    padding: 0 28px;
  }
}

.err-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef3c7;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>
