// 26 种组件类型标识
export type ComponentType =
  // 装饰
  | 'title'
  | 'subtitle'
  | 'group-title'
  | 'separator'
  | 'point-out'
  // 输入
  | 'input'
  | 'textarea'
  | 'numeric'
  | 'serial-number'
  // 选择
  | 'chooser'
  | 'multi-chooser'
  | 'selection'
  | 'cascader'
  | 'tree'
  // 日期
  | 'date'
  | 'date-range'
  // 文件/媒体
  | 'file'
  | 'image'
  | 'signature'
  // 评分
  | 'rate'
  // 高级/复合
  | 'table'
  | 'cross-table'
  | 'relation'
  | 'commitment'
  // 树结构
  | 'tree-structure'
  // 其他
  | 'QRCode'

// 表格列支持的类型
export type TableColumnType =
  | 'input'
  | 'textarea'
  | 'numeric'
  | 'date'
  | 'selection'
  | 'chooser'
  | 'multi-chooser'
  | 'image'

export interface TriggerRule {
  id: string
  type: 'trigger'
  sourceField: string
  sourceValue: string
  targetField: string
  action: 'show' | 'hide' | 'require' | 'optional' | 'enable' | 'disable'
}

export interface ValidationRule {
  id: string
  type: 'validation' | 'calculation' | 'logic' | 'reset'
  description?: string
  expression?: string
  targetField?: string
  condition?: string
  message?: string
  sourceField?: string
  resetTargets?: string[]
}

export interface ComponentBase {
  id: string
  type: ComponentType
  field: string
  label: string
  required: boolean
  hidden: boolean
  editable: boolean
  colspan: 1 | 2 | 3 | 4
  appStyle: 0 | 1
  defaultValue?: unknown
  description?: string
  tooltip?: string
  triggerRules?: TriggerRule[]
  validationRules?: ValidationRule[]
}

export interface TableColumnSchema {
  id: string
  title: string
  field: string
  type: TableColumnType
  width?: number
  required?: boolean
  hidden?: boolean
  editable?: boolean
  description?: string
  defaultValue?: unknown
}

export type ComponentProps = Record<string, unknown>

export type ComponentSchema = ComponentBase &
  ComponentProps & {
    subComponents?: ComponentSchema[]
    fillup?: unknown[]
  }
