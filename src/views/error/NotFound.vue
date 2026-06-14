<template>
  <div class="err-page">
    <div class="err-card">
      <h1>404</h1>
      <p>页面未找到</p>
      <p class="err-desc">你访问的页面不存在或已删除</p>
      <el-button type="primary" size="large" @click="$router.push('/forms')">返回首页</el-button>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
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

  h1 {
    font-size: 72px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-primary) 0%, #3d7e5c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin: 0 0 12px;
  }

  p {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px;
  }
}

.err-desc {
  font-size: 14px !important;
  font-weight: 400 !important;
  color: var(--color-text-secondary) !important;
  margin: 0 0 28px !important;
  line-height: 1.5;
}

.el-button {
  height: 44px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  padding: 0 28px;
}
</style>
