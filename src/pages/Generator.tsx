import {
  ArrowDown, ArrowUp, Check, ChevronRight, CirclePlus, Download, FileJson, FolderTree,
  Lock, Plus, RotateCcw, Save, Trash2, Undo2, Unlock,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type SetStateAction } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { LayoutCanvas } from '../components/LayoutCanvas'
import { PageTabs, Stepper } from '../components/NavigationControls'
import { Button } from '../design-system/primitives/Button'
import { DSIconAction } from '../design-system/primitives/IconAction'
import { getLayoutPrimitive, layoutPrimitives } from '../framework/data/layout-primitives'
import {
  addLayoutNode,
  createCustomRegion,
  createLayoutRegion,
  generateInformationArchitecture,
  generatePageLayouts,
  generateSystemLayout,
  getLayoutNodes,
  moveLayoutNode,
  removeLayoutNode,
  reparentLayoutNode,
  updateLayoutNode,
} from '../framework/services/generation-service'
import type {
  InformationArchitectureNode,
  LayoutNode,
  LayoutPrimitiveType,
  ProductPageBrief,
  ProductBrief,
  GeneratedSystem,
  ThemeSpec,
} from '../framework/types/generation'
import { guokexinProductBrief, guokexinTheme } from '../instances/guokexin'
import { createStableId, createThemePreviewStyle, loadWorkbenchDraft, saveWorkbenchDraft, WORKBENCH_DRAFT_KEY, type WorkbenchDraft } from '../services/workbench-draft'

const steps = ['产品方案', '信息架构', '系统骨架', '页面布局', '主题', '预览']
const taskOptions = ['搜索', '筛选', '查看', '编辑', '批量操作', '审批', '导入', '导出']
function downloadText(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

const cloneLayout = (root: LayoutNode): LayoutNode => structuredClone(root)

function ArchitectureTree({ node, depth = 0 }: { node: InformationArchitectureNode; depth?: number }) {
  return <div className="ia-node" style={{ '--ia-depth': depth } as CSSProperties}><span><i>{node.type === 'system' ? '系统' : node.type === 'module' ? '模块' : '页面'}</i><strong>{node.name}</strong>{node.route && <code>{node.route}</code>}</span>{node.children?.map((child) => <ArchitectureTree key={child.id} node={child} depth={depth + 1} />)}</div>
}

function BusinessPagePreview({ style, title }: { style: CSSProperties; title: string }) {
  return <div className="business-preview" style={style}><aside><strong>{title}</strong><span>工作台</span><span>资源管理</span><span>系统设置</span></aside><main><header><div><strong>资源管理</strong><span>查看与维护当前业务资源</span></div><span className="business-preview__action">新增资源</span></header><div className="business-preview__filters"><label>关键词<input aria-label="预览关键词" placeholder="输入名称" /></label><label>状态<select aria-label="预览状态"><option>全部状态</option><option>审核中</option></select></label><span className="business-preview__action">查询</span></div><div className="business-preview__table"><div><strong>资源名称</strong><strong>类型</strong><strong>负责人</strong><strong>更新时间</strong><strong>操作</strong></div>{['政策数据库', '专家信息库', '专题配置'].map((item, index) => <div key={item}><span>{item}</span><span>{index === 1 ? '业务应用' : '数据资源'}</span><span>内容运营</span><span>09-16 14:30</span><span>查看</span></div>)}</div></main></div>
}

export function Generator() {
  const initial = useMemo(() => loadWorkbenchDraft(), [])
  const initialBrief = initial?.brief ?? structuredClone(guokexinProductBrief)
  const [step, setStep] = useState(initial?.step ?? 0)
  const [furthestStep, setFurthestStep] = useState(initial?.furthestStep ?? 0)
  const [brief, setBrief] = useState<ProductBrief>(initialBrief)
  const [ia, setIa] = useState(() => initial?.ia ?? generateInformationArchitecture(initialBrief))
  const [layoutSpec, setLayoutSpec] = useState(() => initial?.layoutSpec ?? generateSystemLayout(initialBrief))
  const firstCandidate = layoutSpec.candidates[0]
  const [selectedCandidateId, setSelectedCandidateId] = useState(initial?.selectedCandidateId ?? firstCandidate.id)
  const [activeLayout, setActiveLayout] = useState<LayoutNode>(() => initial?.activeLayout ?? cloneLayout(firstCandidate.root))
  const [selectedNodeId, setSelectedNodeId] = useState(activeLayout.id)
  const [pageSpecs, setPageSpecs] = useState(() => initial?.pageSpecs ?? generatePageLayouts(initialBrief))
  const [selectedPageId, setSelectedPageId] = useState(initial?.selectedPageId ?? pageSpecs[0]?.id ?? '')
  const [theme, setTheme] = useState<ThemeSpec>(initial?.theme ?? structuredClone(guokexinTheme))
  const [urlParams, setUrlParams] = useSearchParams()
  const previewMode = (['skeleton', 'pages', 'page', 'theme'].includes(urlParams.get('preview') ?? '') ? urlParams.get('preview') : 'skeleton') as 'skeleton' | 'pages' | 'page' | 'theme'
  const [newRole, setNewRole] = useState('')
  const [newModule, setNewModule] = useState('')
  const [newPage, setNewPage] = useState('')
  const [newPageType, setNewPageType] = useState<ProductPageBrief['type']>('custom')
  const [newPageModuleId, setNewPageModuleId] = useState(guokexinProductBrief.modules[0].id)
  const [newRegionType, setNewRegionType] = useState<LayoutPrimitiveType>('custom-region')
  const [newRegionLabel, setNewRegionLabel] = useState('实时监控区域')
  const [dirty, setDirty] = useState(false)
  const [notice, setNotice] = useState(initial ? '已恢复本地草稿' : '')
  const [undo, setUndo] = useState<null | { label: string; restore: () => void }>(null)
  const initialized = useRef(false)

  const selectedNode = useMemo(() => getLayoutNodes(activeLayout).find((item) => item.id === selectedNodeId) ?? activeLayout, [activeLayout, selectedNodeId])
  const parentOptions = useMemo(() => getLayoutNodes(activeLayout).filter((item) => item.id !== selectedNodeId && !item.locked && (item.type === 'root' || getLayoutPrimitive(item.type)?.acceptsChildren)), [activeLayout, selectedNodeId])
  const selectedPage = pageSpecs.find((page) => page.id === selectedPageId) ?? pageSpecs[0]
  const selectedCandidate = layoutSpec.candidates.find((candidate) => candidate.id === selectedCandidateId) ?? layoutSpec.candidates[0]
  const briefChecks = [
    { label: '产品定位', complete: Boolean(brief.productName.trim() && brief.productType.trim() && brief.businessGoal.trim()) },
    { label: '用户角色', complete: brief.userRoles.length > 0 },
    { label: '业务模块', complete: brief.modules.length > 0 },
    { label: '页面清单', complete: brief.pages.length > 0 },
    { label: '核心任务', complete: brief.coreTasks.length > 0 },
  ]
  const completedBriefChecks = briefChecks.filter((item) => item.complete).length
  const briefReady = completedBriefChecks === briefChecks.length
  const generatedSystem = useMemo<GeneratedSystem>(() => {
    return {
      id: `${brief.id}-generated`,
      instanceId: 'guokexin',
      productBrief: brief,
      informationArchitecture: ia,
      systemLayout: {
        ...layoutSpec,
        selectedCandidateId,
        candidates: layoutSpec.candidates.map((candidate) => candidate.id === selectedCandidateId ? { ...candidate, root: activeLayout } : candidate),
      },
      pageSpecs,
      theme,
      generatedBy: 'rule-based-demo',
      generatedAt: 'local-session',
    }
  }, [activeLayout, brief, ia, layoutSpec, pageSpecs, selectedCandidateId, theme])
  const currentDraft = useMemo<WorkbenchDraft>(() => ({ step, furthestStep, brief, ia, layoutSpec, selectedCandidateId, activeLayout, pageSpecs, selectedPageId, theme }), [activeLayout, brief, furthestStep, ia, layoutSpec, pageSpecs, selectedCandidateId, selectedPageId, step, theme])

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return }
    setDirty(true)
  }, [activeLayout, brief, furthestStep, ia, layoutSpec, pageSpecs, selectedCandidateId, selectedPageId, step, theme])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      saveWorkbenchDraft(currentDraft)
      setDirty(false)
      setNotice('草稿已自动保存')
    }, 700)
    return () => window.clearTimeout(timer)
  }, [currentDraft, dirty])

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
    }
    const protectInternalNavigation = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null
      if (!dirty || !link || link.target === '_blank' || link.origin !== location.origin) return
      if (!window.confirm('当前修改尚未保存，确定离开生成工作台吗？')) event.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)
    document.addEventListener('click', protectInternalNavigation, true)
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', protectInternalNavigation, true) }
  }, [dirty])

  const saveDraft = (message = '草稿已保存') => {
    saveWorkbenchDraft(currentDraft)
    setDirty(false)
    setNotice(message)
  }

  const clearDraft = () => {
    if (!window.confirm('确定清空本地草稿并恢复初始方案吗？')) return
    localStorage.removeItem(WORKBENCH_DRAFT_KEY)
    const nextBrief = structuredClone(guokexinProductBrief)
    const nextIa = generateInformationArchitecture(nextBrief)
    const nextLayoutSpec = generateSystemLayout(nextBrief)
    const nextPages = generatePageLayouts(nextBrief)
    setStep(0); setFurthestStep(0); setBrief(nextBrief); setIa(nextIa); setLayoutSpec(nextLayoutSpec)
    setSelectedCandidateId(nextLayoutSpec.candidates[0].id); setActiveLayout(cloneLayout(nextLayoutSpec.candidates[0].root)); setSelectedNodeId(nextLayoutSpec.candidates[0].root.id)
    setPageSpecs(nextPages); setSelectedPageId(nextPages[0]?.id ?? ''); setTheme(structuredClone(guokexinTheme)); setUndo(null); setNotice('草稿已清空，已恢复初始方案')
  }

  const removeBriefItem = (label: string, next: ProductBrief) => {
    if (!window.confirm(`确定删除${label}吗？相关内容也可能被移除。`)) return
    const previous = structuredClone(brief)
    updateBrief(next)
    setUndo({ label, restore: () => { setBrief(previous); setUndo(null); setNotice(`已撤销删除${label}`) } })
    setNotice(`已删除${label}`)
  }

  const advanceTo = (nextStep: number) => {
    setFurthestStep((current) => Math.max(current, nextStep))
    setStep(nextStep)
  }

  const updateBrief = (updater: SetStateAction<ProductBrief>) => {
    setBrief(updater)
    setFurthestStep(0)
  }

  const updateActiveLayout = (nextLayout: LayoutNode) => {
    setActiveLayout(nextLayout)
    setFurthestStep((current) => Math.min(current, 2))
  }

  const generateIa = () => {
    const next = generateInformationArchitecture(brief)
    setIa(next)
    advanceTo(1)
  }

  const generateLayouts = () => {
    const next = generateSystemLayout(brief)
    setLayoutSpec(next)
    setSelectedCandidateId(next.candidates[0].id)
    setActiveLayout(cloneLayout(next.candidates[0].root))
    setSelectedNodeId(next.candidates[0].root.id)
    advanceTo(2)
  }

  const generatePages = () => {
    const next = generatePageLayouts(brief)
    setPageSpecs(next)
    setSelectedPageId(next[0]?.id ?? '')
    advanceTo(3)
  }

  const chooseCandidate = (candidateId: string) => {
    const candidate = layoutSpec.candidates.find((item) => item.id === candidateId)
    if (!candidate) return
    const nextRoot = cloneLayout(candidate.root)
    setSelectedCandidateId(candidate.id)
    setActiveLayout(nextRoot)
    setSelectedNodeId(nextRoot.id)
    setFurthestStep((current) => Math.min(current, 2))
  }

  const addRole = () => {
    const name = newRole.trim()
    if (!name) { setNotice('角色名称不能为空'); return }
    if (brief.userRoles.some((item) => item.name === name)) { setNotice('角色名称不能重复'); return }
    updateBrief((current) => ({ ...current, targetUsers: [...current.targetUsers, name], userRoles: [...current.userRoles, { id: createStableId('role'), name, responsibilities: [] }] }))
    setNewRole('')
  }

  const addModule = () => {
    const name = newModule.trim()
    if (!name) { setNotice('模块名称不能为空'); return }
    if (brief.modules.some((item) => item.name === name)) { setNotice('模块名称不能重复'); return }
    updateBrief((current) => ({ ...current, modules: [...current.modules, { id: createStableId('module'), name, description: '设计师新增业务模块。', pageIds: [] }] }))
    setNewModule('')
  }

  const addPage = () => {
    const name = newPage.trim()
    const moduleId = brief.modules.some((item) => item.id === newPageModuleId) ? newPageModuleId : brief.modules[0]?.id
    if (!name) { setNotice('页面名称不能为空'); return }
    if (!moduleId) { setNotice('请先创建页面所属模块'); return }
    if (brief.pages.some((item) => item.name === name)) { setNotice('页面名称不能重复'); return }
    const pageId = createStableId('page')
    updateBrief((current) => ({
      ...current,
      pages: [...current.pages, { id: pageId, name, type: newPageType, tasks: ['查看'], moduleId }],
      modules: current.modules.map((item) => item.id === moduleId ? { ...item, pageIds: [...item.pageIds, pageId] } : item),
    }))
    setNewPage('')
  }

  const updateTheme = (patch: Partial<ThemeSpec>, tokenPatch: Record<string, string> = {}) => {
    setTheme((current) => ({ ...current, ...patch, tokenOverrides: { ...current.tokenOverrides, ...tokenPatch } }))
    setFurthestStep((current) => Math.min(current, 4))
  }

  const themePreviewStyle = createThemePreviewStyle(theme)

  const changePreviewMode = (mode: string) => {
    const next = new URLSearchParams(urlParams)
    if (mode === 'skeleton') next.delete('preview')
    else next.set('preview', mode)
    setUrlParams(next, { replace: true })
  }

  const exportJson = () => downloadText(`${brief.id}-generated-system.json`, JSON.stringify(generatedSystem, null, 2), 'application/json')
  const exportCss = () => downloadText(`${brief.id}-tokens.css`, `:root {\n${Object.entries(theme.tokenOverrides).map(([key, value]) => `  --${key}: ${value};`).join('\n')}\n}`, 'text/css')
  const downloadConfig = () => downloadText(`${brief.id}-config.json`, JSON.stringify({ productBrief: brief, theme, selectedCandidateId }, null, 2), 'application/json')
  const createVersion = () => {
    const versions = JSON.parse(localStorage.getItem('design-intelligence-local-versions') ?? '[]') as Array<{ id: string; createdAt: string }>
    const createdAt = new Date().toISOString()
    versions.unshift({ id: createStableId('version'), createdAt })
    localStorage.setItem('design-intelligence-local-versions', JSON.stringify(versions))
    saveDraft('已创建本地版本；正式发布仍需服务端审核')
  }

  return <div className="page generator-page">
    <header className="generator-header">
      <div>
        <h1>生成设计系统</h1>
        <p>先确认业务与信息架构，再进入布局和视觉决策。每一步都可返回修改。</p>
      </div>
      <div className="workbench-savebar"><span>{dirty ? '有未保存修改' : notice || '草稿已保存'}</span>{undo && <button className="text-action" onClick={undo.restore}><Undo2 size={14} />撤销{undo.label}</button>}<button className="secondary-action" onClick={() => saveDraft()}><Save size={14} />保存</button><button className="text-action" onClick={clearDraft}>清空草稿</button></div>
    </header>

    <Stepper steps={steps} current={step} furthest={furthestStep} onChange={setStep} />

    <div className="workflow-live" aria-live="polite">当前步骤：{steps[step]}</div>

    {step === 0 && <section className="generation-workspace">
      <div className="workspace-main product-brief-form">
        <div className="workspace-title"><div><h2>产品方案</h2><p>只填写业务事实，布局和视觉决策会在后续步骤完成。</p></div><Badge>ProductBrief</Badge></div>

        <section className="brief-section brief-section--first">
          <div className="brief-section__heading"><div><h3>产品定位</h3><p>说清这是什么产品，以及它要解决的业务问题。</p></div><span>必填</span></div>
          <div className="form-grid">
            <label><span>产品名称</span><input value={brief.productName} onChange={(event) => updateBrief({ ...brief, productName: event.target.value })} /></label>
            <label><span>产品类型</span><input value={brief.productType} onChange={(event) => updateBrief({ ...brief, productType: event.target.value })} /></label>
            <label className="full"><span>业务目标</span><textarea value={brief.businessGoal} onChange={(event) => updateBrief({ ...brief, businessGoal: event.target.value })} /></label>
          </div>
        </section>

        <section className="brief-section">
          <div className="brief-section__heading"><div><h3>用户角色</h3><p>后续会据此生成权限、导航和任务入口。</p></div><span>{brief.userRoles.length} 个</span></div>
          <div className="editable-tags">{brief.userRoles.map((role) => <span key={role.id}>{role.name}<DSIconAction semantic="remove-item" compact aria-label={`删除角色 ${role.name}`} onPress={() => removeBriefItem(`角色“${role.name}”`, { ...brief, userRoles: brief.userRoles.filter((item) => item.id !== role.id), targetUsers: brief.targetUsers.filter((item) => item !== role.name) })} /></span>)}</div>
          <div className="inline-add"><input value={newRole} onChange={(event) => setNewRole(event.target.value)} placeholder="输入新角色" /><button onClick={addRole}><Plus size={14} />添加角色</button></div>
        </section>

        <section className="brief-section">
          <div className="brief-section__heading"><div><h3>一级业务模块</h3><p>先确定系统的主要业务范围。</p></div><span>{brief.modules.length} 个</span></div>
          <div className="brief-rows">{brief.modules.map((module) => <div key={module.id}><strong>{module.name}</strong><span>{module.description}</span><button aria-label={`删除模块 ${module.name}`} onClick={() => removeBriefItem(`模块“${module.name}”`, { ...brief, modules: brief.modules.filter((item) => item.id !== module.id), pages: brief.pages.filter((page) => page.moduleId !== module.id) })}><Trash2 size={14} /></button></div>)}</div>
          <div className="inline-add"><input value={newModule} onChange={(event) => setNewModule(event.target.value)} placeholder="输入业务模块" /><button onClick={addModule}><Plus size={14} />添加模块</button></div>
        </section>

        <section className="brief-section">
          <div className="brief-section__heading"><div><h3>页面与核心任务</h3><p>页面描述信息容器，任务描述用户要完成的操作。</p></div><span>{brief.pages.length} 页</span></div>
          <div className="page-chip-list">{brief.pages.map((page) => <span className="page-chip" key={page.id}>{page.name}<DSIconAction semantic="remove-item" compact aria-label={`删除页面 ${page.name}`} onPress={() => removeBriefItem(`页面“${page.name}”`, { ...brief, pages: brief.pages.filter((item) => item.id !== page.id), modules: brief.modules.map((module) => ({ ...module, pageIds: module.pageIds.filter((id) => id !== page.id) })) })} /></span>)}</div>
          <div className="inline-add inline-add--page"><select value={newPageModuleId} onChange={(event) => setNewPageModuleId(event.target.value)} aria-label="页面所属模块">{brief.modules.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={newPageType} onChange={(event) => setNewPageType(event.target.value as ProductPageBrief['type'])} aria-label="页面类型"><option value="list">列表</option><option value="detail">详情</option><option value="form">编辑</option><option value="dashboard">仪表盘</option><option value="custom">自定义</option></select><input value={newPage} onChange={(event) => setNewPage(event.target.value)} placeholder="新增页面名称" /><button onClick={addPage}><Plus size={14} />添加</button></div>
          <div className="task-checks">{taskOptions.map((task) => <label key={task}><input type="checkbox" checked={brief.coreTasks.includes(task)} onChange={() => updateBrief({ ...brief, coreTasks: brief.coreTasks.includes(task) ? brief.coreTasks.filter((item) => item !== task) : [...brief.coreTasks, task] })} />{task}</label>)}</div>
        </section>

        <details className="brief-disclosure">
          <summary><span><strong>信息结构约束</strong><small>导航深度、数据量和特殊业务条件</small></span><ChevronRight size={16} /></summary>
          <div className="form-grid">
            <label><span>最大导航深度</span><select value={brief.informationHierarchy.maxNavigationDepth} onChange={(event) => updateBrief({ ...brief, informationHierarchy: { ...brief.informationHierarchy, maxNavigationDepth: Number(event.target.value) } })}><option value={2}>2 层</option><option value={3}>3 层</option><option value={4}>4 层</option></select></label>
            <label><span>信息密度</span><select value={brief.informationHierarchy.density} onChange={(event) => updateBrief({ ...brief, informationHierarchy: { ...brief.informationHierarchy, density: event.target.value as ProductBrief['informationHierarchy']['density'] } })}><option value="compact">紧凑</option><option value="comfortable">舒适</option><option value="spacious">宽松</option></select></label>
            <label><span>数据量</span><select value={brief.informationHierarchy.dataVolume} onChange={(event) => updateBrief({ ...brief, informationHierarchy: { ...brief.informationHierarchy, dataVolume: event.target.value as ProductBrief['informationHierarchy']['dataVolume'] } })}><option value="small">小</option><option value="medium">中</option><option value="large">大</option></select></label>
            <label className="checkbox-field"><input type="checkbox" checked={brief.informationHierarchy.crossModuleOperations} onChange={(event) => updateBrief({ ...brief, informationHierarchy: { ...brief.informationHierarchy, crossModuleOperations: event.target.checked } })} />存在跨模块操作</label>
            <label className="full"><span>特殊约束（每行一条）</span><textarea value={brief.constraints.join('\n')} onChange={(event) => updateBrief({ ...brief, constraints: event.target.value.split('\n').filter(Boolean) })} /></label>
          </div>
        </details>

        <div className="workspace-actions workspace-actions--sticky"><span>生成后仍可返回修改</span><Button priority="primary" appearance="filled" tone="brand" disabled={!briefReady} onClick={generateIa}>生成信息架构<ChevronRight size={15} /></Button></div>
      </div>

      <aside className="workspace-aside workflow-check-panel">
        <div className="aside-status"><span>步骤检查</span><strong>{completedBriefChecks} / {briefChecks.length}</strong></div>
        <h2>{briefReady ? '已具备生成条件' : '还有必填内容'}</h2>
        <ul className="readiness-list">{briefChecks.map((item) => <li key={item.label} data-complete={item.complete}><span>{item.complete ? <Check size={12} /> : '·'}</span>{item.label}</li>)}</ul>
        <dl><div><dt>角色</dt><dd>{brief.userRoles.length}</dd></div><div><dt>模块</dt><dd>{brief.modules.length}</dd></div><div><dt>页面</dt><dd>{brief.pages.length}</dd></div><div><dt>任务</dt><dd>{brief.coreTasks.length}</dd></div></dl>
        <p>使用可解释的本地规则生成，不调用真实 AI。</p>
      </aside>
    </section>}

    {step === 1 && <section className="generation-workspace">
      <div className="workspace-main"><div className="workspace-title"><div><h2>信息架构</h2><p>检查模块层级、页面归属和路由是否符合业务。</p></div><Badge>InformationArchitectureSpec</Badge></div><div className="ia-tree"><ArchitectureTree node={ia.root} /></div><div className="workspace-actions workspace-actions--sticky"><Button onClick={() => setStep(0)}>返回修改</Button><Button priority="primary" appearance="filled" tone="brand" onClick={generateLayouts}>确认并生成骨架<ChevronRight size={15} /></Button></div></div>
      <aside className="workspace-aside"><span className="aside-label">生成依据</span><h2>{brief.modules.length} 个模块 · {brief.pages.length} 个页面</h2><ul>{brief.coreTasks.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul><p>如果返回修改产品方案，本步与后续结果需要重新生成。</p></aside>
    </section>}

    {step === 2 && <section className="skeleton-workspace">
      <div className="candidate-rail"><div className="workspace-title"><div><h2>骨架候选</h2><p>先选择起点，再在右侧调整区域。</p></div><Badge>{layoutSpec.candidates.length} 个</Badge></div>{layoutSpec.candidates.map((candidate) => <button key={candidate.id} className={selectedCandidateId === candidate.id ? 'selected' : ''} onClick={() => chooseCandidate(candidate.id)}><strong>{candidate.name}</strong><span>{candidate.reason}</span><small>优点：{candidate.benefits.join('、')}</small><small>限制：{candidate.limitations.join('、')}</small></button>)}</div>
      <div className="layout-editor"><div className="workspace-title"><div><h2>{selectedCandidate.name}</h2><p>{selectedCandidate.reason}</p></div><Badge>SystemLayoutSpec</Badge></div><LayoutCanvas root={activeLayout} selectedId={selectedNodeId} onSelect={setSelectedNodeId} /></div>
      <aside className="layout-inspector"><div className="workspace-title"><div><h2>区域属性</h2><p>选择画布区域后在此调整。</p></div></div><label><span>当前区域</span><input value={selectedNode.label} disabled={selectedNode.locked} onChange={(event) => updateActiveLayout(updateLayoutNode(activeLayout, selectedNode.id, { label: event.target.value }))} /></label><label><span>宽度</span><select value={selectedNode.width ?? 'fill'} disabled={selectedNode.locked} onChange={(event) => updateActiveLayout(updateLayoutNode(activeLayout, selectedNode.id, { width: event.target.value }))}><option value="fill">自动填充</option><option value="200px">200px</option><option value="280px">280px</option><option value="320px">320px</option><option value="36%">36%</option><option value="50%">50%</option></select></label><label><span>布局方向</span><select value={selectedNode.direction ?? 'vertical'} disabled={selectedNode.locked} onChange={(event) => updateActiveLayout(updateLayoutNode(activeLayout, selectedNode.id, { direction: event.target.value as 'horizontal' | 'vertical' }))}><option value="vertical">纵向</option><option value="horizontal">横向</option></select></label><label><span>父级 / 层级</span><select value="" onChange={(event) => { updateActiveLayout(reparentLayoutNode(activeLayout, selectedNode.id, event.target.value)); setSelectedNodeId(selectedNode.id) }} disabled={selectedNode.type === 'root' || selectedNode.locked}><option value="">移动到…</option>{parentOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div className="inspector-actions"><button disabled={selectedNode.locked} onClick={() => updateActiveLayout(moveLayoutNode(activeLayout, selectedNode.id, -1))}><ArrowUp size={14} />上移</button><button disabled={selectedNode.locked} onClick={() => updateActiveLayout(moveLayoutNode(activeLayout, selectedNode.id, 1))}><ArrowDown size={14} />下移</button><button onClick={() => updateActiveLayout(updateLayoutNode(activeLayout, selectedNode.id, { locked: !selectedNode.locked }))}>{selectedNode.locked ? <Unlock size={14} /> : <Lock size={14} />}{selectedNode.locked ? '解锁' : '锁定'}</button><button disabled={selectedNode.type === 'root' || selectedNode.locked} onClick={() => { if (!window.confirm(`确定删除区域“${selectedNode.label}”吗？`)) return; const previous = cloneLayout(activeLayout); updateActiveLayout(removeLayoutNode(activeLayout, selectedNode.id)); setSelectedNodeId(activeLayout.id); setUndo({ label: `区域“${selectedNode.label}”`, restore: () => { setActiveLayout(previous); setUndo(null); setNotice('已撤销删除区域') } }) }}><Trash2 size={14} />删除</button></div><div className="add-region"><h3>添加区域</h3><select value={newRegionType} onChange={(event) => setNewRegionType(event.target.value as LayoutPrimitiveType)}>{layoutPrimitives.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input value={newRegionLabel} onChange={(event) => setNewRegionLabel(event.target.value)} placeholder="区域名称" /><button disabled={selectedNode.locked} onClick={() => { const label = newRegionLabel.trim(); if (!label) { setNotice('区域名称不能为空'); return } if (getLayoutNodes(activeLayout).some((item) => item.label === label)) { setNotice('区域名称不能重复'); return } const child = newRegionType === 'custom-region' ? createCustomRegion(label) : createLayoutRegion(newRegionType, label || getLayoutPrimitive(newRegionType)?.name || '新区域'); const parentId = getLayoutPrimitive(selectedNode.type)?.acceptsChildren || selectedNode.type === 'root' ? selectedNode.id : activeLayout.id; updateActiveLayout(addLayoutNode(activeLayout, parentId, child)); setSelectedNodeId(child.id) }}><CirclePlus size={14} />添加到当前层级</button></div><div className="workspace-actions workspace-actions--inspector"><Button onClick={() => { const resetRoot = cloneLayout(selectedCandidate.root); updateActiveLayout(resetRoot); setSelectedNodeId(resetRoot.id) }} icon={<RotateCcw size={14} />}>重置</Button><Button priority="primary" appearance="filled" tone="brand" onClick={generatePages}>确认骨架<ChevronRight size={15} /></Button></div></aside>
    </section>}

    {step === 3 && <section className="generation-workspace page-layout-workspace"><aside className="page-spec-list"><div className="workspace-title"><div><h2>页面布局</h2><p>逐页检查推荐的结构起点。</p></div><Badge>{pageSpecs.length} 页</Badge></div>{pageSpecs.map((page) => <button key={page.id} className={selectedPage?.id === page.id ? 'selected' : ''} onClick={() => setSelectedPageId(page.id)}><strong>{page.name}</strong><span>{page.task}</span></button>)}</aside><div className="workspace-main">{selectedPage && <><div className="workspace-title"><div><h2>{selectedPage.name}</h2><p>{selectedPage.recommendedStartingPoint ? `推荐起点：${selectedPage.recommendedStartingPoint}` : '自由组合页面，没有强制模板。'}</p></div><Badge>PageSpec</Badge></div><LayoutCanvas root={selectedPage.layout} /><details className="developer-details"><summary>查看开发结构</summary><div className="page-spec-meta"><div><span>Patterns</span>{selectedPage.patternIds.map((item) => <code key={item}>{item}</code>)}</div><div><span>Components</span>{selectedPage.componentIds.map((item) => <code key={item}>{item}</code>)}</div></div></details></>}<div className="workspace-actions workspace-actions--sticky"><Button onClick={() => setStep(2)}>返回骨架</Button><Button priority="primary" appearance="filled" tone="brand" onClick={() => advanceTo(4)}>确认并配置主题<ChevronRight size={15} /></Button></div></div></section>}

    {step === 4 && <section className="generation-workspace theme-workspace"><div className="workspace-main"><div className="workspace-title"><div><h2>主题配置</h2><p>只改变颜色、字体、圆角和密度，不改变已确认的页面结构。</p></div><Badge>ThemeSpec</Badge></div><div className="theme-editor"><label><span>品牌主色</span><input type="color" value={theme.brandPrimary} onChange={(event) => updateTheme({ brandPrimary: event.target.value }, { 'brand-primary': event.target.value })} /><code>{theme.brandPrimary}</code></label><label><span>辅助色</span><input type="color" value={theme.brandSecondary} onChange={(event) => updateTheme({ brandSecondary: event.target.value }, { 'brand-secondary': event.target.value })} /><code>{theme.brandSecondary}</code></label><label><span>页面背景</span><input type="color" value={theme.pageBackground} onChange={(event) => updateTheme({ pageBackground: event.target.value }, { 'surface-canvas': event.target.value })} /><code>{theme.pageBackground}</code></label><label><span>边框</span><input type="color" value={theme.border} onChange={(event) => updateTheme({ border: event.target.value }, { 'border-default': event.target.value })} /><code>{theme.border}</code></label><label><span>字体</span><select value={theme.fontFamily} onChange={(event) => updateTheme({ fontFamily: event.target.value })}><option value={'"Noto Sans SC Variable", sans-serif'}>Noto Sans SC</option><option value={'"PingFang SC", sans-serif'}>PingFang SC</option></select></label><label><span>控件圆角</span><select value={theme.radius} onChange={(event) => updateTheme({ radius: event.target.value }, { 'radius-control': event.target.value })}><option value="2px">2px</option><option value="4px">4px</option><option value="6px">6px</option><option value="8px">8px</option></select></label><label><span>阴影</span><select value={theme.shadow} onChange={(event) => updateTheme({ shadow: event.target.value })}><option value="none">无阴影</option><option value="0 1px 3px rgba(29, 33, 41, 0.08)">基础层级</option><option value="0 8px 24px rgba(29, 33, 41, 0.14)">浮层</option></select></label><label><span>主题模式</span><select value={theme.mode} onChange={(event) => updateTheme({ mode: event.target.value as ThemeSpec['mode'] })}><option value="light">浅色</option><option value="dark">深色</option></select></label><label><span>信息密度</span><select value={theme.density} onChange={(event) => updateTheme({ density: event.target.value as ThemeSpec['density'] })}><option value="compact">紧凑</option><option value="comfortable">舒适</option><option value="spacious">宽松</option></select></label><label><span>间距尺度</span><select value={theme.spacingScale} onChange={(event) => updateTheme({ spacingScale: event.target.value as ThemeSpec['spacingScale'] })}><option value="compact">紧凑</option><option value="comfortable">标准</option><option value="spacious">宽松</option></select></label><label><span>组件密度</span><select value={theme.componentDensity} onChange={(event) => updateTheme({ componentDensity: event.target.value as ThemeSpec['componentDensity'] })}><option value="compact">紧凑</option><option value="comfortable">舒适</option><option value="spacious">宽松</option></select></label><label><span>表格密度</span><select value={theme.tableDensity} onChange={(event) => updateTheme({ tableDensity: event.target.value as ThemeSpec['tableDensity'] })}><option value="compact">紧凑</option><option value="comfortable">舒适</option><option value="spacious">宽松</option></select></label><label><span>按钮表现</span><select value={theme.buttonAppearance} onChange={(event) => updateTheme({ buttonAppearance: event.target.value as ThemeSpec['buttonAppearance'] })}><option value="balanced">平衡</option><option value="filled">偏实心</option><option value="outline">偏线框</option></select></label><label><span>图标风格</span><select value={theme.iconStyle} onChange={(event) => updateTheme({ iconStyle: event.target.value as ThemeSpec['iconStyle'] })}><option value="outline">线性</option><option value="filled">面性</option><option value="mixed">混合</option></select></label></div><div className="workspace-actions workspace-actions--sticky"><Button onClick={() => setStep(3)}>返回页面布局</Button><Button priority="primary" appearance="filled" tone="brand" onClick={() => advanceTo(5)}>生成系统预览<ChevronRight size={15} /></Button></div></div><aside className="workspace-aside theme-preview"><span>主题预览</span><BusinessPagePreview style={themePreviewStyle} title={brief.productName} /></aside></section>}

    {step === 5 && <section className="system-preview"><div className="workspace-title"><div><h2>系统预览</h2><p>检查前五步的决策是否组成一套完整、可继续编辑的业务界面。</p></div><Badge>本地规则演示</Badge></div><PageTabs selectedKey={previewMode} onSelectionChange={changePreviewMode} items={[
      { id: 'skeleton', label: '系统骨架', content: <div className="system-preview__canvas"><LayoutCanvas root={activeLayout} /></div> },
      { id: 'pages', label: '页面列表', content: <div className="system-preview__canvas"><div className="preview-page-list">{pageSpecs.map((page) => <button key={page.id} onClick={() => { setSelectedPageId(page.id); changePreviewMode('page') }}><FolderTree size={17} /><span><strong>{page.name}</strong><small>{page.route}</small></span><ChevronRight size={15} /></button>)}</div></div> },
      { id: 'page', label: '页面预览', content: <div className="system-preview__canvas">{selectedPage ? <><div className="preview-canvas-title"><strong>{selectedPage.name}</strong><span>{selectedPage.task}</span></div><BusinessPagePreview style={themePreviewStyle} title={selectedPage.name} /></> : <p>请先选择一个页面。</p>}</div> },
      { id: 'theme', label: '主题预览', content: <div className="system-preview__canvas"><BusinessPagePreview style={themePreviewStyle} title={brief.productName} /></div> },
    ]} /><details className="developer-details"><summary>查看生成结构</summary><div className="generated-chain"><span>ProductBrief</span><ChevronRight size={14} /><span>InformationArchitecture</span><ChevronRight size={14} /><span>SystemLayoutSpec</span><ChevronRight size={14} /><span>PageSpec[]</span><ChevronRight size={14} /><span>ThemeSpec</span><ChevronRight size={14} /><strong>GeneratedSystem</strong></div></details><div className="generated-actions"><Button onClick={() => saveDraft()} icon={<Save size={14} />}>保存</Button><Button onClick={exportJson} icon={<FileJson size={14} />}>导出 JSON</Button><Button onClick={exportCss} icon={<Download size={14} />}>导出 Token/CSS</Button><Button onClick={downloadConfig} icon={<Download size={14} />}>下载配置</Button><Button priority="primary" appearance="filled" tone="brand" onClick={createVersion}>创建版本</Button><Button priority="secondary" appearance="soft" tone="neutral" onClick={() => setStep(4)}>返回继续编辑</Button></div><p className="generated-feedback" role="status" aria-live="polite">{notice}</p></section>}
  </div>
}
