<template>
  <div class="data-page">
    <AppHeader />
    <div class="data-content">
      <!-- 头区 -->
      <div class="page-hero">
        <div class="hero-top">
          <el-button link class="back-btn" @click="$router.push('/forms')"
            ><ArrowLeft :size="16" />返回表单列表</el-button
          >
        </div>
        <div class="hero-main">
          <h1>{{ schema?.title }}</h1>
          <span class="hero-accent"></span>
        </div>
      </div>

      <!-- 骨架 -->
      <div v-if="subStore.loading" class="table-card">
        <div class="sk-row" v-for="i in 5" :key="i">
          <div class="sk-cell" v-for="j in 6" :key="j" :style="{ width: 60 + Math.random() * 30 + '%' }" />
        </div>
      </div>

      <!-- 空 -->
      <div v-else-if="subStore.submissions.length === 0" class="table-card table-empty">
        <div class="empty-icon"><Table2 :size="28" /></div>
        <p class="empty-title">暂无提交数据</p>
        <p class="empty-desc">分享链接后，填写者提交的数据会出现在这里</p>
        <el-button type="primary" @click="handleCopyLink">复制表单链接</el-button>
      </div>

      <!-- 数据表格 -->
      <div v-else class="table-card">
        <div class="table-toolbar">
          <span class="toolbar-count">共 {{ subStore.submissions.length }} 条记录</span>
          <el-button type="primary" size="default" @click="handleExport"><Download :size="15" />导出 Excel</el-button>
        </div>
        <div class="table-scroll">
          <el-table :data="pagedData" stripe>
            <el-table-column prop="submittedAt" label="提交时间" width="170">
              <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
            </el-table-column>
            <el-table-column
              v-for="col in columns"
              :key="col.field"
              :prop="col.field"
              :label="col.title"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <template v-if="row[col.field] === undefined || row[col.field] === ''">
                  <span class="cell-empty">—</span>
                </template>
                <template v-else-if="Array.isArray(row[col.field])">
                  <span v-for="(item, i) in row[col.field]" :key="i" class="cell-tag">{{ item }}</span>
                </template>
                <span v-else class="cell-value">{{ formatCellValue(col, row[col.field]) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="table-footer" v-if="subStore.submissions.length > pageSize">
          <el-pagination
            v-model:current-page="page"
            :page-size="pageSize"
            :total="subStore.submissions.length"
            layout="prev,pager,next"
          />
        </div>
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
import { Download, Table2, ArrowLeft } from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'

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
  if (typeof val === 'object' && val !== null) return JSON.stringify(val)
  if (col.type === 'chooser' || col.type === 'selection' || col.type === 'cascader') {
    const opts = col.props?.options as Array<{ label: string; value: string }> | undefined
    if (opts) {
      const found = opts.find((o) => o.value === val)
      if (found) return found.label
    }
  }
  if (col.type === 'file' || col.type === 'image' || col.type === 'signature') {
    if (typeof val === 'string' && val.length > 100) return '[已上传]'
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
  max-width: 1040px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

/* ── 头区 ── */
.page-hero {
  margin-bottom: 28px;
}

.hero-top {
  margin-bottom: 20px;
}

.back-btn {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  padding: 6px 12px;
  border-radius: 8px;
  gap: 6px;
  transition: all 0.15s;

  &:hover {
    color: var(--color-primary);
    background: rgba(45, 106, 79, 0.06);
  }
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 16px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.3;
  }
}

.hero-accent {
  width: 4px;
  height: 28px;
  background: var(--color-primary);
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── 表格卡片 ── */
.table-card {
  background: var(--color-card);
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(28, 25, 23, 0.03),
    0 4px 12px rgba(28, 25, 23, 0.05);
  border: 1px solid rgba(28, 25, 23, 0.04);
  overflow: hidden;
}

/* ── 工具栏 ── */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-canvas);

  .toolbar-count {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .el-button {
    height: 36px;
    font-weight: 600;
    border-radius: 8px;
    font-size: 13px;
  }
}

/* ── 表格 ── */
.table-scroll {
  overflow-x: auto;

  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: #f8faf6;
    font-size: 13px;

    th.el-table__cell {
      font-weight: 600;
      color: var(--color-text);
      border-bottom: 1px solid var(--color-border);
      padding: 12px 16px;
    }

    td.el-table__cell {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-canvas);
      color: var(--color-text);
    }

    .el-table__body tr:hover > td {
      background: rgba(45, 106, 79, 0.025);
    }
  }
}

.table-footer {
  display: flex;
  justify-content: center;
  padding: 16px 24px;
  border-top: 1px solid var(--color-canvas);
}

/* ── 单元格 ── */
.cell-empty {
  color: var(--color-text-muted);
}

.cell-value {
  color: var(--color-text);
}

.cell-tag {
  display: inline-block;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 500;
  padding: 1px 8px;
  border-radius: 4px;
  margin: 1px 3px 1px 0;
}

/* ── 空状态 ── */
.table-empty {
  padding: 64px 32px;
  text-align: center;

  .empty-icon {
    color: var(--color-text-muted);
    opacity: 0.4;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }

  .empty-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px;
  }

  .empty-desc {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0 0 24px;
  }

  .el-button {
    height: 40px;
    border-radius: 10px;
    font-weight: 600;
    padding: 0 24px;
  }
}

/* ── 骨架 ── */
.sk-row {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-canvas);
  padding: 14px 20px;

  &:last-child {
    border-bottom: none;
  }
}

.sk-cell {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-canvas) 0%, var(--color-page) 40%, var(--color-canvas) 80%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  flex: 1;
  min-width: 60px;

  &:not(:last-child) {
    margin-right: 16px;
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
