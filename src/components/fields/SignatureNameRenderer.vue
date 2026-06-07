<template>
  <div class="sig-name-field">
    <canvas ref="canvasRef" width="300" height="100" @mousedown="start" @mousemove="draw" @mouseup="stop" @touchstart.prevent="start" @touchmove.prevent="draw" @touchend="stop" />
    <div class="sig-actions">
      <el-button size="small" @click="clear">清除</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const drawing = ref(false)
let ctx: CanvasRenderingContext2D | null = null
onMounted(() => { if (canvasRef.value) { ctx = canvasRef.value.getContext('2d'); if (ctx) { ctx.lineWidth = 2; ctx.strokeStyle = '#1A1814'; ctx.lineCap = 'round' } } })
function start(e: MouseEvent | TouchEvent) { drawing.value = true; const p = getPos(e); ctx?.beginPath(); ctx?.moveTo(p.x, p.y) }
function draw(e: MouseEvent | TouchEvent) { if (!drawing.value) return; const p = getPos(e); ctx?.lineTo(p.x, p.y); ctx?.stroke() }
function stop() { drawing.value = false; ctx?.closePath(); if (canvasRef.value) emit('update:modelValue', canvasRef.value.toDataURL('image/png')) }
function clear() { if (canvasRef.value && ctx) { ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height); emit('update:modelValue', null) } }
function getPos(e: MouseEvent | TouchEvent) { const r = canvasRef.value!.getBoundingClientRect(); const ev = 'touches' in e ? e.touches[0] : e; return { x: ev.clientX - r.left, y: ev.clientY - r.top } }
</script>
<style scoped>
.sig-name-field canvas { border: 2px dashed var(--color-border); border-radius: 8px; cursor: crosshair; touch-action: none; width: 100%; max-width: 300px; }
.sig-actions { margin-top: 8px; }
</style>
