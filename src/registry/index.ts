import type { ComponentSchema, ComponentType } from '@/types'
import { nanoid } from 'nanoid'

const defaultComponent: ComponentSchema = {
  id: '',
  type: 'input',
  field: '',
  label: '',
  required: false,
  hidden: false,
  editable: true,
  colspan: 1,
  appStyle: 0,
}

export function createDefaultComponent(type: ComponentType): ComponentSchema {
  const id = nanoid()
  const field = `${type}_${id.slice(0, 8)}`
  const base = { ...defaultComponent, id, type, field }

  switch (type) {
    case 'title':
      return {
        ...base,
        type: 'title',
        label: '大标题',
        field: '',
        colspan: 1,
        props: { fontSize: 24, textAlign: 'center' },
      }
    case 'subtitle':
      return { ...base, type: 'subtitle', label: '小标题', field: '', colspan: 1, props: { fontSize: 18 } }
    case 'group-title':
      return { ...base, type: 'group-title', label: '分组标题', field: '', colspan: 1 }
    case 'separator':
      return { ...base, type: 'separator', label: '', field: '', colspan: 1 }
    case 'point-out':
      return { ...base, type: 'point-out', label: '提示', field: '', colspan: 1, description: '提示内容' }
    case 'input':
      return { ...base, type: 'input', label: '单行文本', description: '请输入', props: { maxLength: 100 } }
    case 'textarea':
      return {
        ...base,
        type: 'textarea',
        label: '多行文本',
        description: '请输入',
        props: { autoSize: true, minRows: 1, maxRows: 10 },
      }
    case 'numeric':
      return { ...base, type: 'numeric', label: '数字', description: '请输入' }
    case 'serial-number':
      return { ...base, type: 'serial-number', label: '编号', editable: false }
    case 'chooser':
      return {
        ...base,
        type: 'chooser',
        label: '单选框',
        props: {
          options: [
            { label: '选项1', value: '0' },
            { label: '选项2', value: '1' },
          ],
        },
      }
    case 'multi-chooser':
      return {
        ...base,
        type: 'multi-chooser',
        label: '复选框',
        props: {
          options: [
            { label: '选项1', value: '0' },
            { label: '选项2', value: '1' },
          ],
          layoutDirection: 'horizontal',
        },
      }
    case 'selection':
      return {
        ...base,
        type: 'selection',
        label: '下拉框',
        description: '请选择',
        props: {
          options: [
            { label: '选项1', value: '0' },
            { label: '选项2', value: '1' },
          ],
        },
      }
    case 'cascader':
      return { ...base, type: 'cascader', label: '级联选框', description: '请选择' }
    case 'tree':
      return { ...base, type: 'tree', label: '树形选框', description: '请选择' }
    case 'date':
      return { ...base, type: 'date', label: '日期', description: '请选择日期', props: { dateType: 'date' } }
    case 'date-range':
      return {
        ...base,
        type: 'date-range',
        label: '日期区间',
        description: '请选择日期区间',
        props: { dateType: 'daterange' },
      }
    case 'image':
      return { ...base, type: 'image', label: '文件附件', props: { maxCount: 3, maxSize: 10240 } }
    case 'singleImage':
      return { ...base, type: 'singleImage', label: '图片', colspan: 1, props: { width: 200, height: 150 } }
    case 'signature':
      return { ...base, type: 'signature', label: '签名' }
    case 'rate':
      return { ...base, type: 'rate', label: '评分', props: { maxScore: 5, icon: 'star' } }
    case 'table':
      return {
        ...base,
        type: 'table',
        label: '表格',
        subComponents: [],
        props: { showTitle: true, initialRows: 3, columns: [], showIndex: true },
      }
    case 'cross-table':
      return {
        ...base,
        type: 'cross-table',
        label: '交叉表',
        subComponents: [],
        props: { showTitle: true, initialRows: 3, columns: [], showIndex: true },
      }
    case 'relation':
      return { ...base, type: 'relation', label: '关联查询', props: { showTitle: true } }
    case 'commitment':
      return { ...base, type: 'commitment', label: '承诺说明', description: '本人确认以上信息属实' }
    case 'region':
      return { ...base, type: 'region', label: '行政区划', description: '请选择地区' }
    case 'tree-structure':
      return { ...base, type: 'tree-structure', label: '树结构', description: '请选择' }
    case 'QRCode':
      return { ...base, type: 'QRCode', label: '二维码', editable: false, props: { content: '' } }
    default:
      return base
  }
}

export const COMPONENT_MENU = [
  { category: '基础字段', items: ['input', 'numeric', 'chooser', 'selection', 'date', 'rate', 'textarea', 'multi-chooser', 'date-range', 'serial-number', 'cascader', 'tree'] as ComponentType[] },
  { category: '展示布局', items: ['title', 'subtitle', 'group-title', 'separator', 'point-out'] as ComponentType[] },
  { category: '高级组件', items: ['image', 'singleImage', 'signature', 'table', 'cross-table', 'commitment', 'relation', 'region', 'tree-structure', 'QRCode'] as ComponentType[] },
]

/** 装饰类组件类型（无需显示标题、无数据交互） */
export const DECOR_TYPES: ComponentType[] = ['title', 'subtitle', 'group-title', 'separator', 'point-out']
