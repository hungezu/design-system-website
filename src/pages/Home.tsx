import { ArrowRight, FolderKanban, LayoutTemplate, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Home() {
  const entrances = [
    { to: '/components', icon: LayoutTemplate, title: '查找组件', description: '从交互预览开始，再按需查看 API、代码和变量。' },
    { to: '/templates', icon: Workflow, title: '查找页面方案', description: '直接体验查询列表、详情页和表单页的真实结构。' },
  ]

  return <div className="page page--home">
    <section className="home-intro gkx-home-intro">
      <div className="home-intro__copy"><h1>设计系统工作台</h1><h2>配置项目风格，查找并复用资源</h2><p>直接浏览团队内跨项目共用的组件与页面方案，或进入项目应用已保存的主题、组件和版本上下文。</p></div>
      <Link className="primary-action" to="/projects"><FolderKanban size={16} />进入项目<ArrowRight size={16} /></Link>
    </section>
    <section className="home-entrances" aria-labelledby="entrances-title"><div className="section-heading"><div><h2 id="entrances-title">常用入口</h2><p>公开页面只保留完成任务所需的信息；开发与管理内容在详情中按需展开。</p></div></div><div className="entrance-list">{entrances.map(({ to, icon: Icon, title, description }) => <Link key={to} to={to} className="entrance-row"><Icon size={19} strokeWidth={1.7} aria-hidden="true" /><span className="entrance-row__copy"><strong>{title}</strong><small>{description}</small></span><ArrowRight size={17} aria-hidden="true" /></Link>)}</div></section>
  </div>
}
