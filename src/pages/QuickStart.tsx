import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAccess } from '../app/access-context'
import { projectDestination } from '../services/asset-navigation'

export function QuickStart() {
  const { projectRole, visibleProjectIds } = useAccess()
  const [params] = useSearchParams()
  const requestedProject = params.get('project')
  const projectId = requestedProject && visibleProjectIds.includes(requestedProject) ? requestedProject : null
  const version = params.get('version') ?? 'draft'
  const routeParams = new URLSearchParams({ version })
  const role = projectId ? projectRole(projectId) : undefined
  const roleGuide = role === 'project-admin'
    ? '你可配置主题、运行设计检查、发布版本并生成交付包。'
    : role === 'editor'
      ? '你可配置主题并完成检查；发布和交付由项目管理员完成。'
      : projectId
        ? '你可查阅冻结规范、下载已就绪的交付物，修改请联系项目管理员。'
        : '先进入一个项目，系统会根据你的权限给出对应步骤。'
  const link = (section: string) => projectId ? projectDestination(projectId, section, routeParams) : '/projects'

  return <div className="page"><PageHeader title="快速开始" description={roleGuide}/>
    <section className="doc-section"><h2>1. 确认项目与版本</h2><p>所有项目资源都与项目和版本绑定。历史版本只读，不会被当前草稿覆盖。</p><Link to={link('')}>进入项目概览</Link></section>
    <section className="doc-section"><h2>2. 配置与检查</h2><p>编辑者先保存主题，再检查颜色对比度、组件和 Token 引用。规则检查不代替真实页面验收。</p><div className="doc-links"><Link to={link('foundations/theme')}>主题与风格</Link><Link to={link('audit')}>设计检查</Link></div></section>
    <section className="doc-section"><h2>3. 发布与交付</h2><p>发布前会检查匹配的组件运行时。AI 规范数据和可执行组件包分开交付，不会把仅数据快照写成可执行版本。</p><Link to={link('releases')}>查看版本与交付</Link></section>
    <section className="doc-section"><h2>4. 外部验收</h2><p>在真实业务工程中安装并锁定版本，验证主流程、错误恢复、窄屏和键盘操作，再回到版本页登记结果。</p></section>
  </div>
}
