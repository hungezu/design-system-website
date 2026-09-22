import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { DSButton, DSIcon } from '../runtime'
import { semanticTokens } from '../data/global/semantic-tokens'
import { componentAssets } from '../data/assets/components'
import { iconAssets } from '../data/assets/icons'
import { PALETTE_FAMILIES, isPaletteToken } from '../data/global/color-palettes'
import { useProject } from '../app/project-context'
import { useAccess } from '../app/access-context'
import { useFrozenTheme } from '../services/use-frozen-theme'
import { useFoundationSnapshot } from '../services/use-foundation-snapshot'
import { isDraftVersion } from '../services/release-catalog'
import { iconPackForProject } from '../services/icon-pack'
import type { TokenAsset } from '../types/design-system'
import './Assets.css'

type ResourceCategory = 'token' | 'icon'
const uniqueIconAssets = iconAssets.filter((icon,index,items)=>items.findIndex(item=>item.tags?.[1]===icon.tags?.[1])===index)
const categories = [{ id: 'token' as const, label: '设计变量' }, { id: 'icon' as const, label: '图标' }]
const sourceLabels: Record<string,string> = { global:'通用基线',platform:'平台默认',project:'项目配置',asset:'资产覆盖',release:'冻结版本',compatibility:'兼容基线' }
const matches = (text: string, query: string) => text.toLowerCase().includes(query.trim().toLowerCase())
function Highlight({ text, query }: { text: string; query: string }) {
  const value = query.trim(), index = text.toLowerCase().indexOf(value.toLowerCase())
  return !value || index < 0 ? text : <>{text.slice(0,index)}<mark>{text.slice(index,index+value.length)}</mark>{text.slice(index+value.length)}</>
}
function TokenPreview({ token, value }: { token: TokenAsset; value: string }) {
  if (token.category === 'color') return <span className="foundation-token-preview" style={{background:value}} aria-hidden="true" />
  if (token.category === 'radius') return <span className="foundation-token-preview foundation-token-preview--radius" style={{borderRadius:value}} aria-hidden="true" />
  if (token.category === 'shadow') return <span className="foundation-token-preview" style={{boxShadow:value}} aria-hidden="true" />
  return <span className="foundation-token-preview" aria-hidden="true">{token.category === 'typography' ? 'Aa' : token.category === 'motion' ? '动效' : value}</span>
}
export function Assets({ scope = 'public' }: { scope?: 'public' | 'project' }) {
  const { project, theme } = useProject()
  const { projectRole } = useAccess()
  const [params,setParams] = useSearchParams()
  const { hash } = useLocation()
  const category: ResourceCategory = params.get('category') === 'icon' ? 'icon' : 'token'
  const query = params.get('q') ?? ''
  const version = params.get('version')
  const isProject = scope === 'project'
  const historical = Boolean(isProject && version && !isDraftVersion(version))
  const frozen = useFrozenTheme(historical)
  const snapshot = useFoundationSnapshot(historical)
  const loading = historical && (frozen.loading || snapshot.loading)
  const error = historical ? frozen.error ?? snapshot.error : null
  const [feedback,setFeedback] = useState('')
  const base = isProject ? `/projects/${project.id}/foundations` : '/assets'
  const values = useMemo(() => historical ? {...frozen.theme?.values,...snapshot.palette} : isProject ? theme.values : Object.fromEntries(semanticTokens.map(token=>[token.id,token.defaultValue])), [historical,frozen.theme,snapshot.palette,isProject,theme.values])
  const availableTokens = semanticTokens.filter(token=>!historical || !isPaletteToken(token.id) || token.id in snapshot.palette || frozen.theme?.sources[token.id] === 'release')
  const tokens = availableTokens.filter(token=>matches(`${token.id} ${token.name} ${token.group} ${token.semantic} ${values[token.id] ?? token.defaultValue}`,query))
  const icons = historical ? uniqueIconAssets.filter(icon=>snapshot.iconIds.includes(icon.tags?.[1] ?? icon.id.replace(/^icon-/,''))) : iconPackForProject(isProject?project.id:'global')
  const filteredIcons = icons.filter(icon=>matches(`${icon.id} ${icon.name} ${icon.semantic} ${icon.tags?.join(' ')}`,query))
  const groups = [...new Set(tokens.filter(token=>!isPaletteToken(token.id)).map(token=>token.group))]
  const iconGroups = [...new Set(filteredIcons.map(icon=>icon.tags?.[0] ?? '其他'))]
  const showPalettes = tokens.some(token=>isPaletteToken(token.id))
  const filteredCount = category==='token' ? tokens.length : filteredIcons.length
  const total = category==='token' ? availableTokens.length : icons.length
  const ready = !loading && !error
  useEffect(()=>{
    const next = new URLSearchParams(params)
    let changed = false
    if (next.has('category') && !['token','icon'].includes(next.get('category')!)) { next.set('category','token'); changed=true }
    for (const key of ['page','sort']) if(next.has(key)){next.delete(key);changed=true}
    if(changed)setParams(next,{replace:true})
  },[params,setParams])
  useEffect(()=>{
    if(!hash || !ready)return
    let target: string
    try { target = decodeURIComponent(hash.slice(1)) } catch { return }
    const frame=window.requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({block:'center'}))
    return()=>window.cancelAnimationFrame(frame)
  },[hash,ready])
  const update = (next:Record<string,string|null>) => { const copy=new URLSearchParams(params);Object.entries(next).forEach(([key,value])=>value?copy.set(key,value):copy.delete(key));setParams(copy,{replace:true});setFeedback('') }
  const declaredVariables = new Set([...(frozen.css ?? '').matchAll(/--([a-z0-9-]+)\s*:/gi)].map(match=>match[1]))
  const hasCssVariable = (id:string) => !historical || declaredVariables.has(id)
  const copyToken = async (id:string) => { const content=hasCssVariable(id)?`var(--${id})`:values[id];try {await navigator.clipboard.writeText(content);setFeedback(`已复制 ${content}`)}catch{setFeedback('未能自动复制，请选中变量名或数值手动复制。')} }
  const source = (id:string) => !isProject ? '' : historical && id in snapshot.palette ? '冻结版本' : sourceLabels[(historical?frozen.theme:theme)?.sources[id]??'global']
  const componentIds = historical ? frozen.componentIds ?? [] : project.componentIds
  const references = (token:TokenAsset) => componentAssets.filter(asset=>(!isProject||componentIds.includes(asset.id.replace(/^component-/,'')))&&(asset.tokens.includes(token.id)||asset.tokenRoles?.some(role=>role.token===token.id)))
  const paletteGroups = PALETTE_FAMILIES.map(family=>({ ...family, tokens:tokens.filter(token=>token.id.startsWith(`color-${family.id}-`) && /^\d+$/.test(token.id.slice(`color-${family.id}-`.length))) })).filter(family=>family.tokens.length)
  const canEdit = isProject && !historical && ['editor','project-admin'].includes(projectRole(project.id) ?? '')
  return <div className="page resources-page foundations-page">
    <PageHeader title={isProject?'项目设计规范':'设计基础'} description={isProject?'当前项目的完整基础变量与图标集，数值随项目配置或所选版本变化。':'完整浏览基础色阶、语义变量与图标。组件专属变量在对应组件页查看。'} actions={canEdit?<Link className="primary-action" to={`/projects/${project.id}/foundations/theme?version=draft`}>主题与风格</Link>:undefined}/>
    {historical&&<p className="resource-layer-note">历史版本 v{version} · 保留原版本色阶，标记为“兼容基线”的变量未包含在原始快照中。</p>}
    <div className="foundation-controls"><div className="category-filter" aria-label="资源分类">{categories.map(item=><DSButton key={item.id} variant="tertiary" aria-pressed={category===item.id} onClick={()=>update({category:item.id})}>{item.label}</DSButton>)}</div><div className="asset-search"><Search size={18} aria-hidden="true"/><input value={query} onChange={event=>update({q:event.target.value||null})} placeholder={category==='token'?'搜索名称、变量 ID 或当前值':'搜索图标名称或语义 ID'} aria-label="搜索设计基础"/>{query&&<DSButton variant="tertiary" size="sm" onClick={()=>update({q:null})}>清除搜索</DSButton>}</div></div>
    {loading?<p role="status">正在读取冻结设计基础…</p>:error?<p role="alert">冻结设计基础读取失败：{error}</p>:<>
    <div className="foundation-summary"><span>{query?`匹配 ${filteredCount} / ${total} 项`:`共 ${total} 项${category==='token'?'基础变量':'图标'}`}</span><span role="status">{feedback}</span></div>
    {filteredCount>0?<>
      <nav className="foundation-group-nav" aria-label={category==='token'?'变量分组':'图标分组'}>{category==='token'?<>{showPalettes&&<a href="#foundation-palettes">基础色阶</a>}{groups.map(group=><a key={group} href={`#foundation-${group}`}>{group}</a>)}</>:iconGroups.map(group=><a key={group} href={`#foundation-${group}`}>{group}</a>)}</nav>
      {category==='token'?<>
        {showPalettes&&<section id="foundation-palettes" className="foundation-palette-section"><div className="resource-section-title"><h2>基础色阶</h2><span>{historical?'点击色块复制已冻结变量或色值':'点击色块复制变量'}</span></div><p className="foundation-note">品牌与功能色完整展示 10 阶；中性色与品牌倾向灰保留 14 阶。基础色阶按 HCT 生成，下面的语义色保留已确认配置。{historical&&'旧版本仅保存色盘、未声明 CSS 变量的色阶只复制色值。'}</p>{paletteGroups.map(family=><section className="foundation-palette" key={family.id}><h3>{family.name}<small>{family.tokens.length} 个色阶</small></h3><div className="foundation-color-scale">{family.tokens.map(token=>{const value=values[token.id]??token.defaultValue;return <button type="button" className="foundation-color" id={`token-${token.id}`} key={token.id} title={hasCssVariable(token.id)?`复制 var(--${token.id})`:`复制色值 ${value}`} aria-label={`复制${token.name}${hasCssVariable(token.id)?'变量':'色值'} ${value}`} onClick={()=>void copyToken(token.id)}><span className="foundation-color__swatch" style={{background:value}}/><strong>{token.name}{family.count===10&&value.toLowerCase()===(values[family.seed]??'').toLowerCase()&&<em>基准</em>}</strong><code>{value}</code><small>{hasCssVariable(token.id)?`--${token.id}`:`${family.id.replace('brand-neutral','brandNeutral')}.${token.id.split('-').at(-1)}`}</small></button>})}</div></section>)}</section>}
        <div className="token-explorer">{groups.map(group=><section id={`foundation-${group}`} key={group}><div className="resource-section-title"><h2>{group}</h2><span>{tokens.filter(token=>token.group===group).length} 个变量</span></div>{group==='字体'&&<p className="foundation-note">组合值按“字号 / 行高 / 字重”展示，使用时分别设置对应属性，不能直接当作 CSS font 简写。</p>}<div className="foundation-token-table">{tokens.filter(token=>token.group===group).map(token=>{const value=values[token.id]??token.defaultValue,usedBy=references(token);return <article id={`token-${token.id}`} key={token.id} className="foundation-token-row"><TokenPreview token={token} value={value}/><div className="foundation-token-name"><strong><Highlight text={token.name} query={query}/></strong><code>--<Highlight text={token.id} query={query}/></code>{isProject&&<small>{source(token.id)}</small>}</div><p><Highlight text={token.semantic} query={query}/></p><div className="foundation-token-value"><code><Highlight text={value} query={query}/></code><DSButton variant="tertiary" size="sm" aria-label={`复制${token.name}${hasCssVariable(token.id)?'变量':'数值'}`} onClick={()=>void copyToken(token.id)}>{hasCssVariable(token.id)?'复制变量':'复制数值'}</DSButton></div>{usedBy.length>0&&<details className="foundation-token-references"><summary>被 {usedBy.length} 个组件引用</summary><div>{usedBy.map(asset=><Link key={asset.id} to={isProject?`/projects/${project.id}/components/${asset.id.replace(/^component-/,'')}?version=${encodeURIComponent(version??'draft')}`:`/components/${asset.id.replace(/^component-/,'')}`}>{asset.name}</Link>)}</div></details>}</article>})}</div></section>)}</div>
      </>:<div className="icon-explorer">{iconGroups.map(group=><section id={`foundation-${group}`} key={group}><div className="resource-section-title"><h2>{group}</h2><span>{filteredIcons.filter(icon=>(icon.tags?.[0]??'其他')===group).length} 个图标</span></div><div className="icon-grid">{filteredIcons.filter(icon=>(icon.tags?.[0]??'其他')===group).map(icon=><Link key={icon.id} to={`${base}/${icon.id}?${params.toString() || 'category=icon'}`}><DSIcon name={icon.tags?.[1]??'help'} size="md" decorative/><strong><Highlight text={icon.name} query={query}/></strong><code><Highlight text={icon.tags?.[1]??icon.id} query={query}/></code></Link>)}</div></section>)}</div>}
    </>:<div className="empty-state"><h2>没有匹配的{category==='token'?'变量':'图标'}</h2><p>试试名称、语义 ID{category==='token'?'或具体数值':''}。</p><DSButton onClick={()=>update({q:null})}>清除搜索</DSButton></div>}
    </>}
  </div>
}
