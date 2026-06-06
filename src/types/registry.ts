import type { ComponentType, ComponentSchema } from './component'

export interface PropertyEditor {
  key: string
  label: string
  section: 'basic' | 'options' | 'validation' | 'advanced'
  control: 'input' | 'textarea' | 'switch' | 'select' | 'number' | 'color' | 'list' | 'dialog'
  options?: { label: string; value: unknown }[]
  defaultValue: unknown
}

export interface ComponentRegistry {
  type: ComponentType
  label: string
  category: string
  defaultProps: Partial<ComponentSchema>
  editors: PropertyEditor[]
}
