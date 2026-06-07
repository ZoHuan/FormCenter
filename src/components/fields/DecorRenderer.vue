<template>
  <component :is="tag" v-if="comp.type !== 'separator'" :style="titleStyle">{{ comp.label }}</component>
  <hr v-else />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema }>()
const tag = computed(() => {
  if (props.comp.type === 'title') return 'h1'
  if (props.comp.type === 'subtitle') return 'h2'
  if (props.comp.type === 'group-title') return 'h3'
  return 'p'
})
const titleStyle = computed(() => {
  const p = props.comp.props as Record<string, unknown>
  return {
    fontFamily: p?.fontFamily || 'inherit',
    fontSize: (p?.fontSize as number) + 'px' || undefined,
    textAlign: p?.textAlign || undefined,
    color: p?.color || undefined,
  }
})
</script>

# 日期类
cat > src/components/fields/DateRenderer.vue << 'EOF'
<template>
  <el-date-picker :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)"
    :type="comp.type === 'date-range' ? 'daterange' : 'date'" :placeholder="comp.description" />
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>

# 文件类
cat > src/components/fields/ImageRenderer.vue << 'EOF'
<template>
  <div class="image-field">
    <div v-if="comp.type === 'image'" class="image-upload">
      <el-upload :show-file-list="true" :limit="(comp.props as Record<string, unknown>)?.maxCount as number" :auto-upload="false" :on-change="handleChange" :file-list="fileList">
        <el-button>上传附件</el-button>
      </el-upload>
    </div>
    <div v-else-if="comp.type === 'singleImage'" class="single-image">
      <el-upload :show-file-list="false" :auto-upload="false" :on-change="handleSingleChange">
        <div v-if="imagePreview" class="preview"><img :src="imagePreview" /></div>
        <div v-else class="placeholder">点击上传图片</div>
      </el-upload>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
const fileList = ref<Array<{ name: string }>>([])
const imagePreview = ref('')
function handleChange(file: { raw: File }) { fileList.value.push({ name: file.raw.name }); emit('update:modelValue', fileList.value.map(f => f.name)) }
function handleSingleChange(file: { raw: File }) {
  const reader = new FileReader()
  reader.onload = (e) => { imagePreview.value = e.target?.result as string; emit('update:modelValue', imagePreview.value) }
  reader.readAsDataURL(file.raw)
}
</script>
<style scoped>
.placeholder { width: 200px; height: 150px; border: 2px dashed var(--color-border); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
.preview img { max-width: 200px; max-height: 150px; border-radius: 8px; }
</style>

# 签名
cat > src/components/fields/SignatureRenderer.vue << 'EOF'
<template>
  <div class="signature-field">
    <canvas ref="canvasRef" width="300" height="150" @mousedown="start" @mousemove="draw" @mouseup="stop" @touchstart.prevent="start" @touchmove.prevent="draw" @touchend="stop" />
    <div class="sig-btns">
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
function getPos(e: MouseEvent | TouchEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const ev = 'touches' in e ? e.touches[0] : e
  return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
}
</script>
<style scoped>
.signature-field canvas { border: 2px dashed var(--color-border); border-radius: 8px; cursor: crosshair; touch-action: none; }
.sig-btns { margin-top: 8px; }
</style>

# 评分
cat > src/components/fields/RateRenderer.vue << 'EOF'
<template>
  <el-rate :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)"
    :max="max" :colors="colors" :allow-half="false" />
  <p v-if="prompts?.[Number(modelValue) - 1]" class="rate-hint">{{ prompts[Number(modelValue) - 1] }}</p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const max = computed(() => (props.comp.props as Record<string, unknown>)?.maxScore as number ?? 5)
const prompts = computed(() => (props.comp.props as Record<string, unknown>)?.prompts as string[] ?? [])
const colors = ['#F7BA2A', '#F7BA2A', '#F7BA2A']
</script>
<style scoped>
.rate-hint { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
</style>

# 表格
cat > src/components/fields/TableRenderer.vue << 'EOF'
<template>
  <div class="table-field">
    <table class="inner-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.field">{{ col.title }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in tableData" :key="ri">
          <td v-for="col in columns" :key="col.field">
            <el-input v-model="row[col.field]" size="small" :placeholder="col.description" @input="onRowChange" />
          </td>
        </tr>
      </tbody>
    </table>
    <el-button v-if="rowControl" size="small" @click="addRow">添加行</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
const columns = computed(() => (props.comp.props as Record<string, unknown>)?.columns as Array<{ field: string; title: string; description?: string }> ?? [])
const initialRows = computed(() => (props.comp.props as Record<string, unknown>)?.initialRows as number ?? 3)
const rowControl = computed(() => (props.comp.props as Record<string, unknown>)?.rowControl as boolean ?? true)
const tableData = ref<Array<Record<string, unknown>>>(Array.from({ length: initialRows.value }, () => ({})))
function addRow() { tableData.value.push({}); onRowChange() }
function onRowChange() { emit('update:modelValue', tableData.value) }
</script>
<style scoped>
.inner-table { width: 100%; border-collapse: collapse; }
.inner-table th, .inner-table td { border: 1px solid var(--color-border); padding: 4px 8px; }
.inner-table th { background: var(--color-canvas); font-size: 12px; }
</style>

# 交叉表
cat > src/components/fields/CrossTableRenderer.vue << 'EOF'
<template>
  <div class="cross-table-field">
    <table class="inner-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.field">{{ col.title }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in tableData" :key="ri">
          <td v-for="col in columns" :key="col.field">
            <el-input v-model="row[col.field]" size="small" :placeholder="col.description" @input="onRowChange" />
          </td>
        </tr>
      </tbody>
    </table>
    <el-button size="small" @click="addRow">添加行</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
const columns = computed(() => (props.comp.props as Record<string, unknown>)?.columns as Array<{ field: string; title: string; description?: string }> ?? [])
const initialRows = computed(() => (props.comp.props as Record<string, unknown>)?.initialRows as number ?? 3)
const tableData = ref<Array<Record<string, unknown>>>(Array.from({ length: initialRows.value }, () => ({})))
function addRow() { tableData.value.push({}); onRowChange() }
function onRowChange() { emit('update:modelValue', tableData.value) }
</script>
<style scoped>
.cross-table-field table { width: 100%; border-collapse: collapse; }
.cross-table-field th, .cross-table-field td { border: 1px solid var(--color-border); padding: 4px 8px; }
.cross-table-field th { background: var(--color-canvas); font-size: 12px; }
</style>

# 关联查询
cat > src/components/fields/RelationRenderer.vue << 'EOF'
<template>
  <div class="relation-field">
    <el-select :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :placeholder="comp.description" clearable>
      <el-option v-for="opt in mockOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
    </el-select>
    <div v-if="modelValue" class="relation-info">
      <span v-for="f in outputFields" :key="f.field">{{ f.label }}: {{ getFieldValue(f.field) }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const mockOptions = computed(() => [{ label: '记录1', value: '1' }, { label: '记录2', value: '2' }, { label: '记录3', value: '3' }])
const outputFields = computed(() => (props.comp.props as Record<string, unknown>)?.outputFields as Array<{ field: string; label: string }> ?? [])
function getFieldValue(field: string) { return '示例数据' }
</script>
<style scoped>
.relation-info { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; display: flex; flex-wrap: wrap; gap: 8px; }
</style>

# 承诺说明
cat > src/components/fields/CommitmentRenderer.vue << 'EOF'
<template>
  <el-checkbox :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :label="comp.description" />
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>

# 行政区划
cat > src/components/fields/RegionRenderer.vue << 'EOF'
<template>
  <el-cascader :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :options="regionTree" :placeholder="comp.description" clearable />
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
import { regionTree } from '@/mock/region'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>

# 地图定位
cat > src/components/fields/MapLocationRenderer.vue << 'EOF'
<template>
  <div class="map-location-field">
    <el-input :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :placeholder="comp.description" />
    <el-button size="small" @click="geolocate">获取定位</el-button>
  </div>
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => emit('update:modelValue', `${pos.coords.latitude}, ${pos.coords.longitude}`), (err) => emit('update:modelValue', '定位失败'))
  }
}
</script>
<style scoped>
.map-location-field { display: flex; gap: 8px; }
</style>

# 用户树 / 组织树
cat > src/components/fields/TreeRenderer.vue << 'EOF'
<template>
  <el-tree-select :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :data="treeData" :placeholder="comp.description" :show-checkbox="comp.type !== 'user-tree'" clearable check-strictly />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
import { orgTree } from '@/mock/orgTree'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const treeData = computed(() => orgTree)
</script>

# 签名人
cat > src/components/fields/SignatureNameRenderer.vue << 'EOF'
<template>
  <div class="sig-name-field">
    <canvas ref="canvasRef" width="300" height="100" @mousedown="start" @mousemove="draw" @mouseup="stop" @touchstart.prevent="start" @touchmove.prevent="draw" @touchend="stop" />
    <el-button size="small" @click="clear">清除</el-button>
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
function getPos(e: MouseEvent | TouchEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const ev = 'touches' in e ? e.touches[0] : e
  return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
}
</script>
<style scoped>
.sig-name-field canvas { border: 2px dashed var(--color-border); border-radius: 8px; cursor: crosshair; touch-action: none; }
</style>

# 二维码
cat > src/components/fields/QRCodeRenderer.vue << 'EOF'
<template>
  <div class="qr-field">
    <img v-if="qrUrl" :src="qrUrl" class="qr-img" />
    <p v-else>请在属性面板设置二维码内容</p>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ComponentSchema } from '@/types'
import QRCode from 'qrcode'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const qrUrl = ref('')
watch(() => (props.comp.props as Record<string, unknown>)?.content, async (val) => {
  if (val) { qrUrl.value = await QRCode.toDataURL(val as string, { width: 200, margin: 2 }) }
}, { immediate: true })
</script>
<style scoped>
.qr-field { text-align: center; }
.qr-img { max-width: 200px; max-height: 200px; }
</style>

echo "15 FillRenderers created"