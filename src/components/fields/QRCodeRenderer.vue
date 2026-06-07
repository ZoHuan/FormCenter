<template>
  <div class="qr-field">
    <img v-if="qrUrl" :src="qrUrl" class="qr-img" />
    <p v-else class="qr-placeholder">请在属性面板设置二维码内容</p>
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
  if (val) qrUrl.value = await QRCode.toDataURL(val as string, { width: 200, margin: 2 })
}, { immediate: true })
</script>
<style scoped>
.qr-field { text-align: center; }
.qr-img { max-width: 200px; max-height: 200px; }
.qr-placeholder { color: var(--color-text-muted); font-size: 13px; }
</style>
