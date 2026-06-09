<template>
  <div class="list-page">
    <AppHeader />
    <div class="list-content">
      <div class="list-toolbar">
        <h1 class="page-title">我的表单</h1>
        <span class="form-count" v-if="store.filteredForms.length">共 {{ store.filteredForms.length }} 个</span>
        <div class="toolbar-actions">
          <el-button type="primary" @click="handleCreate">新建表单</el-button>
          <el-button plain @click="showTemplateDialog = true">从模板创建</el-button>
        </div>
      </div>
      <div class="search-bar">
        <el-input v-model="store.keyword" placeholder="搜索表单名称..." clearable size="large" />
      </div>

      <div v-if="store.loading" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="sk-line sk-title" :style="{ width: 35 + Math.floor(Math.random() * 25) + '%' }" />
          <div class="sk-line sk-meta" :style="{ width: 55 + Math.floor(Math.random() * 25) + '%' }" />
        </div>
      </div>
      <EmptyState
        v-else-if="store.filteredForms.length === 0 && !store.keyword"
        text="开始创建你的第一个表单"
        desc="搭表单就像发朋友圈，拖一拖就完成"
        action-text="新建表单"
        @action="handleCreate"
      />
      <div v-else class="form-cards">
        <div v-for="(row, idx) in store.filteredForms" :key="row.id" class="form-card" :data-status="row.status" :style="{ animationDelay: idx * 0.06 + 's' }">
          <div class="fc-body" @click="handleEdit(row.id)">
            <div class="fc-header">
              <div class="fc-title">{{ row.title || '未命名表单' }}</div>
              <div class="fc-actions" @click.stop>
                <el-button v-if="row.status === 'draft'" size="small" @click="handleEdit(row.id)"><Pencil :size="14" />编辑</el-button>
                <el-button v-if="row.status === 'draft'" size="small" type="primary" @click="handlePublish(row)"><Send :size="14" />发布</el-button>
                <el-button v-if="row.status === 'open'" size="small" @click="handleData(row.id)"><Table2 :size="14" />数据</el-button>
                <el-button v-if="row.status === 'closed'" size="small" @click="handleData(row.id)"><Table2 :size="14" />数据</el-button>
                <el-button v-if="row.status === 'closed'" size="small" type="primary" plain @click="handleReopen(row)"><RotateCcw :size="14" />重开</el-button>
                <el-dropdown trigger="click" @command="(cmd: string) => handleCardAction(cmd, row)">
                  <el-button size="small" class="fc-more"><MoreHorizontal :size="16" /></el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="row.status === 'open' || row.status === 'closed'" command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item v-if="row.status === 'open'" command="fill">填写</el-dropdown-item>
                      <el-dropdown-item v-if="row.status === 'open'" command="close">关闭收集</el-dropdown-item>
                      <el-dropdown-item v-if="row.status === 'draft' || row.status === 'closed'" command="data">查看数据</el-dropdown-item>
                      <el-dropdown-item v-if="row.status === 'draft'" command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="fc-meta">
              <span v-if="row.status === 'open'" class="status-tag status-open">收集中</span>
              <span v-if="row.status === 'draft'" class="status-tag status-draft">草稿</span>
              <span v-if="row.status === 'closed'" class="status-tag status-closed">已关闭</span>
              <span>{{ row.components?.length ?? 0 }} 个字段</span>
              <span class="dot">·</span>
              <span>{{ getSubmissionCount(row.id) }} 条回复</span>
              <span class="dot">·</span>
              <span>{{ formatTime(row.updatedAt) }}</span>
            </div>
          </div>
          <!-- 收集中：全宽主按钮 -->
          <div v-if="row.status === 'open'" class="fc-primary-action">
            <el-button type="primary" @click.stop="handleCopyLink(row.id)">
              <Copy v-if="copiedId !== row.id" :size="15" />
              <CheckCircle v-else :size="15" />
              {{ copiedId === row.id ? '已复制' : '复制链接' }}
            </el-button>
          </div>
        </div>
        <p v-if="store.filteredForms.length === 0 && store.keyword" class="no-result">没有找到「{{ store.keyword }}」相关的表单</p>
      </div>
    </div>

    <el-dialog v-model="showTemplateDialog" title="选择模板" width="680px">
      <div class="template-grid">
        <div v-for="(tpl, key) in templates" :key="key" class="template-card" @click="handleTemplate(key)">
          <div class="tpl-icon">
            <component :is="tplIcons[key]" :size="24" />
          </div>
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
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { copyToClipboard } from '@/utils/clipboard'
import { templates } from '@/utils/templates'
import { Copy, CheckCircle, MoreHorizontal, Pencil, Send, Table2, RotateCcw, Trash2, CalendarDays, PartyPopper, BarChart3, ClipboardList } from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { FormSchema } from '@/types'

const router = useRouter()
const store = useFormListStore()
const showTemplateDialog = ref(false)
const copiedId = ref<string | null>(null)
const tplIcons: Record<string, any> = { leave: CalendarDays, event: PartyPopper, survey: BarChart3, collect: ClipboardList }

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
function handleCreate() {
  router.push('/formDesigner')
}
function handleEdit(id: string) {
  router.push(`/formDesigner/${id}`)
}
function handleCardAction(cmd: string, row: FormSchema) {
  switch (cmd) {
    case 'edit': handleEdit(row.id); break
    case 'publish': handlePublish(row); break
    case 'close': handleClose(row); break
    case 'reopen': handleReopen(row); break
    case 'fill': handleFill(row.id); break
    case 'copyLink': handleCopyLink(row.id); break
    case 'data': handleData(row.id); break
    case 'delete': handleDelete(row); break
  }
}
function handleFill(id: string) {
  window.open(`/fill/${id}`)
}
async function handleCopyLink(id: string) {
  const ok = await copyToClipboard(`${window.location.origin}/fill/${id}`)
  if (ok) {
    copiedId.value = id
    setTimeout(() => { copiedId.value = null }, 2000)
  }
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
  background: linear-gradient(180deg, var(--color-page) 0%, #F5F3F0 100%);
}
.list-content { max-width: 780px; margin: 0 auto; padding: 48px 24px 64px; }

/* ── 品牌装饰条 ── */
.list-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 40px; padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  &::after {
    content: ''; position: absolute; bottom: -1px; left: 0;
    width: 60px; height: 3px; background: var(--color-primary); border-radius: 0 0 2px 2px;
  }
}
.page-title { font-size: 30px; font-weight: 600; display: flex; align-items: baseline; gap: 12px; }
.form-count { font-size: 14px; color: var(--color-text-muted); font-weight: 400; }
.toolbar-actions { display: flex; gap: 12px; }

/* ── 搜索：focus 绿底发光 ── */
.search-bar { margin-bottom: 32px; max-width: 400px;
  :deep(.el-input__wrapper) {
    border-radius: var(--radius-full); box-shadow: inset 0 0 0 1px var(--color-border);
    transition: box-shadow 0.25s ease-out, background 0.25s;
  }
  :deep(.el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 3px rgba(45,106,79,0.08), inset 0 0 0 1px var(--color-primary);
    background: var(--color-card);
  }
}

/* ── 卡片容器：单列 ── */
.form-cards { display: flex; flex-direction: column; gap: 12px; }

/* ── 基础卡片 ── */
.form-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  animation: card-enter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1.2) both;
  border-left: 4px solid transparent;
  transition: all 0.25s ease-out;

  &:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--color-border-hover);
  }

  /* ── 状态差异 ── */
  &[data-status='open'] {
    border-left-color: var(--color-primary);
    background: var(--color-primary-bg);
    &:hover { box-shadow: 0 4px 16px rgba(45,106,79,0.10); }
  }
  &[data-status='closed'] {
    border-left-color: var(--color-border-hover);
    .fc-title { color: var(--color-text-muted); }
  }
  &[data-status='draft'] {
    border-left-color: var(--color-border-hover);
  }
}

.fc-body {
  padding: 20px 24px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.fc-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}

.fc-title {
  font-size: 16px; font-weight: 600; color: var(--color-text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 16px;
}

.fc-actions {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  .el-button { gap: 4px; transition: transform 0.1s ease-out; }
  .el-button:active { transform: scale(0.97); }
  .fc-more { border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
  .fc-more:active { transform: scale(0.97); }
}

.fc-meta {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; color: var(--color-text-secondary);
  .dot { color: var(--color-text-muted); margin: 0 2px; }
}

.fc-status {
  font-size: 12px; font-weight: 500; padding: 1px 8px; border-radius: var(--radius-full); line-height: 1.6;
  &-open { background: var(--color-success-bg); color: var(--color-success); animation: status-breathe 3s ease-in-out infinite; }
  &-draft { background: var(--color-canvas); color: var(--color-text-muted); }
  &-closed { background: var(--color-canvas); color: var(--color-text-muted); }
}

@keyframes status-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.82; }
}

/* ── 主操作按钮（全宽） ── */
.fc-primary-action {
  padding: 0 24px 16px;
  .el-button {
    width: 100%; height: 42px; font-size: 15px; font-weight: 500;
    border-radius: var(--radius-md); gap: 6px;
    transition: transform 0.1s ease-out;
    &:active { transform: scale(0.98); }
  }
}

/* ── 空状态 ── */
.no-result { text-align: center; color: var(--color-text-muted); padding: 48px 0; font-size: 15px; }

@keyframes card-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── 骨架屏 ── */
.skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.skeleton-card { height: 76px; padding: 20px 24px; background: var(--color-card); border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
.sk-line { height: 14px; border-radius: 4px;
  background: linear-gradient(90deg, var(--color-canvas) 0%, var(--color-page) 40%, var(--color-canvas) 80%);
  background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
.sk-title { width: 40%; margin-bottom: 10px; }
.sk-meta { width: 65%; }
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; } 100% { background-position: 200% 0; }
}

/* ── 模板弹窗 ── */
.template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.template-card {
  border: 2px solid var(--color-border); border-radius: var(--radius-lg); padding: 24px 20px;
  cursor: pointer; transition: all 0.2s ease-out; text-align: center;
}
.template-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.tpl-icon { color: var(--color-primary); margin-bottom: 12px; display: flex; justify-content: center; }
.tpl-name { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.tpl-desc { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 10px; }
.tpl-count { font-size: 12px; color: var(--color-primary); font-weight: 500; }
</style>
