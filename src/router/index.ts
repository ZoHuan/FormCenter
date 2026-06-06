import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getItem } from '@/utils/storage'
import type { FormSchema } from '@/types'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/forms' },
  { path: '/forms', name: 'formList', component: () => import('@/views/formList/FormListView.vue') },
  {
    path: '/formDesigner',
    name: 'formDesignerNew',
    component: () => import('@/views/formDesigner/FormDesignerView.vue'),
  },
  {
    path: '/formDesigner/:id',
    name: 'formDesignerEdit',
    component: () => import('@/views/formDesigner/FormDesignerView.vue'),
  },
  { path: '/fill/:formId', name: 'formFill', component: () => import('@/views/formFill/FormFillView.vue') },
  { path: '/forms/:id/responses', name: 'formData', component: () => import('@/views/formData/FormDataView.vue') },
  { path: '/error', name: 'error', component: () => import('@/views/error/StatusError.vue') },
  { path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('@/views/error/NotFound.vue') },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  if (to.path.startsWith('/fill/') && !to.query.preview) {
    const formId = to.params.formId as string
    const forms = getItem<FormSchema[]>('schemas') ?? []
    const form = forms.find((f) => f.id === formId)
    if (!form) return { name: 'notFound' }
    if (form.status === 'draft') return { name: 'error', query: { msg: '表单未发布' } }
    if (form.status === 'closed') return { name: 'error', query: { msg: '表单已停止收集' } }
  }
})

export default router
