<template>
  <div class="image-field">
    <div v-if="comp.type === 'file'" class="upload-area">
      <el-upload
        :show-file-list="true"
        :limit="maxCount"
        :auto-upload="false"
        :on-change="handleChange"
        :file-list="fileList"
      >
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
import { ref, computed, onMounted, watch } from 'vue'
import { setFile, getFile } from '@/utils/storage'
import { nanoid } from 'nanoid'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const maxCount = computed(() => ((props.comp.props as Record<string, unknown>)?.maxCount as number) ?? 3)
const fileList = ref<Array<{ name: string; raw: File }>>([])
const imagePreview = ref('')

onMounted(() => {
  if (props.modelValue && typeof props.modelValue === 'string' && props.modelValue.startsWith('file:')) {
    const fileId = props.modelValue.replace('file:', '')
    getFile(fileId).then((f) => {
      if (f) imagePreview.value = f.dataURL
    })
  }
})

function handleChange(file: { name: string; raw: File }) {
  fileList.value.push(file)
  emit(
    'update:modelValue',
    fileList.value.map((f) => f.name),
  )
}

function handleSingleChange(file: { raw: File }) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const dataURL = e.target?.result as string
    if (dataURL.length > 500000) {
      const compressed = await compressImage(dataURL, 800)
      imagePreview.value = compressed
      const fileId = nanoid()
      await setFile(fileId, compressed)
      emit('update:modelValue', `file:${fileId}`)
    } else {
      imagePreview.value = dataURL
      const fileId = nanoid()
      await setFile(fileId, dataURL)
      emit('update:modelValue', `file:${fileId}`)
    }
  }
  reader.readAsDataURL(file.raw)
}

function compressImage(dataURL: string, maxSide: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(maxSide / img.width, maxSide / img.height, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.src = dataURL
  })
}
</script>

<style scoped lang="scss">
.placeholder {
  width: 200px;
  height: 150px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: var(--radius-md);
}
</style>
