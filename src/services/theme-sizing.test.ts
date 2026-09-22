import {describe,it,expect} from 'vitest'
import {baselineThemeSettings,projectPreviewVariables,releasePreviewVariables} from './project-theme'
import {enableSizing,changeSizing,resolvedSizing,validateResolvedSizing} from './theme-sizing'
import {checkTheme,validateWorkspaceBackup,createWorkspaceBackup} from './workspace-backup'
import {createReleaseSnapshot,validateSnapshot} from './release-snapshot'
import {guokexinProject} from '../data/projects'
import {defaultProjectTheme} from './project-theme'
const base=baselineThemeSettings
it('旧主题保持原有高度，启用时保留旧尺寸差异',()=>{
 const legacy={...base,density:'compact' as const,controlHeight:34,spacing:20}
 const activated={...legacy,sizing:enableSizing(legacy)}
 expect(resolvedSizing(activated).heightMd).toBe(34)
 expect(resolvedSizing(activated).heightSm).toBe(28)
 expect(resolvedSizing(activated).buttonPadding).toBe(20)
 expect(projectPreviewVariables(legacy)['--control-height-md']).toBe('34px')
})
it('密度只改变跟随项，覆盖值保留，恢复跟随后使用当前推荐',()=>{
 let theme={...base,sizing:enableSizing(base)}
 theme={...theme,sizing:changeSizing(theme,'inputPadding',18),density:'spacious'}
 expect(resolvedSizing(theme).inputPadding).toBe(18)
 expect(resolvedSizing(theme).heightMd).toBe(36)
 theme={...theme,sizing:changeSizing(theme,'inputPadding',undefined)}
 expect(resolvedSizing(theme).inputPadding).toBe(12)
})
describe('校验',()=>{
 it.each([{version:2,overrides:{}},{version:1,overrides:{unknown:12}},{version:1,overrides:{heightMd:NaN}},{version:1,overrides:{inputPadding:-1}}])('拒绝非法结构 %j',sizing=>expect(()=>checkTheme({...base,sizing})).toThrow())
 it('拒绝文字装不下、大小号倒置',()=>{
 expect(()=>validateResolvedSizing({...base,bodySize:18,sizing:{version:1,overrides:{heightSm:24}}})).toThrow()
 expect(()=>validateResolvedSizing({...base,sizing:{version:1,overrides:{heightSm:40,heightMd:32}}})).toThrow()
 })
})
it('冻结参数与解析变量都可验证，不随当前密度变化',()=>{
 const settings={...defaultProjectTheme(guokexinProject),sizing:{version:1 as const,overrides:{inputPadding:18,popupPadding:32}}}
 const snapshot=createReleaseSnapshot({project:guokexinProject,theme:settings,version:'8.5.0'})
 validateSnapshot(snapshot)
 expect((snapshot.assets['region-appearance.json'] as {theme:typeof settings}).theme.sizing).toEqual(settings.sizing)
 expect(releasePreviewVariables(snapshot.assets['tokens.css'] as string)['--popup-padding']).toBe('32px')
 expect(projectPreviewVariables({...base,density:'spacious'})['--popup-padding']).toBe('24px')
})
it('备份往返保留可选分层设置',()=>{
 const store=new Map<string,string>();const storage={getItem:(key:string)=>store.get(key)??null,setItem:(key:string,value:string)=>store.set(key,value),removeItem:(key:string)=>{store.delete(key)}}
 storage.setItem('design-intelligence-project-theme-v1:guokexin',JSON.stringify({...defaultProjectTheme(guokexinProject),sizing:{version:1,overrides:{popupPadding:30}}}))
 const backup=validateWorkspaceBackup(createWorkspaceBackup(storage,['guokexin']),['guokexin'])
 expect(backup.payload.projects[0].theme.sizing?.overrides.popupPadding).toBe(30)
})

it('迁移保留项目已有的小号尺寸与基础间距覆盖',()=>{
 const sizing=enableSizing(base,{'control-height-sm':'30px','spacing-8':'10px'})
 expect(sizing.overrides.heightSm).toBe(30);expect(sizing.overrides.inputPadding).toBe(10)
})
it('旧冻结 CSS 使用自己的间距，不继承新草稿细项',()=>{
 const old=releasePreviewVariables(':root { --control-height-md: 32px; --spacing-16: 20px; --spacing-8: 7px; }')
 expect(old['--button-padding-inline']).toBe('20px');expect(old['--input-padding-inline']).toBe('7px')
 expect(old['--popup-padding']).toBe('24px')
 const snapshot=createReleaseSnapshot({project:guokexinProject,theme:base,version:'8.0.0'})
 expect((snapshot.assets['layout.json'] as {spacing:number}).spacing).toBe(16)
})
