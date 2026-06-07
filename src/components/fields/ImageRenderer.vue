<template>
  <div class="image-field">
    <div v-if="comp.type === 'image'" class="upload-area">
      <el-upload :show-file-list="true" :limit="maxCount" :auto-upload="false" :on-change="handleChange" :file-list="fileList">
        <el-button size="small">上传附件</el-button>
      </el-upload>
    </div>
    <div v-else class="single-img-area">
      <el-upload :show-file-list="false" :auto-upload="false" :on-change="handleSingleChange">
        <div v-if="imagePreview" class="preview"><img :src="imagePreview" /></div>
        <div v-else class="placeholder">点击上传图片</div>
      </el-upload>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
const maxCount = computed(() => (props.comp.props as Record<string, unknown>)?.maxCount as number ?? 3)
const fileList = ref<Array<{ name: string; raw: File }>>([])
const imagePreview = ref('')
function handleChange(file: { name: string; raw: File }) { fileList.value.push(file); emit('update:modelValue', fileList.value.map(f => f.name)) }
function handleSingleChange(file: { raw: File }) {
  const reader = new FileReader()
  reader.onload = (e) => { imagePreview.value = e.target?.result as string; emit('update:modelValue', imagePreview.value) }
  reader.readAsDataURL(file.raw)
}
</script>
<style scoped>
.placeholder { width: 200px; height: 150px; border: 2px dashed var(--color-border); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); font-size: 13px; }
.preview img { max-width: 200px; max-height: 150px; border-radius: 8px; }
</style>
