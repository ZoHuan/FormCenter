<template>
  <div class="signature-field">
    <canvas ref="canvasRef" width="300" height="150" @mousedown="start" @mousemove="draw" @mouseup="stop" @touchstart.prevent="start" @touchmove.prevent="draw" @touchend="stop" />
    <div class="sig-actions">
      <el-button size="small" @click="clear">清除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { setFile, getFile, removeFile } from '@/utils/storage'
import { nanoid } from 'nanoid'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const drawing = ref(false)
let ctx: CanvasRenderingContext2D | null = null
const currentFileId = ref<string | null>(null)

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    if (ctx) { ctx.lineWidth = 2; ctx.strokeStyle = '#1A1814'; ctx.lineCap = 'round' }
  }
  if (props.modelValue && typeof props.modelValue === 'string' && props.modelValue.startsWith('file:')) {
    const fileId = props.modelValue.replace('file:', '')
    currentFileId.value = fileId
    getFile(fileId).then((f) => {
      if (f && canvasRef.value) {
        const img = new Image()
        img.onload = () => ctx?.drawImage(img, 0, 0)
        img.src = f.dataURL
      }
    })
  }
})

function start(e: MouseEvent | TouchEvent) { drawing.value = true; const p = getPos(e); ctx?.beginPath(); ctx?.moveTo(p.x, p.y) }
function draw(e: MouseEvent | TouchEvent) { if (!drawing.value) return; const p = getPos(e); ctx?.lineTo(p.x, p.y); ctx?.stroke() }

async function stop() {
  drawing.value = false
  ctx?.closePath()
  if (canvasRef.value) {
    const dataURL = canvasRef.value.toDataURL('image/png')
    if (currentFileId.value) await removeFile(currentFileId.value)
    const fileId = nanoid()
    await setFile(fileId, dataURL)
    currentFileId.value = fileId
    emit('update:modelValue', `file:${fileId}`)
  }
}

async function clear() {
  if (canvasRef.value && ctx) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    if (currentFileId.value) await removeFile(currentFileId.value)
    currentFileId.value = null
    emit('update:modelValue', null)
  }
}

function getPos(e: MouseEvent | TouchEvent) {
  const r = canvasRef.value!.getBoundingClientRect()
  const ev = 'touches' in e ? e.touches[0] : e
  return { x: ev.clientX - r.left, y: ev.clientY - r.top }
}
</script>

<style scoped lang="scss">
.signature-field {
  canvas {
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    cursor: crosshair;
    touch-action: none;
    width: 100%;
    max-width: 300px;
  }

  .sig-actions {
    margin-top: 8px;
  }
}
</style>
