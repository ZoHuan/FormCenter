<template>
  <div class="rate-editor">
    <div class="prop-row">
      <label>图标</label>
      <el-select v-model="icon" size="small" style="width:100%" @change="emitUpdate">
        <el-option value="star" label="★ 星星" />
        <el-option value="heart" label="♥ 心形" />
        <el-option value="smile" label="☺ 笑脸" />
        <el-option value="like" label="👍 点赞" />
      </el-select>
    </div>
    <div class="prop-row">
      <label>颜色</label>
      <el-color-picker v-model="iconColor" size="small" @change="emitUpdate" />
    </div>
    <div class="prop-row">
      <label>最高分</label>
      <el-select v-model="maxScore" size="small" @change="onMaxChange">
        <el-option v-for="n in 9" :key="n + 1" :label="`${n + 1}`" :value="n + 1" />
      </el-select>
    </div>
    <div class="prop-row">
      <label>默认值</label>
      <el-select v-model="defaultScore" size="small" @change="emitUpdate">
        <el-option v-for="n in maxScore" :key="n" :label="`${n}`" :value="n" />
      </el-select>
    </div>
    <div v-for="n in maxScore" :key="n" class="prop-row">
      <label>{{ n }} 分</label>
      <el-input v-model="prompts[n - 1]" size="small" maxlength="8" placeholder="提示文字" @input="emitUpdate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()

const propsData = computed(() => props.component.props as Record<string, unknown>)

const icon = computed({ get: () => (propsData.value?.icon as string) ?? 'star', set: (v) => { propsData.value.icon = v; emitUpdate() } })
const iconColor = computed({ get: () => (propsData.value?.iconColor as string) ?? '#F7BA2A', set: (v) => { propsData.value.iconColor = v; emitUpdate() } })
const maxScore = ref((propsData.value?.maxScore as number) ?? 5)
const defaultScore = computed({ get: () => props.component.defaultValue as number ?? 3, set: (v) => { props.component.defaultValue = v; emitUpdate() } })
const prompts = computed({
  get: () => (propsData.value?.prompts as string[]) ?? [],
  set: () => {},
})

watch(maxScore, () => {
  const list = [...prompts.value]
  while (list.length < maxScore.value) list.push('')
  list.length = maxScore.value
  propsData.value.prompts = list
  propsData.value.maxScore = maxScore.value
  emitUpdate()
})

function emitUpdate() { emit('update', { ...props.component }) }
function onMaxChange() { emitUpdate() }
</script>
