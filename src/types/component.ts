// 30 种组件类型标识
export type ComponentType =
  // 装饰
  | 'title' | 'subtitle' | 'group-title' | 'separator' | 'point-out'
  // 输入
  | 'input' | 'textarea' | 'numeric' | 'serial-number'
  // 选择
  | 'chooser' | 'multi-chooser' | 'selection' | 'cascader' | 'tree'
  // 日期
  | 'date' | 'date-range'
  // 文件/媒体
  | 'image' | 'singleImage' | 'signature'
  // 评分
  | 'rate'
  // 高级/复合
  | 'table' | 'cross-table' | 'relation' | 'commitment'
  // 位置
  | 'region' | 'map-location'
  // 用户/组织
  | 'user-tree' | 'org-tree' | 'signature-name'
  // 其他
  | 'QRCode'

// 表格列支持的类型
export type TableColumnType =
  | 'input' | 'textarea' | 'numeric' | 'date'
  | 'selection' | 'chooser' | 'multi-chooser' | 'image'
