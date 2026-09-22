import { AI_COMPONENTS } from '../data/ai-components'
export type BindingSource = 'platform' | 'project' | 'designer' | 'release' | 'compatibility'
export type BindingStatus = 'default' | 'override' | 'confirmed' | 'locked'
export type ImplementationStatus = 'implemented' | 'migrating' | 'planned'
export interface ComponentBinding { componentId: string; category: 'form' | 'data' | 'navigation' | 'feedback' | 'layout' | 'media'; runtimeExport: string; recipeId: string; tokenSlots: string[]; states: string[]; source: BindingSource; status: BindingStatus; implementation: ImplementationStatus }
export type ComponentTokenResolution = { slot: string; tokenId: string; value: string; source: BindingSource }
export type ComponentStateTokenResolution = ComponentTokenResolution & { resolvedValue: string }
const componentStateSets: Record<string, string[]> = {
  button: ['default','hover','focus','active','disabled','loading'],
  input: ['default','hover','focus','disabled','error'], select: ['default','hover','focus','open','selected','disabled','error'],
  table: ['default','hover','selected','loading','empty'], pagination: ['default','hover','focus','active','disabled'],
  dialog: ['default','open','loading'], drawer: ['default','open','loading'], menu: ['default','hover','focus','selected','open','disabled'], tabs: ['default','hover','focus','selected','disabled'],
  tag: ['default','hover','disabled'], badge: ['default','success','warning','error','info'], toast: ['default','success','warning','error','info'],
  form: ['default','disabled','loading','error','success'], field: ['default','hover','focus','disabled','error'], upload: ['default','hover','focus','disabled','loading','error'],
  empty: ['empty'], loading: ['loading'], alert: ['default','success','warning','error','info'],
  checkbox: ['default','hover','focus','checked','indeterminate','disabled','error'], radio: ['default','hover','focus','checked','disabled','error'], switch: ['default','hover','focus','checked','disabled'],
}
const fieldStates = ['default', 'hover', 'focus', 'disabled', 'error']
for (const id of ['textarea','combo-box','autocomplete','number-field','search-field','date-field','date-picker','date-range-picker','time-field','time-picker','color-field']) componentStateSets[id] = fieldStates
for (const id of ['calendar','range-calendar','slider','color-area','color-slider','color-swatch-picker','list-box','checkbox-group','toggle-button','toggle-button-group']) componentStateSets[id] = ['default','focus','selected','disabled']
for (const id of ['accordion','disclosure','disclosure-group','dropdown','link','close-button']) componentStateSets[id] = ['default','hover','focus','disabled']
for (const id of ['popover','tooltip','popconfirm','color-picker','image-preview']) componentStateSets[id] = ['default','open']
for (const id of ['modal','alert-dialog']) componentStateSets[id] = ['default','open']
for (const id of ['card','divider','grid','space','stack','page-container','descriptions','avatar','icon','kbd','surface','separator','meter','progress','progress-bar','progress-circle','steps','button-group','toolbar','input-group','file-list','tag-group','cascader','drop-zone','breadcrumb','tree','resizable-panel','scroll-shadow','color-swatch']) componentStateSets[id] = ['default']
for (const id of ['spinner','skeleton']) componentStateSets[id] = ['loading']
componentStateSets['input-otp'] = ['default','focus','disabled']
componentStateSets['checkbox-group'] = ['default','hover','focus','selected','disabled','loading','error']
for (const id of ['checkbox','radio','switch']) componentStateSets[id].push('loading')
for (const id of ['slider','color-area','color-slider']) componentStateSets[id] = ['default','focus','disabled']
componentStateSets['color-picker'] = ['default']
componentStateSets.tree = ['default','focus','selected','open']
componentStateSets.dropdown = ['default','hover','focus','open','disabled']
for (const id of ['accordion','disclosure','disclosure-group']) componentStateSets[id].push('open')
componentStateSets.message = ['default','success','warning','error','info']
for (const item of AI_COMPONENTS) componentStateSets[item.id] = [...item.states]
const make = (id: string, name: string, category: ComponentBinding['category']): ComponentBinding => {
  const states = componentStateSets[id]
  if (!states) throw new Error(`组件 ${id} 缺少显式状态契约`)
  return { componentId:id, category, runtimeExport:`DS${name}`, recipeId:`${id}-recipe`, tokenSlots:['background','text','border','radius','height','spacing','focus'], states, source:'platform', status:'default', implementation:'implemented' }
}
export const DESKTOP_COMPONENT_BINDINGS: readonly ComponentBinding[] = [
  ...AI_COMPONENTS.map(item=>make(item.id,item.exportName.slice(2),'data')),
  ...[['combo-box','ComboBox'],['slider','Slider'],['calendar','Calendar'],['date-field','DateField'],['drop-zone','DropZone'],['icon','Icon']].map(([id,n]) => make(id,n,'form')),
  make('button','Button','form'),
  ...[['input','Input'],['select','Select'],['textarea','TextArea'],['checkbox','Checkbox'],['radio','Radio'],['switch','Switch'],['form','Form'],['field','Field'],['date-picker','DatePicker'],['date-range-picker','DateRangePicker'],['time-picker','TimePicker'],['cascader','Cascader'],['autocomplete','Autocomplete']].map(([id,n]) => make(id,n,'form')),
  ...[['table','Table'],['pagination','Pagination'],['tag','Tag'],['badge','Badge'],['empty','Empty'],['loading','Loading'],['progress','Progress'],['descriptions','Descriptions'],['tree','Tree']].map(([id,n]) => make(id,n,'data')),
  ...[['tabs','Tabs'],['breadcrumb','Breadcrumb'],['menu','Menu'],['dropdown','Dropdown'],['steps','Steps']].map(([id,n]) => make(id,n,'navigation')),
  ...[['dialog','Dialog'],['drawer','Drawer'],['toast','Toast'],['message','Message'],['alert','Alert'],['tooltip','Tooltip'],['popover','Popover'],['popconfirm','Popconfirm']].map(([id,n]) => make(id,n,'feedback')),
  ...[['card','Card'],['divider','Divider'],['grid','Grid'],['space','Space'],['stack','Stack'],['page-container','PageContainer'],['resizable-panel','ResizablePanel'],['upload','Upload'],['image-preview','ImagePreview'],['avatar','Avatar'],['file-list','FileList']].map(([id,n]) => make(id,n,id==='upload'||id.includes('image')||id.includes('file')||id==='avatar'?'media':'layout')),
  ...[['accordion','Accordion'],['alert-dialog','AlertDialog'],['button-group','ButtonGroup'],['close-button','CloseButton'],['disclosure','Disclosure'],['disclosure-group','DisclosureGroup'],['checkbox-group','CheckboxGroup'],['color-area','ColorArea'],['color-field','ColorField'],['color-picker','ColorPicker'],['color-slider','ColorSlider'],['color-swatch','ColorSwatch'],['color-swatch-picker','ColorSwatchPicker'],['input-group','InputGroup'],['input-otp','InputOTP'],['kbd','Kbd'],['link','Link'],['list-box','ListBox'],['meter','Meter'],['modal','Modal'],['number-field','NumberField'],['progress-bar','ProgressBar'],['progress-circle','ProgressCircle'],['range-calendar','RangeCalendar'],['scroll-shadow','ScrollShadow'],['search-field','SearchField'],['separator','Separator'],['skeleton','Skeleton'],['spinner','Spinner'],['surface','Surface'],['tag-group','TagGroup'],['time-field','TimeField'],['toggle-button','ToggleButton'],['toggle-button-group','ToggleButtonGroup'],['toolbar','Toolbar']].map(([id,n]) => make(id,n,'layout')),
]
export function getDesktopComponentBinding(componentId: string) { return DESKTOP_COMPONENT_BINDINGS.find((binding) => binding.componentId === componentId) }
/** Availability of the three commonly over-declared states, at the public API boundary. */
export function getComponentStateSupport(componentId: string) {
  const binding = getDesktopComponentBinding(componentId)
  if (!binding) throw new Error(`未知组件 ${componentId}`)
  return ['disabled','loading','error'].map(state => ({ state, status: binding.states.includes(state) ? 'implemented' as const : 'not-applicable' as const }))
}
export function resolveComponentBinding(binding: ComponentBinding, overrides: Partial<Pick<ComponentBinding, 'recipeId'|'tokenSlots'|'states'>> = {}): ComponentBinding { return { ...binding, ...overrides, source: Object.keys(overrides).length ? 'project' : binding.source, status: Object.keys(overrides).length ? 'override' : binding.status, implementation: binding.implementation } }

/** Resolve binding slots against the current project's semantic token map. */
export function resolveComponentTokens(binding: ComponentBinding, values: Record<string, string>, sources: Record<string, BindingSource | 'global' | 'platform' | 'asset'>): ComponentTokenResolution[] {
  const aliases: Record<string, string> = { background: 'surface-primary', text: 'text-primary', border: 'border-default', radius: 'radius-control', height: 'control-height-md', spacing: 'spacing-16', focus: 'brand-primary' }
  if (binding.componentId === 'dialog' || binding.componentId === 'drawer') { aliases.radius = 'radius-dialog'; aliases.spacing = 'spacing-24' }
  if (binding.componentId === 'table') aliases.radius = 'radius-table'
  if (binding.componentId === 'pagination') aliases.height = 'pagination-control-height'
  if (AI_COMPONENTS.some(item=>item.id===binding.componentId)) { aliases.radius=['prompt-input','chat-message'].includes(binding.componentId)?'ai-composer-radius':'ai-panel-radius';aliases.spacing='ai-message-gap';aliases.border='ai-border' }
  if (binding.componentId === 'tag' || binding.componentId === 'badge') aliases.radius = 'radius-sm'
  return binding.tokenSlots.map((slot) => { const tokenId = aliases[slot] ?? slot; const source = sources[tokenId]; return { slot, tokenId, value: values[tokenId] ?? '', source: (source === 'compatibility' ? 'compatibility' : source === 'release' ? 'release' : source === 'project' || source === 'asset' ? 'project' : source === 'designer' ? 'designer' : 'platform') as BindingSource } })
}

const stateTokenRoles: Record<string, Array<[string, string]>> = {
  default: [['背景', 'surface-primary'], ['文字', 'text-primary'], ['边框', 'border-default']],
  hover: [['背景', 'surface-secondary'], ['文字', 'text-primary'], ['边框', 'brand-hover']],
  focus: [['背景', 'surface-primary'], ['文字', 'text-primary'], ['边框', 'border-default'], ['焦点环', 'brand-primary']],
  active: [['背景', 'brand-secondary'], ['文字', 'brand-primary'], ['边框', 'brand-active']],
  pressed: [['背景', 'brand-secondary'], ['文字', 'brand-primary'], ['边框', 'brand-active']],
  selected: [['背景', 'brand-secondary'], ['文字', 'brand-primary'], ['边框', 'brand-primary']],
  checked: [['背景', 'brand-primary'], ['文字', 'text-on-brand'], ['边框', 'brand-primary']],
  indeterminate: [['背景', 'brand-primary'], ['文字', 'text-on-brand'], ['边框', 'brand-primary']],
  open: [['背景', 'surface-primary'], ['文字', 'text-primary'], ['边框', 'brand-primary']],
  disabled: [['背景', 'surface-secondary'], ['文字', 'text-tertiary'], ['边框', 'border-default']],
  loading: [['背景', 'surface-secondary'], ['文字', 'text-tertiary'], ['强调', 'brand-primary']],
  error: [['背景', 'surface-primary'], ['文字', 'status-error-text'], ['边框', 'status-error']],
  success: [['背景', 'surface-primary'], ['文字', 'status-success-text'], ['边框', 'status-success']],
  warning: [['背景', 'surface-primary'], ['文字', 'status-warning-text'], ['边框', 'status-warning']],
  info: [['背景', 'surface-primary'], ['文字', 'status-info'], ['边框', 'status-info']],
  empty: [['背景', 'surface-primary'], ['文字', 'text-secondary'], ['边框', 'border-default']],
}

const formControlRoles: Record<string, Array<[string, string]>> = {
  default: [['背景','surface-primary'],['文字','text-primary'],['边框','border-default']],
  hover: [['背景','surface-primary'],['文字','text-primary'],['边框','brand-hover']],
  focus: [['背景','surface-primary'],['文字','text-primary'],['边框','brand-primary'],['焦点环基色（32%）','brand-primary']],
  open: [['背景','surface-primary'],['文字','text-primary'],['边框','brand-primary']],
  disabled: [['背景','surface-secondary'],['文字','text-tertiary'],['边框','border-default']],
  error: [['背景','surface-primary'],['文字','text-primary'],['错误提示','status-error-text'],['边框','status-error']],
}
const selectionRoles: Record<string, Array<[string, string]>> = {
  ...formControlRoles,
  checked: [['背景','brand-primary'],['图标','text-on-brand'],['边框','brand-primary']],
  indeterminate: [['背景','brand-primary'],['图标','text-on-brand'],['边框','brand-primary']],
}
const feedbackRoles: Record<string, Array<[string, string]>> = {
  default: [['背景','surface-secondary'],['文字','text-primary'],['边框','border-default']],
  success: stateTokenRoles.success, warning: stateTokenRoles.warning, error: stateTokenRoles.error, info: stateTokenRoles.info,
  hover: stateTokenRoles.hover, disabled: stateTokenRoles.disabled,
}
const componentStateTokenRoles: Record<string, Record<string, Array<[string, string]>>> = {
  input: formControlRoles, select: { ...formControlRoles, selected: stateTokenRoles.selected }, field: formControlRoles, upload: { ...formControlRoles, loading: stateTokenRoles.loading },
  checkbox: selectionRoles, radio: selectionRoles, switch: selectionRoles,
  table: { default: stateTokenRoles.default, hover: stateTokenRoles.hover, selected: stateTokenRoles.selected, loading: stateTokenRoles.loading, empty: stateTokenRoles.empty },
  pagination: { default: stateTokenRoles.default, hover: stateTokenRoles.hover, focus: stateTokenRoles.focus, active: stateTokenRoles.active, disabled: stateTokenRoles.disabled },
  tabs: { default: stateTokenRoles.default, hover: stateTokenRoles.hover, focus: stateTokenRoles.focus, selected: stateTokenRoles.selected, disabled: stateTokenRoles.disabled },
  dialog: { default: [['背景','surface-primary'],['文字','text-primary'],['边框','border-default'],['阴影','shadow-dialog']], open: stateTokenRoles.open, loading: stateTokenRoles.loading },
  drawer: { default: [['背景','surface-primary'],['文字','text-primary'],['边框','border-default'],['阴影','shadow-overlay']], open: stateTokenRoles.open, loading: stateTokenRoles.loading },
  tag: feedbackRoles, badge: feedbackRoles, toast: feedbackRoles, alert: feedbackRoles,
  form: { default: stateTokenRoles.default, disabled: stateTokenRoles.disabled, loading: stateTokenRoles.loading, error: stateTokenRoles.error, success: stateTokenRoles.success },
  empty: { empty: stateTokenRoles.empty }, loading: { loading: stateTokenRoles.loading },
}

function resolveTokenExpression(value: string, values: Record<string, string>, seen = new Set<string>()): string {
  return value.replace(/var\(--([a-z0-9-]+)\)/gi, (_, tokenId: string) => {
    if (seen.has(tokenId)) return `var(--${tokenId})`
    const next = values[tokenId]
    if (!next) return `var(--${tokenId})`
    return resolveTokenExpression(next, values, new Set([...seen, tokenId]))
  })
}

function effectiveSource(tokenId: string, values: Record<string, string>, sources: Record<string, BindingSource | 'global' | 'platform' | 'asset'>): BindingSource {
  const direct = sources[tokenId]
  const references = [...(values[tokenId] ?? '').matchAll(/var\(--([a-z0-9-]+)\)/gi)].map((match) => match[1])
  const referenced = references.map((id) => sources[id])
  if (direct === 'compatibility') return 'compatibility'
  if (direct === 'release' || referenced.includes('release')) return 'release'
  if (direct === 'project' || direct === 'asset' || referenced.some((source) => source === 'project' || source === 'asset')) return 'project'
  if (direct === 'designer' || referenced.includes('designer')) return 'designer'
  return 'platform'
}

export function resolveComponentStateTokens(
  binding: ComponentBinding,
  state: string,
  values: Record<string, string>,
  sources: Record<string, BindingSource | 'global' | 'platform' | 'asset'>,
  buttonStyle: { variant: 'primary' | 'secondary' | 'tertiary'; semantic: 'default' | 'danger' } = { variant: 'primary', semantic: 'default' },
): ComponentStateTokenResolution[] {
  let roles = componentStateTokenRoles[binding.componentId]?.[state] ?? stateTokenRoles[state] ?? stateTokenRoles.default
  if (binding.componentId === 'button') {
    const prefix = buttonStyle.semantic === 'danger'
      ? buttonStyle.variant === 'primary' ? 'button-danger-filled' : buttonStyle.variant === 'tertiary' ? 'button-danger-ghost' : 'button-danger-outline'
      : buttonStyle.variant === 'primary' ? 'button-brand-filled' : buttonStyle.variant === 'tertiary' ? 'button-neutral-ghost' : 'button-neutral-outline'
    if (state === 'disabled' || state === 'loading') {
      roles = [['背景', 'button-control-bg-disabled'], ['文字', 'button-control-text-disabled'], ['边框', 'button-control-border-disabled']]
    } else {
      const suffix = state === 'hover' ? 'hover' : state === 'active' || state === 'pressed' ? 'active' : 'default'
      roles = [['背景', `${prefix}-bg-${suffix}`], ['文字', values[`${prefix}-text-${suffix}`] ? `${prefix}-text-${suffix}` : `${prefix}-text-default`], ['边框', `${prefix}-border-default`]]
      if (state === 'focus') roles = [...roles, ['焦点环', 'brand-primary']]
    }
  }
  return roles.map(([slot, tokenId]) => ({
    slot,
    tokenId,
    value: values[tokenId] ?? '',
    resolvedValue: resolveTokenExpression(values[tokenId] ?? '', values),
    source: effectiveSource(tokenId, values, sources),
  }))
}
