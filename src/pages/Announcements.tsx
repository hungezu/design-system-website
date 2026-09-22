import { Info } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export function Announcements() {
  return <div className="page"><PageHeader title="公告" description="面向设计与开发使用者的产品更新和能力边界。" /><div className="announcement-list"><article className="announcement"><Info size={18} /><div><strong>本地演示能力说明</strong><p>设计检查和规则生成仍使用本地数据；草稿可冻结为当前浏览器内的正式版本，云端发布、审核与鉴权仍需要服务端支持。</p></div></article></div></div>
}
