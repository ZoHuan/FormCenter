import type { ComponentSchema } from '@/types'
import { nanoid } from 'nanoid'

function c(type: string, label: string, field: string, overrides: Partial<ComponentSchema> = {}): ComponentSchema {
  return {
    id: nanoid(), type: type as ComponentSchema['type'], field, label,
    required: false, hidden: false, editable: true, colspan: 1, appStyle: 0, ...overrides,
  }
}

export const leaveTemplate: Omit<ComponentSchema, 'components'> & { components: ComponentSchema[] } = {
  title: '请假申请表',
  description: '请如实填写请假信息',
  components: [
    c('title', '请假申请表', '', { colspan: 1 }),
    c('input', '姓名', 'name', { required: true, description: '请输入姓名' }),
    c('selection', '部门', 'dept', { required: true, description: '请选择部门', props: { options: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '行政部', value: 'admin' }] } }),
    c('chooser', '请假类型', 'leaveType', { required: true, props: { options: [{ label: '事假', value: 'personal' }, { label: '年假', value: 'annual' }, { label: '病假', value: 'sick' }, { label: '其他', value: 'other' }] } }),
    c('date', '开始日期', 'startDate', { required: true }),
    c('date', '结束日期', 'endDate', { required: true }),
    c('textarea', '请假事由', 'reason', { required: true, description: '请详细说明请假原因' }),
  ],
}

export const eventTemplate: Omit<ComponentSchema, 'components'> & { components: ComponentSchema[] } = {
  title: '活动报名表',
  description: '欢迎报名参加本次活动',
  components: [
    c('title', '活动报名表', '', { colspan: 1 }),
    c('input', '姓名', 'name', { required: true }),
    c('input', '联系电话', 'phone', { required: true, props: { format: 'phone' } }),
    c('input', '邮箱', 'email', { props: { format: 'email' } }),
    c('selection', '参与人数', 'count', { required: true, props: { options: [{ label: '1人', value: '1' }, { label: '2人', value: '2' }, { label: '3人及以上', value: '3' }] } }),
    c('multi-chooser', '感兴趣的方向', 'interest', { props: { options: [{ label: '前端', value: 'frontend' }, { label: '后端', value: 'backend' }, { label: '设计', value: 'design' }, { label: '产品', value: 'product' }] } }),
    c('textarea', '备注', 'remark', { description: '如有特殊需求请注明' }),
  ],
}

export const surveyTemplate: Omit<ComponentSchema, 'components'> & { components: ComponentSchema[] } = {
  title: '满意度调查',
  description: '感谢你抽出时间填写',
  components: [
    c('title', '满意度调查', '', { colspan: 1 }),
    c('rate', '整体满意度', 'overall', { required: true, props: { maxScore: 5 } }),
    c('chooser', '产品质量', 'quality', { required: true, props: { options: [{ label: '非常满意', value: '5' }, { label: '满意', value: '4' }, { label: '一般', value: '3' }, { label: '不满意', value: '2' }, { label: '非常不满意', value: '1' }] } }),
    c('chooser', '服务态度', 'service', { required: true, props: { options: [{ label: '非常满意', value: '5' }, { label: '满意', value: '4' }, { label: '一般', value: '3' }] } }),
    c('chooser', '响应速度', 'speed', { required: true, props: { options: [{ label: '非常满意', value: '5' }, { label: '满意', value: '4' }, { label: '一般', value: '3' }] } }),
    c('textarea', '建议', 'suggestion', { description: '请留下你的宝贵建议' }),
    c('commitment', '确认', 'confirm', { required: true, label: '本人确认以上评价真实有效' }),
  ],
}

export const collectTemplate: Omit<ComponentSchema, 'components'> & { components: ComponentSchema[] } = {
  title: '信息收集表',
  description: '请完整填写以下信息',
  components: [
    c('title', '信息收集表', '', { colspan: 1 }),
    c('input', '姓名', 'name', { required: true }),
    c('input', '手机号', 'phone', { required: true, props: { format: 'phone' } }),
    c('input', '邮箱', 'email', { props: { format: 'email' } }),
    c('input', '公司', 'company', { required: true }),
    c('selection', '职位', 'position', { props: { options: [{ label: '经理', value: 'manager' }, { label: '主管', value: 'lead' }, { label: '专员', value: 'staff' }] } }),
    c('textarea', '备注', 'remark', { description: '其他需要说明的信息' }),
  ],
}

export const templates: Record<string, Omit<ComponentSchema, 'components'> & { components: ComponentSchema[] }> = {
  leave: leaveTemplate,
  event: eventTemplate,
  survey: surveyTemplate,
  collect: collectTemplate,
}
