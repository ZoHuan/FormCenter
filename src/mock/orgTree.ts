export interface OrgNode {
  label: string
  value: string
  children?: OrgNode[]
}

export const orgTree: OrgNode[] = [
  {
    label: '总公司', value: 'root', children: [
      {
        label: '技术中心', value: 'tech', children: [
          { label: '前端组', value: 'frontend' },
          { label: '后端组', value: 'backend' },
        ],
      },
      {
        label: '产品中心', value: 'product', children: [
          { label: '产品一组', value: 'prod1' },
          { label: '产品二组', value: 'prod2' },
        ],
      },
      { label: '行政中心', value: 'admin' },
    ],
  },
]
