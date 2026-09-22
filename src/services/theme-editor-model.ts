import { sizingParameters, type ThemeSizing } from './theme-sizing'
import { PROJECT_THEME_MODE_VALUES, PROJECT_THEME_SHADOWS, type ProjectThemeSettings } from './project-theme'
import { checkTheme } from './workspace-backup'
export const themePresets: Array<{id:ProjectThemeSettings['preset'];label:string;description:string;patch:Partial<ProjectThemeSettings>}> = [
 {id:'professional',label:'专业',description:'常规业务表单与管理页面',patch:{radius:4,spacing:16,controlHeight:32,density:'comfortable',shadow:PROJECT_THEME_SHADOWS.subtle}},
 {id:'compact',label:'紧凑',description:'信息较多的列表与工作台',patch:{radius:3,spacing:12,controlHeight:30,density:'compact',shadow:'none'}},
 {id:'soft',label:'柔和',description:'更舒展的内容与操作区域',patch:{radius:8,spacing:18,controlHeight:36,density:'spacious',shadow:PROJECT_THEME_SHADOWS.overlay}},
]
export const densitySettings = {compact:{density:'compact',spacing:12,controlHeight:30},comfortable:{density:'comfortable',spacing:16,controlHeight:32},spacious:{density:'spacious',spacing:18,controlHeight:36}} as const
export const themeFieldLabels: Record<keyof ProjectThemeSettings,string> = {sizing:'分层尺寸',preset:'风格预设',mode:'主题模式',brandPrimary:'品牌主色',brandSecondary:'品牌辅助色',brandHover:'悬停色',brandActive:'按下色',textPrimary:'主要文字',textSecondary:'次要文字',surfaceCanvas:'页面背景',surfacePrimary:'内容背景',borderDefault:'边框',statusSuccess:'成功色',statusWarning:'警告色',statusError:'错误色',buttonPrimaryBackground:'主按钮背景',buttonPrimaryText:'主按钮文字与图标',fontFamily:'字体',bodySize:'正文字号',titleSize:'标题字号',radius:'圆角',tableRadius:'表格圆角',shadow:'阴影',spacing:'间距',controlHeight:'控件高度',density:'信息密度'}
export const changedThemeFields = (draft:ProjectThemeSettings,saved:ProjectThemeSettings) => (Object.keys(themeFieldLabels) as Array<keyof ProjectThemeSettings>).filter(key=>JSON.stringify(draft[key])!==JSON.stringify(saved[key]))
export function themeEditorError(theme:ProjectThemeSettings):string {
 try { checkTheme(theme) } catch(error) { let message=error instanceof Error?error.message:'主题配置无效。';for(const [key,label] of Object.entries(themeFieldLabels))message=message.replaceAll(key,label);return message }
 if(theme.bodySize<12||theme.bodySize>18)return '正文字号需在 12–18px 之间。'
 if(theme.titleSize<18||theme.titleSize>32)return '标题字号需在 18–32px 之间。'
 return ''
}
export function effectivePreset(theme:ProjectThemeSettings){if(theme.sizing&&Object.keys(theme.sizing.overrides).length)return undefined;return themePresets.find(preset=>Object.entries(preset.patch).every(([key,value])=>theme[key as keyof ProjectThemeSettings]===value))}
export type ModePalette = Pick<ProjectThemeSettings,keyof typeof PROJECT_THEME_MODE_VALUES.light & keyof ProjectThemeSettings>
export function captureModePalette(theme:ProjectThemeSettings):ModePalette {return {textPrimary:theme.textPrimary,textSecondary:theme.textSecondary,surfaceCanvas:theme.surfaceCanvas,surfacePrimary:theme.surfacePrimary,borderDefault:theme.borderDefault}}

export function formatThemeValue(key:keyof ProjectThemeSettings,value:ProjectThemeSettings[keyof ProjectThemeSettings]):string {
 if(key==='sizing'){if(!value)return '原有尺寸配置';const overrides=(value as ThemeSizing).overrides;return Object.keys(overrides).length?'覆盖：'+Object.entries(overrides).map(([id,n])=>`${sizingParameters.find(p=>p.id===id)?.label??id} ${n}px`).join('；'):'全部跟随密度'}
 if((key==='buttonPrimaryBackground'||key==='buttonPrimaryText')&&value===undefined)return '跟随品牌按钮配方'
 const names:Record<string,string>={professional:'专业',compact:'紧凑',soft:'柔和',comfortable:'舒适',spacious:'宽松',light:'浅色',dark:'深色'}
 if(['preset','density','mode'].includes(key))return names[String(value)]??String(value)
 if(['bodySize','titleSize','radius','tableRadius','spacing','controlHeight'].includes(key))return `${value}px`
 if(key==='shadow')return value==='none'?'无阴影':value===PROJECT_THEME_SHADOWS.subtle?'轻微阴影':value===PROJECT_THEME_SHADOWS.overlay?'明显阴影':String(value)
 return String(value)
}
