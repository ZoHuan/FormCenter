<template>
  <div class="list-page">
    <AppHeader />
    <div class="list-content">
      <div class="list-toolbar">
        <h1 class="page-title">表单管理</h1>
        <div class="toolbar-actions">
          <el-button type="primary" @click="handleCreate">新建表单</el-button>
          <el-button @click="showTemplateDialog = true">从模板创建</el-button>
        </div>
      </div>
      <div class="search-bar">
        <el-input v-model="store.keyword" placeholder="搜索表单名称..." clearable size="large" />
      </div>

      <LoadingState v-if="store.loading" text="加载中..." />
      <EmptyState
        v-else-if="store.filteredForms.length === 0 && !store.keyword"
        text="还没有表单"
        desc="创建你的第一个表单开始吧"
        action-text="新建表单"
        @action="handleCreate"
      />
      <div v-else class="table-wrap">
        <el-table :data="store.filteredForms" stripe>
          <el-table-column prop="title" label="表单名称" min-width="200">
            <template #default="{ row }"
              ><span class="form-name" @click="handleEdit(row.id)">{{ row.title || '未命名表单' }}</span></template
            >
          </el-table-column>
          <el-table-column label="字段数" width="80" align="center">
            <template #default="{ row }">{{ row.components?.length ?? 0 }}</template>
          </el-table-column>
          <el-table-column label="回复数" width="80" align="center">
            <template #default="{ row }">{{ getSubmissionCount(row.id) }}</template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="160">
            <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="240" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row.id)">编辑</el-button>
              <el-button v-if="row.status === 'draft'" link type="primary" @click="handlePublish(row)">发布</el-button>
              <el-button v-if="row.status === 'open'" link type="danger" @click="handleClose(row)">关闭</el-button>
              <el-button v-if="row.status === 'closed'" link type="primary" @click="handleReopen(row)">重新开启</el-button>
              <el-button v-if="row.status === 'open'" link type="primary" @click="handleFill(row.id)">填写</el-button>
              <el-button v-if="row.status === 'open'" link type="primary" @click="handleCopyLink(row.id)">复制链接</el-button>
              <el-button link type="primary" @click="handleData(row.id)">数据</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <p v-if="store.filteredForms.length === 0 && store.keyword" class="no-result">没有匹配的表单</p>
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
  margin-bottom: 20px;
  max-width: 360px;
}
.form-name {
  color: var(--color-primary);
  cursor: pointer;
}
.form-name:hover {
  color: var(--color-primary-hover);
}
.no-result {
  text-align: center;
  color: var(--color-text-muted);
  padding: 40px 0;
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.template-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  cursor: pointer;
  transition: all 0.15s;
}
.template-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
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
