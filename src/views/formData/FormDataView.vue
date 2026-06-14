<template>
  <div class="data-page">
    <AppHeader />
    <div class="data-content">
      <div class="data-header">
        <div class="header-left">
          <el-button link @click="$router.push('/forms')">← 返回</el-button>
          <div class="header-info">
            <h2>{{ schema?.title }}</h2>
            <span class="header-badge">提交数据 · {{ subStore.submissions.length }} 条</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="handleCopyLink"><Copy :size="15" />复制链接</el-button>
          <el-button type="primary" size="large" @click="handleExport"><Download :size="16" />导出 Excel</el-button>
        </div>
      </div>

      <div v-if="subStore.loading" class="skeleton-table">
        <div class="sk-row"><div class="sk-cell" v-for="i in 5" :key="i" /></div>
        <div class="sk-row" v-for="i in 5" :key="i">
          <div class="sk-cell" v-for="j in 5" :key="j" :style="{ width: 40 + Math.random() * 40 + '%' }" />
        </div>
      </div>

      <EmptyState
        v-else-if="subStore.submissions.length === 0"
        text="暂无提交数据"
        desc="分享表单链接，填写者提交后数据会出现在这里"
        action-text="复制链接"
        @action="handleCopyLink"
      />

      <div v-else class="table-card">
        <el-table :data="pagedData" stripe>
          <el-table-column prop="submittedAt" label="提交时间" width="180">
            <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
          </el-table-column>
          <el-table-column
            v-for="col in columns"
            :key="col.field"
            :prop="col.field"
            :label="col.title"
            min-width="140"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-if="row[col.field] === undefined || row[col.field] === ''" class="cell-empty">—</span>
              <template v-else-if="Array.isArray(row[col.field])">
                <el-tag v-for="(item, i) in row[col.field]" :key="i" size="small" class="cell-tag">{{ item }}</el-tag>
              </template>
              <span v-else class="cell-value">{{ formatCellValue(col, row[col.field]) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="subStore.submissions.length > pageSize"
          v-model:current-page="page"
          :page-size="pageSize"
          :total="subStore.submissions.length"
          layout="prev,pager,next"
          class="data-pagination"
        />
      </div>
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
import { copyToClipboard } from '@/utils/clipboard'
import { Download, Copy } from 'lucide-vue-next'
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
  'rate',
  'file',
  'image',
  'signature',
  'tree-structure',
  'commitment',
  'relation',
  'QRCode',
])

const columns = computed(() =>
  (schema.value?.components ?? [])
    .filter((c) => txtTypes.has(c.type) && c.field)
    .map((c) => ({
      field: c.field,
      title: c.label,
      type: c.type,
      props: c.props as Record<string, unknown> | undefined,
    })),
)

const pagedData = computed(() =>
  subStore.submissions
    .slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
    .map((s) => ({ ...s.data, submittedAt: s.submittedAt })),
)

onMounted(() => {
  listStore.init()
  subStore.init(formId)
})

function formatCellValue(col: { type: string; props?: Record<string, unknown> }, val: unknown): string {
  if (typeof val === 'object' && val !== null) {
    return JSON.stringify(val)
  }
  if (col.type === 'chooser' || col.type === 'selection' || col.type === 'cascader') {
    const opts = col.props?.options as Array<{ label: string; value: string }> | undefined
    if (opts) {
      const found = opts.find((o) => o.value === val)
      if (found) return found.label
    }
  }
  if (col.type === 'file' || col.type === 'image' || col.type === 'signature') {
    if (typeof val === 'string' && val.length > 100) return '已上传'
  }
  return String(val ?? '')
}

function handleExport() {
  if (subStore.submissions.length === 0) return ElMessage.warning('没有可导出数据')
  exportToExcel(
    columns.value,
    subStore.submissions.map((s) => ({ ...s.data, submittedAt: s.submittedAt })),
    schema.value?.title ?? 'export',
  )
  ElMessage.success('导出成功')
}

function handleCopyLink() {
  copyToClipboard(`${window.location.origin}/fill/${formId}`)
  ElMessage.success('链接已复制')
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped lang="scss">
.data-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-page) 0%, #f5f3f0 100%);
}

.data-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

/* ── 头区 ── */
.data-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 48px;
    height: 3px;
    background: var(--color-primary);
    border-radius: 2px 2px 0 0;
  }
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .el-button {
    margin-top: 2px;
  }
}

.header-info {
  h2 {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    line-height: 1.35;
  }
}

.header-badge {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
  display: block;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;

  .el-button {
    height: 38px;
    font-weight: 500;
    border-radius: 10px;
  }
}

/* ── 表格卡片 ── */
.table-card {
  background: var(--color-card);
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(28, 25, 23, 0.04),
    0 4px 16px rgba(28, 25, 23, 0.06);
  border: 1px solid rgba(28, 25, 23, 0.04);
  overflow: hidden;

  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: #f8f9f7;
    font-size: 13px;

    th.el-table__cell {
      font-weight: 600;
      color: var(--color-text);
      border-bottom: 1px solid var(--color-border);
    }

    td.el-table__cell {
      border-bottom: 1px solid var(--color-canvas);
    }

    .el-table__body tr:hover > td {
      background: rgba(45, 106, 79, 0.02);
    }
  }
}

.cell-empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.cell-value {
  color: var(--color-text);
}

.cell-tag {
  margin: 1px 2px;

  & + & {
    margin-left: 2px;
  }
}

.data-pagination {
  display: flex;
  justify-content: center;
  padding: 16px 24px;
}

/* ── 骨架屏 ── */
.skeleton-table {
  background: var(--color-card);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);
}

.sk-row {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-canvas);
  padding: 0 16px;

  &:last-child {
    border-bottom: none;
  }
}

.sk-cell {
  height: 14px;
  margin: 17px 0;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-canvas) 0%, var(--color-page) 40%, var(--color-canvas) 80%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  flex: 1;
  min-width: 60px;

  &:not(:last-child) {
    margin-right: 12px;
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
