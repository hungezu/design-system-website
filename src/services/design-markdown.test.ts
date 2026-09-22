import { expect, it } from 'vitest'
import { generateProjectDesignMarkdown } from './design-markdown'
import { createReleaseSnapshot, validateSnapshot } from './release-snapshot'
import { guokexinProject, testCustomerBProject } from '../data/projects'
import { defaultProjectTheme } from './project-theme'
const make = (project = guokexinProject, version = '8.0.0', color = '#123456') => createReleaseSnapshot({ project, theme: { ...defaultProjectTheme(project), brandPrimary: color }, version, status: 'published' })
const options = { packageName: '@design-workspace/guokexin', archiveName: 'design-workspace-guokexin-8.0.0.tgz', mode: 'project' as const }
it('新快照提供有操作含义的 AI 入口，快照完整性仍通过', () => {
 const snapshot = make(); expect(validateSnapshot(snapshot)).toBe(snapshot)
 expect(snapshot.assets['ai-rules.md']).toContain('文本输入使用 DSInput')
 expect(snapshot.assets['ai-rules.md']).toContain('不是可执行组件包')
 expect(snapshot.assets['ai-rules.md']).toContain('patterns.json')
})
it('设计规范只读取冻结项目及版本，不用当前默认品牌覆盖', () => {
 const snapshot = make(); const md = generateProjectDesignMarkdown(snapshot, options)
 expect(md).toContain('projectId: "guokexin"'); expect(md).toContain('releaseVersion: "8.0.0"')
 expect(md).toContain('| `--brand-primary` | #123456 |')
 expect(md).not.toContain('| `--brand-primary` | #165DFF |')
 expect(md).toContain('variant=primary/secondary/tertiary'); expect(md).toContain('不得写 variant=danger')
 expect(md).toContain("import { ProjectTheme, DSButton, DSInput, DSTable, DSPagination } from '@design-workspace/guokexin'")
 expect(md).toContain('onPageSizeChange={size => { setPageSize(size); setPage(1) }}')
 expect(md).toContain('`onPageChange: ((page: number) => void) | undefined`')
 expect(md).toContain('`onPageSizeChange: ((pageSize: number) => void) | undefined`')
 expect(md).toContain('`onSortChange:')
 expect(md).toContain('`onClick:')
 expect(md).toContain('`onFiles（必填）:')
 const components = snapshot.assets['components.json'] as { availableComponents: Array<{runtimeExport:string;props:Array<{name:string;required:boolean}>}> }
 for (const component of components.availableComponents.filter(item => item.runtimeExport !== 'DSButton')) {
   const line = md.split('\n').find(value => value.startsWith(`- **${component.runtimeExport}**`))!
   for (const prop of component.props.filter(item => item.required || /^on[A-Z]/.test(item.name))) expect(line).toContain(`\`${prop.name}`)
 }
})
it('另一个项目使用自己的包名、主题与批准清单', () => {
 const snapshot = make(testCustomerBProject, '8.0.0', '#006A70')
 const md = generateProjectDesignMarkdown(snapshot, { ...options, packageName: '@design-workspace/test-customer-b', archiveName: 'design-workspace-test-customer-b-8.0.0.tgz' })
 expect(md).toContain('| `--brand-primary` | #006A70 |')
 expect(md).not.toContain('**DSUpload**')
 expect(md).not.toContain("from '@design-workspace/guokexin'")
 expect(() => generateProjectDesignMarkdown(snapshot, options)).toThrow('不属于当前项目')
})
it('缺少列表组件时只生成主题容器，不猜测未批准的组件', () => {
 const snapshot = make({ ...guokexinProject, componentIds: ['button'] })
 const md = generateProjectDesignMarkdown(snapshot, options)
 const code = [...md.matchAll(/```tsx\n([\s\S]*?)```/g)].map(match => match[1]).join('\n')
 expect(code).toContain('ProjectTheme'); expect(code).not.toContain('DSTable')
 expect(md).toContain('批准清单不足')
})
it('示例变量全部存在，缺失 Token 或身份不一致时拒绝生成', () => {
 const snapshot = make(); const md = generateProjectDesignMarkdown(snapshot, options)
 for (const match of md.matchAll(/var\((--[a-z0-9-]+)\)/g)) expect(snapshot.assets['tokens.json']).toHaveProperty(match[1])
 const bad = structuredClone(snapshot)
 delete (bad.assets['tokens.json'] as Record<string,string>)['--brand-primary']
 expect(() => generateProjectDesignMarkdown(bad, options)).toThrow('缺少必要 Token')
 const foreign = structuredClone(snapshot); foreign.entry.version = '9.0.0'
 expect(() => generateProjectDesignMarkdown(foreign, options)).toThrow('项目或版本不一致')
})
it('本地候选清楚标注状态，使用真实候选包的主题入口', () => {
 const snapshot = createReleaseSnapshot({ project: guokexinProject, theme: defaultProjectTheme(guokexinProject), version: '0.0.0-local.test', status: 'candidate' })
 const md = generateProjectDesignMarkdown(snapshot, { mode: 'candidate', packageName: '@local/design-system', archiveName: 'local-design-system-0.0.0-local.test.tgz' })
 expect(md).toContain('这是本地候选'); expect(md).toContain("import tokens from '@local/design-system/tokens.json'")
 expect(md).toContain('<PreviewScope vars={tokens as CSSProperties}>')
})
it('表格位置与选择范围来自冻结合同，旧快照不会冒充已具备新约定',()=>{
 const snapshot=make();const contract=(snapshot.assets['patterns.json'] as {tableLayout:Record<string,unknown>}).tableLayout
 expect(contract).toHaveProperty('pagination.controlsAlign','right-edge')
 expect(contract).toHaveProperty('selection.headerScope','current-page')
 expect(contract).toHaveProperty('toolbar.primaryActionAlign','left')
 expect(contract).toHaveProperty('toolbar.rowActionEndPadding',16)
 expect(contract).toHaveProperty('toolbar.bulkBackgroundToken','surface-secondary')
 expect(contract).toHaveProperty('toolbar.fixedActionShadowToken','shadow-table-fixed')
 expect(contract).toHaveProperty('pagination.totalContent','count-only')
 const md=generateProjectDesignMarkdown(snapshot,options)
 expect(md).toContain('分页在滚动区之外');expect(md).toContain('全选当前页');expect(md).toContain('放在独立批量条')
 expect(md).toContain('children: [');expect(md).toContain('footer={')
 expect(contract).toHaveProperty('composition.groupedHeaders','recursive-children')
 const old=structuredClone(snapshot);delete (old.assets['patterns.json'] as {tableLayout?:unknown}).tableLayout
 expect(generateProjectDesignMarkdown(old,options)).toContain('本版本没有冻结表格布局合同')
})
