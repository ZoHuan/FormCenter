<template>
  <div class="err-page">
    <div class="err-card">
      <div class="err-icon">
        <Info :size="28" />
      </div>
      <h2 class="err-title">{{ title }}</h2>
      <p class="err-msg">{{ msg }}</p>
      <el-button type="primary" size="large" @click="$router.push('/forms')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Info } from 'lucide-vue-next'

const route = useRoute()
const msg = (route.query.msg as string) ?? '操作失败'

const title = computed(() => {
  if (msg.includes('未发布')) return '表单未发布'
  if (msg.includes('停止')) return '已停止收集'
  if (msg.includes('不存在')) return '表单不存在'
  return '出错了'
})
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
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-xs), var(--shadow-sm);
  border: 1px solid rgba(28, 25, 23, 0.04);

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text);
    margin: 20px 0 8px;
  }

  p {
    font-size: 15px;
    color: var(--color-text-secondary);
    margin: 0 0 32px;
    line-height: 1.6;
  }

  .el-button {
    height: 44px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-lg);
    padding: 0 32px;
  }
}

.err-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>
