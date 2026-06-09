<template>
  <div class="designer-page">
    <div class="toolbar">
      <el-button link @click="handleBack">← 返回</el-button>
      <div class="title-area">
        <input v-model="formTitle" class="title-input" placeholder="请输入表单标题" @blur="onTitleBlur" />
        <input
          v-model="formDesc"
          class="desc-input"
          placeholder="添加描述（选填）"
          @blur="onDescBlur"
        />
      </div>
      <div class="toolbar-right">
        <el-button @click="handlePreview">预览</el-button>
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
        <div v-else class="no-select">点击画布中的组件进行编辑</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormDesignerStore } from '@/stores/formDesigner'
import { templates } from '@/utils/templates'
import { nanoid } from 'nanoid'
import type { ComponentType } from '@/types'
import ComponentPalette from '@/components/designer/ComponentPalette.vue'
import DesignerCanvas from '@/components/designer/DesignerCanvas.vue'
import PropertyPanel from '@/components/designer/PropertyPanel.vue'

const route = useRoute()
const router = useRouter()
const store = useFormDesignerStore()
const formTitle = ref('')
const formDesc = ref('')

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
    cloned.forEach((c) => { c.id = nanoid() })
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
  if (store.schema) { store.schema.status = status; store.save() }
  ElMessage.success(status === 'open' ? '已发布，可通过链接收集数据' : status === 'closed' ? '已停止收集' : '已切换为草稿')
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

function handlePreview() {
  if (!formTitle.value.trim()) return ElMessage.warning('请输入表单标题')
  const id = store.schema?.id || store.save()
  if (id) window.open(`/fill/${id}?preview=1`)
}
</script>

<style scoped lang="scss">
.designer-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;
  background: var(--color-card);
  box-shadow: 0 1px 0 var(--color-border);
  z-index: 10;
  min-height: 56px;
}
.title-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.title-input {
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  width: 100%;
  outline: none;

  &::placeholder {
    color: var(--color-text-muted);
    font-weight: 400;
  }
}
.desc-input {
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--color-text-secondary);
  width: 100%;
  outline: none;

  &::placeholder {
    color: var(--color-text-muted);
  }
}
.toolbar-right {
  display: flex;
  gap: 8px;
}
.designer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.panel-left {
  width: 260px;
  overflow-y: auto;
  background: var(--color-page);
}
.canvas-area {
  flex: 1;
  overflow-y: auto;
  background: var(--color-canvas);
  padding: 24px;
}
.panel-right {
  width: 300px;
  overflow-y: auto;
  background: var(--color-card);
  box-shadow: -1px 0 0 var(--color-border);
}
.no-select {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
