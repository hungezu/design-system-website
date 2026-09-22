import { PreviewScope } from '../design-system/theme/PreviewScope'
import { memo, useState, type CSSProperties } from 'react'
import { DSBadge, DSButton, DSCard, DSInput, DSSelect, DSTable, DSDialog, DSDrawer } from '../runtime'

interface PreviewRow {
  id: string
  name: string
  type: string
  owner: string
  updatedAt: string
}

const previewRows: PreviewRow[] = [
  { id: '1', name: '政策数据库', type: '数据资源', owner: '内容运营', updatedAt: '09-16 14:30' },
  { id: '2', name: '专家信息库', type: '业务应用', owner: '内容运营', updatedAt: '09-15 10:20' },
  { id: '3', name: '专题配置', type: '数据资源', owner: '研究中心', updatedAt: '09-14 09:10' },
]

const tableColumns = [
  { key: 'name', title: '资源名称', width: 170 },
  { key: 'type', title: '类型', width: 110 },
  { key: 'owner', title: '负责人', width: 110 },
  { key: 'updatedAt', title: '更新时间', width: 120 },
]

export const ThemePreview = memo(function ThemePreview({ style, title = '资源管理', variant = 'page' }: { style: CSSProperties; title?: string; variant?: 'components' | 'page' }) {
  const [feedback, setFeedback] = useState('')
  const [overlay,setOverlay]=useState<'dialog'|'drawer'|null>(null)
  const componentMode = variant === 'components'

  return <PreviewScope vars={style}><div className={`theme-system-preview theme-system-preview--${variant}`} style={style}>
    {!componentMode && <aside><strong>{title}</strong><span className="active">工作台</span><span>资源管理</span><span>系统设置</span></aside>}
    <main>
      <header>
        <div><strong>{componentMode ? '组件预览' : '资源管理'}</strong><span>主题仅作用于项目预览</span></div>
      </header>

      {componentMode ? <div className="theme-preview-components">
        <section className="theme-preview-component-group">
          <h3>按钮尺寸</h3>
          <div className="theme-preview-button-row">
            <DSButton size="sm" variant="secondary">小号按钮</DSButton><DSButton variant="primary" onClick={() => setFeedback('主要操作已触发')}>主要按钮</DSButton><DSButton size="lg" variant="secondary">大号按钮</DSButton>
            <DSButton variant="secondary" onClick={() => setFeedback('次要操作已触发')}>次要按钮</DSButton>
          </div>
        </section>
        <section className="theme-preview-component-group theme-preview-field-grid">
          <h3>表单控件</h3>
          <DSInput label="资源名称" placeholder="输入内容" />
          <DSSelect label="资源类型" placeholder="请选择" options={[{ value: 'data', label: '数据资源' }, { value: 'app', label: '业务应用' }]} />
        </section>
        <DSCard title="内容卡片" className="theme-preview-card">
          <p>用于验证背景、边框、圆角和阴影。</p>
          <div className="theme-preview-status"><DSBadge tone="success">成功</DSBadge><DSBadge tone="warning">警告</DSBadge><DSBadge tone="error">错误</DSBadge></div>
        </DSCard>
      </div> : <div className="theme-preview-controls">
        <DSInput className="theme-preview-search" label="关键词" placeholder="输入名称" />
        <DSSelect label="状态" defaultValue="all" options={[{ value: 'all', label: '全部状态' }, { value: 'review', label: '审核中' }]} />
        <DSButton variant="primary" onClick={() => setFeedback('查询已更新')}>查询</DSButton>
      </div>}

      <div className="ds-table-toolbar"><DSButton variant="primary" onClick={() => setFeedback('已触发新增操作')}>新增资源</DSButton></div>
      <div className="theme-preview-overlay-actions"><DSButton variant="secondary" onClick={()=>setOverlay('dialog')}>预览对话框边距</DSButton><DSButton variant="secondary" onClick={()=>setOverlay('drawer')}>预览抽屉边距</DSButton></div>
      <DSDialog title="主题对话框预览" open={overlay==='dialog'} onOpenChange={open=>!open&&setOverlay(null)} footer={<DSButton variant="primary" onClick={()=>setOverlay(null)}>完成预览</DSButton>}><DSInput label="预览字段" placeholder="检查高度与内边距"/><p>此内容区使用项目的弹层内边距。</p></DSDialog>
      <DSDrawer title="主题抽屉预览" open={overlay==='drawer'} onOpenChange={open=>!open&&setOverlay(null)}><DSInput label="抽屉预览字段" placeholder="检查高度与内边距"/><p>调整项目参数后重新打开，检查实际效果。</p></DSDrawer>
      <DSTable className="theme-preview-table" columns={tableColumns} data={previewRows} rowKey={(row: PreviewRow) => row.id} density="comfortable" />
      <p className="theme-preview-feedback" role="status" aria-live="polite">{feedback}</p>
    </main>
  </div></PreviewScope>
})
