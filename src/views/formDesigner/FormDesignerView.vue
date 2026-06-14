<template>
  <div class="designer-page">
    <div class="toolbar">
      <el-button link @click="handleBack">← 返回</el-button>
      <div class="title-area">
        <input v-model="formTitle" class="title-input" placeholder="请输入表单标题" @blur="onTitleBlur" />
        <input v-model="formDesc" class="desc-input" placeholder="添加描述（选填）" @blur="onDescBlur" />
      </div>
      <div class="toolbar-right">
        <el-button @click="showPreview = true">预览</el-button>
        <el-button plain @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </div>
    </div>
    <div class="designer-body">
      <div class="panel-left">
        <ComponentPalette @add="handleAddComponent" />
      </div>
      <div class="canvas-area">
        <DesignerCanvas
          :components="store.components"
          :selectedId="store.selectedId"
          @select="store.selectComponent"
          @remove="handleRemoveComponent"
          @move="handleMoveComponent"
          @copy="handleCopyComponent"
        />
      </div>
      <div class="panel-right">
        <PropertyPanel
          v-if="store.selectedComponent"
          :component="store.selectedComponent"
          :all-components="store.components"
          @update="(patch) => store.updateComponent(store.selectedComponent!.id, patch)"
        />
        <div v-else class="no-select">
          <div class="no-select-icon">
            <MousePointer2 :size="24" />
          </div>
          <p>选择画布中的组件开始配置</p>
        </div>
      </div>
    </div>
    <PreviewModal
      :visible="showPreview"
      :form-title="formTitle"
      :form-desc="formDesc"
      :components="store.components"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormDesignerStore } from '@/stores/formDesigner'
import { templates } from '@/utils/templates'
import { nanoid } from 'nanoid'
import { MousePointer2 } from 'lucide-vue-next'
import PreviewModal from '@/components/designer/PreviewModal.vue'
import type { ComponentType } from '@/types'
import ComponentPalette from '@/components/designer/ComponentPalette.vue'
import DesignerCanvas from '@/components/designer/DesignerCanvas.vue'
import PropertyPanel from '@/components/designer/PropertyPanel.vue'

const route = useRoute()
const router = useRouter()
const store = useFormDesignerStore()
const formTitle = ref('')
const formDesc = ref('')
const showPreview = ref(false)

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    store.load(id)
  } else {
    store.reset()
    const tpl = route.query.template as string
    if (tpl) loadTemplate(tpl)
  }
  formTitle.value = store.schema?.title ?? ''
  formDesc.value = store.schema?.description ?? ''
  window.addEventListener('palette-drop', onPaletteDrop as EventListener)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('palette-drop', onPaletteDrop as EventListener)
  window.removeEventListener('keydown', onKeydown)
})

watch(
  () => store.schema?.title,
  (v) => {
    if (v) formTitle.value = v
  },
)

watch(
  () => store.schema?.description,
  (v) => {
    if (v) formDesc.value = v
  },
)

function onTitleBlur() {
  if (store.schema) store.schema.title = formTitle.value
}

function onDescBlur() {
  if (store.schema) store.schema.description = formDesc.value || ''
}

function handleAddComponent(type: ComponentType) {
  store.addComponent(type)
}

function onPaletteDrop(e: Event) {
  const type = (e as CustomEvent).detail?.type as ComponentType
  if (type) store.addComponent(type)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSaveDraft()
  }
  if (e.key === 'Delete' && store.selectedId) {
    e.preventDefault()
    handleRemoveComponent(store.selectedId)
  }
  if (e.key === 'Escape' && store.selectedId) {
    store.selectComponent(null)
  }
}

function loadTemplate(key: string) {
  const tpl = templates[key]
  if (tpl && store.schema) {
    store.schema.title = tpl.title
    store.schema.description = tpl.description
    // 直接使用模板的完整组件配置，而非 addComponent（会丢失所有属性）
    const cloned = JSON.parse(JSON.stringify(tpl.components)) as ComponentSchema[]
    cloned.forEach((c) => {
      c.id = nanoid()
    })
    store.components.push(...cloned)
    store.isDirty = true
    formTitle.value = tpl.title
    formDesc.value = tpl.description || ''
  }
}
async function handleRemoveComponent(id: string) {
  try {
    await ElMessageBox.confirm('确认删除该组件？此操作不可恢复。', '确认删除', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    store.removeComponent(id)
  } catch {}
}

function handleCopyComponent(id: string) {
  store.duplicateComponent(id)
  ElMessage.success('已复制')
}

function handleMoveComponent(from: number, to: number) {
  store.moveComponent(from, to)
}

async function handleBack() {
  if (store.isDirty) {
    await ElMessageBox.confirm('有未保存的修改，是否离开？', '提示', {
      confirmButtonText: '不保存',
      cancelButtonText: '取消',
      type: 'warning',
    })
  }
  router.push('/forms')
}

function handleSave() {
  if (!formTitle.value.trim()) return ElMessage.warning('请输入表单标题')
  const id = store.save()
  ElMessage.success('保存成功')
  if (route.path === '/formDesigner') router.replace(`/formDesigner/${id}`)
}

function toggleStatus(status: 'draft' | 'open' | 'closed') {
  if (status === 'open' && store.components.length === 0) return ElMessage.warning('请先添加组件')
  if (store.schema) {
    store.schema.status = status
    store.save()
  }
  ElMessage.success(
    status === 'open' ? '已发布，可通过链接收集数据' : status === 'closed' ? '已停止收集' : '已切换为草稿',
  )
}

function handleSaveDraft() {
  if (!formTitle.value.trim()) return ElMessage.warning('请输入表单标题')
  if (store.schema && store.schema.status !== 'open') store.schema.status = 'draft'
  const id = store.save()
  ElMessage.success('草稿已保存')
  if (route.path === '/formDesigner') router.replace(`/formDesigner/${id}`)
}

function handlePublish() {
  if (!formTitle.value.trim()) return ElMessage.warning('请输入表单标题')
  if (store.components.length === 0) return ElMessage.warning('请先添加组件')
  if (store.schema) store.schema.status = 'open'
  const id = store.save()
  ElMessage.success('已发布，可通过链接收集数据')
  if (route.path === '/formDesigner') router.replace(`/formDesigner/${id}`)
}
</script>

<style scoped lang="scss">
.designer-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-page);
}

/* ── 工具栏 ── */
.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  gap: 16px;
  background: var(--color-card);
  box-shadow: 0 1px 3px rgba(28, 25, 23, 0.06);
  z-index: 10;
  min-height: 56px;
  border-bottom: 1px solid rgba(45, 106, 79, 0.06);

  .el-button.is-link {
    color: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 500;
    padding: 6px 10px;
    border-radius: 8px;
    transition: all 0.15s;

    &:hover {
      color: var(--color-primary);
      background: rgba(45, 106, 79, 0.06);
    }
  }
}

.title-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 0;
}

.title-input {
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  width: 100%;
  outline: none;
  padding: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;

  &::placeholder {
    color: var(--color-text-muted);
    font-weight: 400;
  }
}

.desc-input {
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--color-text-muted);
  width: 100%;
  outline: none;
  padding: 0;
  line-height: 1.5;

  &::placeholder {
    color: var(--color-text-muted);
    opacity: 0.6;
  }
}

.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;

  .el-button {
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    height: 36px;
    padding: 0 18px;
    transition: all 0.15s;
  }

  .el-button--primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, #3d7e5c 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(45, 106, 79, 0.2);

    &:hover {
      box-shadow: 0 4px 14px rgba(45, 106, 79, 0.3);
      transform: translateY(-1px);
    }
  }

  .el-button.is-plain {
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    background: var(--color-card);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: rgba(45, 106, 79, 0.04);
    }
  }
}

/* ── 三栏布局 ── */
.designer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.panel-left {
  width: 260px;
  overflow-y: auto;
  background: #fafaf8;
  border-right: 1px solid var(--color-border);
}

.canvas-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #f2f1ee;
  background-image: radial-gradient(circle, rgba(28, 25, 23, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}

.panel-right {
  width: 300px;
  overflow-y: auto;
  background: var(--color-card);
  border-left: 1px solid var(--color-border);
}

/* ── 空状态 ── */
.no-select {
  padding: 64px 32px;
  text-align: center;

  .no-select-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--color-canvas);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-muted);
    line-height: 1.6;
  }
}
</style>
