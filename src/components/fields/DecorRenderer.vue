<template>
  <div class="decor-renderer">
    <!-- 标题类 -->
    <component
      v-if="comp.type === 'title' || comp.type === 'subtitle' || comp.type === 'group-title'"
      :is="tag"
      :style="titleStyle"
    >
      {{ comp.label }}
    </component>

    <!-- 分隔符 -->
    <hr v-else-if="comp.type === 'separator'" class="separator" />

    <!-- 提示 (point-out) -->
    <div v-else-if="comp.type === 'point-out'" class="point-out" :style="pointOutStyle">
      <el-icon class="point-out-icon"><InfoFilled /></el-icon>
      <span class="point-out-text">{{ comp.description || comp.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema }>()

const tag = computed(() => {
  if (props.comp.type === 'title') return 'h1'
  if (props.comp.type === 'subtitle') return 'h2'
  if (props.comp.type === 'group-title') return 'h3'
  return 'p'
})

const titleStyle = computed(() => {
  const p = (props.comp.props as Record<string, unknown>) || {}
  return {
    fontFamily: (p.fontFamily as string) || 'inherit',
    fontSize: p.fontSize ? (p.fontSize as number) + 'px' : undefined,
    textAlign: (p.textAlign as string) || undefined,
    color: (p.color as string) || undefined,
  }
})

const pointOutStyle = computed(() => {
  const p = (props.comp.props as Record<string, unknown>) || {}
  return {
    fontFamily: (p.fontFamily as string) || 'inherit',
    fontSize: p.fontSize ? (p.fontSize as number) + 'px' : undefined,
    textAlign: (p.textAlign as string) || undefined,
    color: (p.color as string) || undefined,
  }
})
</script>

<style scoped lang="scss">
.decor-renderer {
  width: 100%;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  padding: 8px 0;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  padding: 6px 0;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  padding: 4px 0;
  border-left: 3px solid var(--color-primary);
  padding-left: 8px;
}

.separator {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 12px 0;
}

.point-out {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);

  .point-out-icon {
    color: var(--color-primary);
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .point-out-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text);
  }
}
</style>
