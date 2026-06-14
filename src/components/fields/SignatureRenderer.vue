<template>
  <div class="signature-field">
    <div class="sig-canvas-wrap">
      <canvas
        ref="canvasRef"
        @mousedown="start"
        @mousemove="draw"
        @mouseup="stop"
        @mouseleave="stop"
        @touchstart.prevent="startTouch"
        @touchmove.prevent="drawTouch"
        @touchend="stop"
      />
    </div>
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

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown; mode?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const drawing = ref(false)
let ctx: CanvasRenderingContext2D | null = null
const currentFileId = ref<string | null>(null)

onMounted(() => {
  if (canvasRef.value) {
    const rect = canvasRef.value.parentElement!.getBoundingClientRect()
    canvasRef.value.width = rect.width
    canvasRef.value.height = props.mode === 'mobile' ? 120 : 150
    ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.lineWidth = 2
      ctx.strokeStyle = '#1A1814'
      ctx.lineCap = 'round'
    }
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

function start(e: MouseEvent) {
  drawing.value = true
  const p = mousePos(e)
  ctx?.beginPath()
  ctx?.moveTo(p.x, p.y)
}
function draw(e: MouseEvent) {
  if (!drawing.value) return
  const p = mousePos(e)
  ctx?.lineTo(p.x, p.y)
  ctx?.stroke()
}
function startTouch(e: TouchEvent) {
  e.preventDefault()
  drawing.value = true
  const p = touchPos(e)
  ctx?.beginPath()
  ctx?.moveTo(p.x, p.y)
}
function drawTouch(e: TouchEvent) {
  e.preventDefault()
  if (!drawing.value) return
  const p = touchPos(e)
  ctx?.lineTo(p.x, p.y)
  ctx?.stroke()
}

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

function mousePos(e: MouseEvent) {
  const r = canvasRef.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}
function touchPos(e: TouchEvent) {
  const r = canvasRef.value!.getBoundingClientRect()
  return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
}
</script>

<style scoped lang="scss">
.signature-field {
  .sig-canvas-wrap {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  canvas {
    display: block;
    width: 100%;
    cursor: crosshair;
    touch-action: none;
  }
  .sig-actions {
    margin-top: 8px;
  }
}
</style>
