import { expect, it } from 'vitest'
import { foundationPalettes, capturedPaletteValues, isPaletteToken } from './color-palettes'
import { semanticTokens } from './semantic-tokens'
import { guokexinProject } from '../projects/guokexin'
import { defaultProjectTheme, projectPreviewVariables, resolvePreviewTheme } from '../../services/project-theme'
import { resolveProjectTheme } from '../../services/theme-resolver'
import { createReleaseSnapshot, validateSnapshot } from '../../services/release-snapshot'
const base = Object.fromEntries(semanticTokens.map(token=>[token.id,token.defaultValue]))
it('完整色阶有五组十阶与两组十四阶，保留种子且不改写语义色',()=>{
 const palettes=foundationPalettes(base)
 expect(palettes.map(palette=>palette.colors.length)).toEqual([10,14,14,10,10,10,10])
 expect(semanticTokens.filter(token=>isPaletteToken(token.id))).toHaveLength(78)
 for(const palette of palettes.filter(item=>item.primaryLevel))expect(palette.colors[palette.primaryLevel!-1].value).toBe(palette.seed.toUpperCase())
 const settings=defaultProjectTheme(guokexinProject), resolved=resolvePreviewTheme(settings,resolveProjectTheme(guokexinProject))
 expect(resolved.values['brand-hover']).toBe(settings.brandHover)
 expect(resolved.values['brand-secondary']).toBe(settings.brandSecondary)
 const vars=projectPreviewVariables(settings,resolveProjectTheme(guokexinProject))
 expect(Object.entries(vars).filter(([id])=>isPaletteToken(id.slice(2)))).toHaveLength(78)
 expect(Object.entries(vars).filter(([id])=>/^--color-brand-\d+$/.test(id)).map(([,value])=>value)).toContain(settings.brandPrimary)
})
it('色阶进入真实冻结 Token，校验及主题隔离仍成立',()=>{
 const settings={...defaultProjectTheme(guokexinProject),brandPrimary:'#6236FF'}
 const snapshot=createReleaseSnapshot({project:guokexinProject,theme:settings,version:'9.9.0',status:'published'})
 expect(validateSnapshot(snapshot)).toBe(snapshot)
 const captured=capturedPaletteValues(snapshot.assets['tokens.json'])
 expect(Object.keys(captured)).toHaveLength(78)
 expect(Object.entries(captured).filter(([id])=>/^color-brand-\d+$/.test(id)).map(([,value])=>value)).toContain('#6236FF')
 expect(base['brand-primary']).not.toBe('#6236FF')
})
it('旧色盘读取原值，不用当前颜色补造缺失阶数',()=>{
 expect(capturedPaletteValues({basePalette:{brand:[{value:'#112233'},{value:'#223344'}],neutral:[{value:'#EEEEEE'}],functional:{error:[{value:'#AA0000'}]}}})).toEqual({'color-brand-1':'#112233','color-brand-2':'#223344','color-neutral-1':'#EEEEEE','color-error-1':'#AA0000'})
})
it('编辑主色时的暂时无效输入不会让预览崩溃',()=>{
 expect(()=>projectPreviewVariables({...defaultProjectTheme(guokexinProject),brandPrimary:'#12'})).not.toThrow()
})
