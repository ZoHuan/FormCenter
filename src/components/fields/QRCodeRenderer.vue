<template>
  <div class="qr-field">
    <img v-if="qrUrl" :src="qrUrl" class="qr-img" />
    <p v-else class="qr-placeholder">请在属性面板设置二维码内容</p>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ComponentSchema } from '@/types'
import QRCode from 'qrcode'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()

const qrUrl = ref('')

const content = computed(() => {
  const p = props.comp.props as Record<string, unknown>
  return (p?.content as string) || ''
})

watch(
  content,
  async (val) => {
    if (val) {
      try {
        qrUrl.value = await QRCode.toDataURL(val, { width: 200, margin: 2 })
      } catch (e) {
        console.error('QRCode generation failed:', e)
        qrUrl.value = ''
      }
    } else {
      qrUrl.value = ''
    }
  },
  { immediate: true },
)
</script>
<style scoped>
.qr-field {
}
.qr-img {
  max-width: 200px;
  max-height: 200px;
}
.qr-placeholder {
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
