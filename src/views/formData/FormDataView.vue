<template><div class="data-page"><AppHeader /><div class="data-content"><div class="data-header"><el-button link @click="$router.push('/forms')">← 返回</el-button><h2>{{ schema?.title }} — 提交数据</h2><el-button type="primary" @click="handleExport">导出 Excel</el-button></div><LoadingState v-if="loading" /><EmptyState v-else-if="submissions.length===0" text="暂无提交数据" /><el-table v-else :data="pagedData" stripe><el-table-column prop="submittedAt" label="提交时间" width="180"><template #default="{row}">{{ formatTime(row.submittedAt) }}</template></el-table-column><el-table-column v-for="col in columns" :key="col.field" :prop="col.field" :label="col.title" min-width="120" /></el-table><el-pagination v-if="submissions.length>pageSize" v-model:current-page="page" :page-size="pageSize" :total="submissions.length" layout="prev,pager,next" /></div></div></template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { exportToExcel } from '@/utils/excel'
import AppHeader from '@/components/common/AppHeader.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Submission } from '@/types'

const route = useRoute()
const listStore = useFormListStore()
const subStore = useFormSubmissionStore()
const formId = route.params.id as string
const schema = computed(() => listStore.getById(formId))
const submissions = ref<Submission[]>([])
const loading = ref(true)
const page = ref(1)
const pageSize = ref(10)

const columns = computed(() => {
  const txtTypes = new Set(['input','textarea','numeric','serial-number','date','date-range','chooser','multi-chooser','selection','cascader','tree','rate','image','singleImage','signature','region','map-location','user-tree','org-tree','signature-name','commitment','relation','QRCode'])
  return (schema.value?.components??[]).filter(c=>txtTypes.has(c.type)&&c.field).map(c=>({field:c.field,title:c.label}))
})

const pagedData = computed(() => submissions.value.slice((page.value-1)*pageSize.value, page.value*pageSize.value))

onMounted(() => {
  subStore.init(formId)
  submissions.value = subStore.submissions
  loading.value = false
})

function handleExport() {
  if(submissions.value.length===0) return ElMessage.warning('没有可导出数据')
  exportToExcel(columns.value, submissions.value.map(s=>({...s.data,submittedAt:s.submittedAt})), schema.value?.title??'export')
  ElMessage.success('导出成功')
}
function formatTime(ts:number){return new Date(ts).toLocaleString('zh-CN')}
</script>
<style scoped lang="scss">.data-page{min-height:100vh;background:#F8F7F5}.data-content{max-width:1100px;margin:0 auto;padding:32px 24px}.data-header{display:flex;align-items:center;gap:16px;margin-bottom:24px}.data-header h2{font-size:20px;font-weight:600;flex:1}</style>
