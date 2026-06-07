<template>
  <div class="map-location-field">
    <el-input :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :placeholder="comp.description" />
    <el-button size="small" @click="geolocate">定位</el-button>
  </div>
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
function geolocate() {
  if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
    (pos) => emit('update:modelValue', `${pos.coords.latitude}, ${pos.coords.longitude}`),
    () => emit('update:modelValue', '定位失败')
  )
}
</script>
<style scoped>
.map-location-field { display: flex; gap: 8px; }
</style>
