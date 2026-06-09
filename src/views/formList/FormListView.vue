<template>
  <div class="list-page">
    <AppHeader />
    <div class="list-content">
      <div class="list-toolbar">
        <h1 class="page-title">我的表单</h1>
        <div class="toolbar-actions">
          <el-button type="primary" @click="handleCreate">新建表单</el-button>
          <el-button @click="showTemplateDialog = true">从模板创建</el-button>
        </div>
      </div>
      <div class="search-bar">
        <el-input v-model="store.keyword" placeholder="搜索表单名称..." clearable size="large" />
      </div>

      <div v-if="store.loading" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="sk-line sk-title" />
          <div class="sk-line sk-meta" />
        </div>
      </div>
      <EmptyState
        v-else-if="store.filteredForms.length === 0 && !store.keyword"
        text="还没有表单"
        desc="创建你的第一个表单开始吧"
        action-text="新建表单"
        @action="handleCreate"
      />
      <div v-else class="form-cards">
        <div v-for="row in store.filteredForms" :key="row.id" class="form-card" :data-status="row.status" @click="handleEdit(row.id)">
          <div class="fc-left">
            <div class="fc-title">{{ row.title || '未命名表单' }}</div>
            <div class="fc-meta">
              <span v-if="row.status === 'open'" class="status-tag status-open">收集中</span>
              <span v-if="row.status === 'draft'" class="status-tag status-draft">草稿</span>
              <span>{{ row.components?.length ?? 0 }} 个字段</span>
              <span class="dot">·</span>
              <span>{{ getSubmissionCount(row.id) }} 条回复</span>
              <span class="dot">·</span>
              <span>{{ formatTime(row.updatedAt) }}</span>
            </div>
          </div>
          <div class="fc-actions" @click.stop>
            <el-button link type="primary" @click="handleEdit(row.id)">编辑</el-button>
            <el-button v-if="row.status === 'draft'" link type="primary" @click="handlePublish(row)">发布</el-button>
            <el-button v-if="row.status === 'open'" link type="danger" @click="handleClose(row)">关闭</el-button>
            <el-button v-if="row.status === 'closed'" link type="primary" @click="handleReopen(row)">重新开启</el-button>
            <el-button v-if="row.status === 'open'" link type="primary" @click="handleFill(row.id)">填写</el-button>
            <el-button v-if="row.status === 'open'" link type="primary" @click="handleCopyLink(row.id)">复制链接</el-button>
            <el-button link type="primary" @click="handleData(row.id)">数据</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </div>
        </div>
        <p v-if="store.filteredForms.length === 0 && store.keyword" class="no-result">没有找到「{{ store.keyword }}」相关的表单</p>
      </div>
    </div>

    <el-dialog v-model="showTemplateDialog" title="选择模板" width="680px">
      <div class="template-grid">
        <div v-for="(tpl, key) in templates" :key="key" class="template-card" @click="handleTemplate(key)">
          <div class="tpl-name">{{ tpl.title }}</div>
          <div class="tpl-desc">{{ tpl.description }}</div>
          <div class="tpl-count">{{ tpl.components.length }} 个字段</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { copyToClipboard } from '@/utils/clipboard'
import { templates } from '@/utils/templates'
import AppHeader from '@/components/common/AppHeader.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { FormSchema } from '@/types'

const router = useRouter()
const store = useFormListStore()
const showTemplateDialog = ref(false)

onMounted(() => store.init())

function getSubmissionCount(formId: string): number {
  try {
    const data = localStorage.getItem('formcenter_submissions_' + formId)
    return data ? JSON.parse(data).length : 0
  } catch { return 0 }
}
function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
function statusType(s: string) {
  return s === 'open' ? 'success' : s === 'closed' ? 'danger' : 'warning'
}
function statusLabel(s: string) {
  return s === 'open' ? '收集中' : s === 'closed' ? '已关闭' : '草稿'
}

function handleCreate() {
  router.push('/formDesigner')
}
function handleEdit(id: string) {
  router.push(`/formDesigner/${id}`)
}
function handleFill(id: string) {
  window.open(`/fill/${id}`)
}
async function handleCopyLink(id: string) {
  const ok = await copyToClipboard(`${window.location.origin}/fill/${id}`)
  ElMessage[ok ? 'success' : 'error'](ok ? '链接已复制' : '复制失败')
}
function handleData(id: string) {
  router.push(`/forms/${id}/responses`)
}
async function handleDelete(row: FormSchema) {
  try {
    await ElMessageBox.confirm(
      `删除后将清除「${row.title}」的表单定义、所有提交数据和草稿。此操作不可恢复。`,
      '确认删除',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' },
    )
    store.remove(row.id)
    ElMessage.success('已删除')
  } catch {}
}
function handleTemplate(key: string) {
  showTemplateDialog.value = false
  router.push({ path: '/formDesigner', query: { template: key } })
}

function handlePublish(row: FormSchema) {
  if ((row.components ?? []).length === 0) return ElMessage.warning('请先添加组件')
  store.updateStatus(row.id, 'open')
  ElMessage.success('已发布，可通过链接收集数据')
}

function handleClose(row: FormSchema) {
  store.updateStatus(row.id, 'closed')
  ElMessage.success('已停止收集')
}

function handleReopen(row: FormSchema) {
  store.updateStatus(row.id, 'open')
  ElMessage.success('已重新开启收集')
}
</script>

<style scoped lang="scss">
.list-page {
  min-height: 100vh;
  background: var(--color-page);
}
.list-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}
.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 30px;
  font-weight: 600;
}
.toolbar-actions {
  display: flex;
  gap: 12px;
}
.search-bar {
  margin-bottom: 24px;
  max-width: 360px;

  :deep(.el-input__wrapper) {
    border-radius: var(--radius-full);
    box-shadow: inset 0 0 0 1px var(--color-border);
  }
}
.form-name {
  color: var(--color-primary);
  cursor: pointer;
}
.form-name:hover {
  color: var(--color-primary-hover);
}

.form-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.form-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all 0.15s ease-out;
  border-left: 4px solid transparent;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }

  &:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--color-border-hover);
    transform: translateY(-1px);
  }

  &[data-status='open'] {
    border-left-color: var(--color-success);
  }
  &[data-status='draft'] {
    border-left-color: var(--color-border-hover);
  }
}

.fc-left {
  flex: 1;
  min-width: 0;
}

.fc-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}

.fc-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);

  .dot {
    color: var(--color-text-muted);
    margin: 0 2px;
  }
}

.fc-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
  overflow-x: auto;
  max-width: 320px;

  .form-card:hover & {
    opacity: 1;
  }
}
.no-result {
  text-align: center;
  color: var(--color-text-muted);
  padding: 40px 0;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-card {
  height: 76px;
  padding: 16px 20px;
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.sk-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--color-canvas) 0%,
    var(--color-page) 40%,
    var(--color-canvas) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.sk-title {
  width: 40%;
  margin-bottom: 10px;
}

.sk-meta {
  width: 65%;
}

@keyframes skeleton-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.template-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.2s ease-out;
}
.template-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}
.tpl-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}
.tpl-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
.tpl-count {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
