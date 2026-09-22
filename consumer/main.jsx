import { matchesDelivery } from './identity'
import expected from './expected-delivery.json'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { PreviewScope, TemplateExample, ComponentExample, RUNTIME_BUILD_ID, DSInput, DSButton, projectPreviewVariables, baselineThemeSettings } from '@local/design-system'
import tokens from '@local/design-system/tokens.json'
import snapshot from '@local/design-system/snapshot.json'
import '@local/design-system/style.css'
import './style.css'
const instanceVariables=projectPreviewVariables({...baselineThemeSettings,brandPrimary:tokens['--brand-primary'],brandHover:tokens['--brand-hover'],brandActive:tokens['--brand-active'],brandSecondary:tokens['--brand-secondary'],fontFamily:'Georgia, serif',bodySize:18})
const matches=matchesDelivery(RUNTIME_BUILD_ID,snapshot,expected)
function Consumer(){if(!matches)return <main><h1>没有加载目标候选包</h1><p>目标：{expected.version}；当前：{snapshot.entry.version}</p><p role="alert">请重新安装目标候选包并重启 Consumer；不能只比较可能一起过期的包内代码和快照。</p></main>;return <main><h1>独立消费验收</h1><p>从本地 tarball 安装，没有引用管理站源码或浏览器存储。</p><p role="status">运行时与冻结快照：{matches?'一致':'不一致'}</p><p>候选版本：{snapshot.entry.version}</p><PreviewScope vars={tokens}><ComponentExample id="button" buttonVariant="primary"/><TemplateExample templateId="template-list" variant="advanced"/></PreviewScope><details><summary>实例字体与加载状态检查</summary><PreviewScope vars={instanceVariables}><div data-consumer-instance><DSInput label="独立字体字段" defaultValue="18px 字体继承"/><DSButton variant="primary" loading>加载状态验证</DSButton></div></PreviewScope></details></main>}
createRoot(document.getElementById('root')).render(<Consumer/> )
