import { Link, useLocation } from 'react-router-dom'

export function NotFound() {
  const location = useLocation()
  return <div className="page route-state"><h1>页面不存在</h1><p>无法找到 <code>{location.pathname}</code>，链接可能已失效。</p><Link className="primary-action" to="/">返回概览</Link></div>
}
