/** Only emit this example for snapshots whose Table API declares footer support. */
export function groupedTableMarkdown(packageName:string, mode:'project'|'candidate'):string {
 const helper=mode==='project'?'ProjectTheme':'PreviewScope'
 const extra=mode==='project'?'':`import type { CSSProperties } from 'react'\nimport tokens from '${packageName}/tokens.json'\n`
 const open=mode==='project'?'<ProjectTheme>':'<PreviewScope vars={tokens as CSSProperties}>'
 return `\n### 多级表头与合并分页\n\n用 children 表达分组，叶子列才对应数据字段。固定列放在两端；footer 属于表格外层容器，不放进横向滚动区。下面使用本版本真实 API，不使用 HeroUI 的组件名或属性。\n\n\`\`\`tsx
import { useState } from 'react'
${extra}import { ${helper}, DSTable, DSPagination, type DSTableColumn } from '${packageName}'
import '${packageName}/style.css'

type Person = { id: string; name: string; age: number; street: string; building: string; door: string; companyAddress: string; company: string; gender: string }
const columns: DSTableColumn<Person>[] = [
  { key: 'name', title: '姓名', width: 140, fixed: 'left' },
  { key: 'other', title: '个人信息', children: [
    { key: 'age', title: '年龄', width: 100, sortable: true },
    { key: 'address', title: '居住地址', children: [
      { key: 'street', title: '街道', width: 160 },
      { key: 'block', title: '楼栋信息', children: [
        { key: 'building', title: '楼栋', width: 90 },
        { key: 'door', title: '门牌号', width: 110 },
      ] },
    ] },
  ] },
  { key: 'companyGroup', title: '公司信息', children: [
    { key: 'companyAddress', title: '公司地址', width: 200 },
    { key: 'company', title: '公司名称', width: 180 },
  ] },
  { key: 'gender', title: '性别', width: 100, fixed: 'right' },
]
export function GroupedResourceTable({ rows }: { rows: Person[] }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)))
  return ${open}<DSTable aria-label="人员信息" columns={columns} data={rows} rowKey={row => row.id}
    stickyHeader sort={sort} onSortChange={setSort}
    pagination={{ page: current, pageSize, onPageChange: setPage }}
    footer={rows.length > 0 ? <DSPagination total={rows.length} page={current} pageSize={pageSize}
      pageSizeOptions={[10, 20, 50]} onPageChange={setPage}
      onPageSizeChange={size => { setPageSize(size); setPage(1) }} /> : undefined}
  /></${helper}>
}
\`\`\`\n`
}
