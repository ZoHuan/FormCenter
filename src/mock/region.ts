export interface RegionNode {
  label: string
  value: string
  children?: RegionNode[]
}

export const regionTree: RegionNode[] = [
  {
    label: '北京市',
    value: '110000',
    children: [
      { label: '朝阳区', value: '110105' },
      { label: '海淀区', value: '110108' },
      { label: '西城区', value: '110102' },
    ],
  },
  {
    label: '上海市',
    value: '310000',
    children: [
      { label: '浦东新区', value: '310115' },
      { label: '徐汇区', value: '310104' },
      { label: '静安区', value: '310106' },
    ],
  },
  {
    label: '广东省',
    value: '440000',
    children: [
      { label: '广州市', value: '440100' },
      { label: '深圳市', value: '440300' },
      { label: '东莞市', value: '441900' },
    ],
  },
  {
    label: '浙江省',
    value: '330000',
    children: [
      { label: '杭州市', value: '330100' },
      { label: '宁波市', value: '330200' },
    ],
  },
]

export function findRegionByValue(value: string): string[] {
  const path: string[] = []
  function search(nodes: RegionNode[], target: string): boolean {
    for (const node of nodes) {
      if (node.value === target) {
        path.push(node.label)
        return true
      }
      if (node.children && search(node.children, target)) {
        path.unshift(node.label)
        return true
      }
    }
    return false
  }
  search(regionTree, value)
  return path
}
