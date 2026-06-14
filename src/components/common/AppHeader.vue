<template>
  <header v-if="visible" class="app-header">
    <div class="header-left" @click="$router.push('/forms')" style="cursor: pointer">
      <img src="/logo.svg" width="32" height="32" alt="FormCenter" />
      <span class="header-title">FormCenter</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const visible = computed(() => !route.path.startsWith('/formDesigner') && !route.path.startsWith('/fill'))
</script>

<style scoped lang="scss">
.app-header {
  height: 56px;
  background: var(--color-card);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  box-shadow: 0 1px 0 var(--color-border);

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
  }
}
</style>
