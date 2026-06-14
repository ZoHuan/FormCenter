<template>
  <div class="err-page">
    <div class="err-card">
      <div class="err-icon">
        <AlertCircle :size="28" />
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
import { AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const msg = (route.query.msg as string) ?? '操作失败'

const title = computed(() => {
  const m = msg
  if (m.includes('未发布')) return '表单未发布'
  if (m.includes('停止收集') || m.includes('已关闭')) return '已停止收集'
  if (m.includes('不存在')) return '表单不存在'
  if (m.includes('失败')) return '操作失败'
  return '提示'
})
</script>

<style scoped lang="scss">
.err-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(45, 106, 79, 0.04) 0%, transparent 60%),
    linear-gradient(180deg, var(--color-page) 0%, #f5f3f0 100%);
  padding: 24px;
}

.err-card {
  background: var(--color-card);
  border-radius: 24px;
  padding: 64px 48px 48px;
  text-align: center;
  max-width: 420px;
  width: 100%;
  box-shadow:
    0 2px 4px rgba(28, 25, 23, 0.03),
    0 8px 24px rgba(28, 25, 23, 0.06),
    0 24px 64px rgba(28, 25, 23, 0.04);
  border: 1px solid rgba(28, 25, 23, 0.04);
  border-top: 3px solid var(--color-warning);
}

.err-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.12);
}

.err-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px;
}

.err-msg {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 32px;
}

.el-button {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  padding: 0 32px;
}
</style>
