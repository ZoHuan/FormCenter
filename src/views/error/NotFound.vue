<template>
  <div class="err-page">
    <h1>404</h1>
    <p>页面未找到</p>
    <p class="err-desc">你访问的页面不存在或已删除</p>
    <el-button type="primary" @click="$router.push('/forms')">返回首页</el-button>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.err-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12px;
  text-align: center;
}
.err-page h1 {
  font-size: 72px;
  font-weight: 600;
  color: var(--color-text-muted);
  line-height: 1;
  margin-bottom: 4px;
}
.err-page p {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}
.err-desc {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-top: -4px;
  margin-bottom: 16px;
}
</style>
