<template>
  <div class="qr-editor">
    <div class="prop-row">
      <label>二维码内容</label>
      <el-input v-model="content" size="small" placeholder="请输入二维码内容（文本或URL）" @input="emitUpdate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()

const p = computed(() => props.component.props as Record<string, unknown>)

const content = computed({
  get: () => (p.value?.content as string) ?? '',
  set: (v) => {
    p.value.content = v
    emitUpdate()
  },
})

function emitUpdate() {
  emit('update', { ...props.component })
}
</script>

<style scoped lang="scss">
.qr-editor .prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 6px 0;
  gap: 8px;
}
.qr-editor .prop-row label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  width: 72px;
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
