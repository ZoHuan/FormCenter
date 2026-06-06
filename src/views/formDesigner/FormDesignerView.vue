<template>
  <div class="designer-page">
    <div class="toolbar">
      <el-button link @click="handleBack">← 返回</el-button>
      <input v-model="formTitle" class="title-input" placeholder="请输入表单标题" @blur="onTitleBlur" />
      <div class="toolbar-right">
        <el-button @click="handlePreview" :disabled="!schema?.id">预览</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
    <div class="designer-body">
      <div class="panel-left">
        <ComponentPalette @add="handleAddComponent" />
      </div>
      <div class="canvas-area">
        <DesignerCanvas :components="store.components" :selectedId="store.selectedId" @select="store.selectComponent" @remove="handleRemoveComponent" @move="handleMoveComponent" />
      </div>
      <div class="panel-right">
        <PropertyPanel v-if="store.selectedComponent" :component="store.selectedComponent" @update="(patch) => store.updateComponent(store.selectedComponent!.id, patch)" />
        <div v-else class="no-select">点击画布中的组件进行编辑</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormDesignerStore } from '@/stores/formDesigner'
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
  if (id) store.load(id)
  else store.reset()
  formTitle.value = store.schema?.title ?? ''
})

watch(() => store.schema?.title, (v) => { if (v) formTitle.value = v })

function onTitleBlur() {
  if (store.schema) store.schema.title = formTitle.value
}

function handleAddComponent(type: ComponentType) { store.addComponent(type) }
function handleRemoveComponent(id: string) { store.removeComponent(id) }
function handleMoveComponent(from: number, to: number) { store.moveComponent(from, to) }

async function handleBack() {
  if (store.isDirty) {
    await ElMessageBox.confirm('有未保存的修改，是否离开？', '提示', { confirmButtonText: '不保存', cancelButtonText: '取消', type: 'warning' })
  }
  router.push('/forms')
}

function handleSave() {
  if (!formTitle.value.trim()) return ElMessage.warning('请输入表单标题')
  const id = store.save()
  ElMessage.success('保存成功')
  if (route.path === '/formDesigner') router.replace(`/formDesigner/${id}`)
}

function handlePreview() {
  if (store.schema?.id) window.open(`/fill/${store.schema.id}?preview=1`)
}
</script>

<style scoped lang="scss">
.designer-page { height: 100vh; display: flex; flex-direction: column; }
.toolbar { height: 56px; display: flex; align-items: center; padding: 0 16px; gap: 16px; border-bottom: 1px solid #E8E5E0; background: #fff; }
.title-input { border: none; font-size: 18px; font-weight: 600; flex: 1; outline: none; }
.toolbar-right { display: flex; gap: 8px; }
.designer-body { flex: 1; display: flex; overflow: hidden; }
.panel-left { width: 260px; border-right: 1px solid #E8E5E0; overflow-y: auto; background: #FAFAF8; }
.canvas-area { flex: 1; overflow-y: auto; background: #F0EFEC; padding: 24px; }
.panel-right { width: 300px; border-left: 1px solid #E8E5E0; overflow-y: auto; background: #fff; }
.no-select { padding: 24px; text-align: center; color: #9C9790; font-size: 14px; }
</style>
