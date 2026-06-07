<template>
  <div class="designer-page">
    <div class="toolbar">
      <el-button link @click="handleBack">← 返回</el-button>
      <input v-model="formTitle" class="title-input" placeholder="请输入表单标题" @blur="onTitleBlur" />
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
import type { ComponentType } from '@/types'
import ComponentPalette from '@/components/designer/ComponentPalette.vue'
import DesignerCanvas from '@/components/designer/DesignerCanvas.vue'
import PropertyPanel from '@/components/designer/PropertyPanel.vue'

const route = useRoute()
const router = useRouter()
const store = useFormDesignerStore()
const formTitle = ref('')

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
  window.addEventListener('palette-drop', onPaletteDrop as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('palette-drop', onPaletteDrop as EventListener)
})

watch(
  () => store.schema?.title,
  (v) => {
    if (v) formTitle.value = v
  },
)

function onTitleBlur() {
  if (store.schema) store.schema.title = formTitle.value
}

function handleAddComponent(type: ComponentType) {
  store.addComponent(type)
}

function onPaletteDrop(e: Event) {
  const type = (e as CustomEvent).detail?.type as ComponentType
  if (type) store.addComponent(type)
}

function loadTemplate(key: string) {
  const tpl = templates[key]
  if (tpl && store.schema) {
    store.schema.title = tpl.title
    store.schema.description = tpl.description
    tpl.components.forEach((c) => store.addComponent(c.type as ComponentType))
    formTitle.value = tpl.title
  }
}

function handleRemoveComponent(id: string) {
  store.removeComponent(id)
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
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-card);
}
.title-input {
  border: none;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  outline: none;
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
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  background: var(--color-primary-bg);
}
.canvas-area {
  flex: 1;
  overflow-y: auto;
  background: var(--color-canvas);
  padding: 24px;
}
.panel-right {
  width: 300px;
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  background: var(--color-card);
}
.no-select {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
