<template>
  <div class="rate-editor">
    <!-- 图标选择 -->
    <div class="prop-row">
      <label>图标</label>
      <div class="icon-picker">
        <button v-for="opt in iconOptions" :key="opt.value"
          class="icon-option" :class="{ active: icon === opt.value }"
          @click="icon = opt.value; emitUpdate()">
          <component :is="opt.icon" :size="18" />
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <!-- 颜色 + 最高分 -->
    <div class="prop-row">
      <label>颜色</label>
      <el-color-picker v-model="iconColor" size="small" @change="emitUpdate" />
    </div>
    <div class="prop-row">
      <label>最高分</label>
      <el-input-number v-model="maxScore" :min="2" :max="10" size="small" @change="onMaxChange" />
    </div>
    <div class="prop-row">
      <label>默认值</label>
      <el-input-number v-model="defaultScore" :min="0" :max="maxScore" size="small" @change="emitUpdate" />
    </div>

    <!-- 提示文字 -->
    <div v-if="maxScore > 0" class="prompts-section">
      <div class="prop-row" v-for="n in maxScore" :key="n">
        <label>{{ n }} 分</label>
        <el-input v-model="prompts[n - 1]" size="small" maxlength="8" placeholder="提示文字" @input="emitUpdate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Star, Heart, Smile, ThumbsUp } from 'lucide-vue-next'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()

const propsData = computed(() => props.component.props as Record<string, unknown>)

const iconOptions = [
  { value: 'star', label: '星星', icon: Star },
  { value: 'heart', label: '心形', icon: Heart },
  { value: 'smile', label: '笑脸', icon: Smile },
  { value: 'like', label: '点赞', icon: ThumbsUp },
]

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

<style scoped lang="scss">
.rate-editor { display: flex; flex-direction: column; gap: 2px; }

.prop-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 0; gap: 8px;
  label {
    font-size: 13px; font-weight: 500; color: var(--color-text-secondary);
    width: 56px; flex-shrink: 0; white-space: nowrap;
  }
}

.icon-picker {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px; flex: 1;
}
.icon-option {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; font-size: 12px; font-weight: 500;
  color: var(--color-text-secondary); background: var(--color-page);
  border: 1px solid var(--color-canvas); border-radius: var(--radius-sm);
  cursor: pointer; transition: all 0.15s;
  &:hover { border-color: var(--color-border-hover); }
  &.active {
    border-color: var(--color-primary); color: var(--color-primary);
    background: var(--color-primary-bg);
  }
}

.prompts-section {
  margin-top: 8px; padding-top: 12px;
  border-top: 1px solid var(--color-canvas);
}
</style>
