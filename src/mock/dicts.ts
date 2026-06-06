export const genderDict = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

export const educationDict = [
  { label: '高中及以下', value: 'highschool' },
  { label: '大专', value: 'college' },
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'phd' },
]

export const departmentDict = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '设计部', value: 'design' },
  { label: '市场部', value: 'marketing' },
  { label: '销售部', value: 'sales' },
  { label: '行政部', value: 'admin' },
  { label: '财务部', value: 'finance' },
  { label: '人事部', value: 'hr' },
]

export const dicts: Record<string, { label: string; value: string }[]> = {
  gender: genderDict,
  education: educationDict,
  department: departmentDict,
}
