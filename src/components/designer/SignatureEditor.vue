<template>
  <div class="sig-editor">
    <div class="prop-row">
      <label>签章人名称</label>
      <el-input v-model="signerName" size="small" maxlength="19" placeholder="请输入签章人名称" @input="emitUpdate" />
    </div>
    <div class="prop-row">
      <label>签章描述</label>
      <el-input v-model="signerDescription" size="small" maxlength="10" placeholder="请输入签章描述" @input="emitUpdate" />
    </div>
    <div class="prop-row">
      <label>显示日期</label>
      <el-switch v-model="showDate" size="small" @change="emitUpdate" />
    </div>
    <div class="prop-row">
      <label>上传方式</label>
      <el-select v-model="uploadType" size="small" @change="emitUpdate">
        <el-option value="draw" label="手写签名" />
        <el-option value="scan" label="扫码签名" />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()

const p = computed(() => props.component.props as Record<string, unknown>)

const signerName = computed({
  get: () => (p.value?.signerName as string) ?? '',
  set: (v) => { p.value.signerName = v; emitUpdate() }
})

const signerDescription = computed({
  get: () => (p.value?.signerDescription as string) ?? '',
  set: (v) => { p.value.signerDescription = v; emitUpdate() }
})

const showDate = computed({
  get: () => (p.value?.showDate as boolean) ?? false,
  set: (v) => { p.value.showDate = v; emitUpdate() }
})

const uploadType = computed({
  get: () => (p.value?.uploadType as string) ?? 'draw',
  set: (v) => { p.value.uploadType = v; emitUpdate() }
})

function emitUpdate() {
  emit('update', { ...props.component })
}
</script>

<style scoped lang="scss">
.sig-editor {
  .prop-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    label {
      font-size: 12px;
      color: var(--color-text-secondary);
      width: 80px;
      flex-shrink: 0;
    }
  }
}
</style>
