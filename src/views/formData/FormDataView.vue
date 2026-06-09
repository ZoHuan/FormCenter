<template>
  <div class="data-page">
    <AppHeader />
    <div class="data-content">
      <div class="data-header">
        <el-button link @click="$router.push('/forms')">← 返回</el-button>
        <h2>{{ schema?.title }} — 提交数据</h2>
        <el-button type="primary" size="large" @click="handleExport">导出 Excel</el-button>
      </div>
      <div v-if="subStore.loading" class="skeleton-table">
        <div class="sk-row">
          <div class="sk-cell" v-for="i in 4" :key="i" />
        </div>
        <div class="sk-row" v-for="i in 5" :key="i">
          <div class="sk-cell" v-for="j in 4" :key="j" :style="{ width: 60 + Math.random() * 30 + '%' }" />
        </div>
      </div>
      <EmptyState v-else-if="subStore.submissions.length === 0" text="暂无提交数据" desc="分享表单链接，数据会出现在这里" />
      <template v-else>
        <div class="table-card">
          <el-table :data="pagedData" stripe
          ><el-table-column prop="submittedAt" label="提交时间" width="180"
            ><template #default="{ row }">{{ formatTime(row.submittedAt) }}</template></el-table-column
          ><el-table-column
            v-for="col in columns"
            :key="col.field"
            :prop="col.field"
            :label="col.title"
            min-width="120" /></el-table
        ><el-pagination
          v-if="subStore.submissions.length > pageSize"
          v-model:current-page="page"
          :page-size="pageSize"
          :total="subStore.submissions.length"
          layout="prev,pager,next"
        />
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { exportToExcel } from '@/utils/excel'
import AppHeader from '@/components/common/AppHeader.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const listStore = useFormListStore()
const subStore = useFormSubmissionStore()
const formId = route.params.id as string
const schema = computed(() => listStore.getById(formId))
const page = ref(1)
const pageSize = ref(10)

const columns = computed(() => {
  const txtTypes = new Set([
    'input',
    'textarea',
    'numeric',
    'serial-number',
    'date',
    'date-range',
    'chooser',
    'multi-chooser',
    'selection',
    'cascader',
    'tree',
    'rate',
    'image',
    'singleImage',
    'signature',
    'region',
    'tree-structure',
    'commitment',
    'relation',
    'QRCode',
  ])
  return (schema.value?.components ?? [])
    .filter((c) => txtTypes.has(c.type) && c.field)
    .map((c) => ({ field: c.field, title: c.label }))
})

const pagedData = computed(() =>
  subStore.submissions
    .slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
    .map((s) => ({ ...s.data, submittedAt: s.submittedAt })),
)

onMounted(() => {
  listStore.init()
  subStore.init(formId)
})

function handleExport() {
  if (subStore.submissions.length === 0) return ElMessage.warning('没有可导出数据')
  exportToExcel(
    columns.value,
    subStore.submissions.map((s) => ({ ...s.data, submittedAt: s.submittedAt })),
    schema.value?.title ?? 'export',
  )
  ElMessage.success('导出成功')
}
function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN')
}
</script>
<style scoped lang="scss">
.data-page {
  min-height: 100vh;
  background: var(--color-page);
}
.data-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}
.data-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.data-header h2 {
  font-size: 20px;
  font-weight: 600;
  flex: 1;
}

.table-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.skeleton-table {
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.sk-row {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-canvas);
  padding: 0 12px;

  &:last-child { border-bottom: none; }
}

.sk-cell {
  height: 14px;
  margin: 17px 0;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--color-canvas) 0%,
    var(--color-page) 40%,
    var(--color-canvas) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  flex: 1;
  min-width: 80px;

  &:not(:last-child) { margin-right: 12px; }
}

@keyframes skeleton-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
