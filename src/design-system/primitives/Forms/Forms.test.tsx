import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DSCheckbox, DSCheckboxGroup, DSField, DSRadio, DSSwitch, DSForm } from './index'

describe('自有表单组件', () => {
  it('Checkbox 保留原生表单名称和值，loading 阻止操作', () => {
    const html = renderToStaticMarkup(<DSCheckbox label="通知" name="notify" value="yes" defaultChecked loading />)
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('name="notify"')
    expect(html).toContain('value="yes"')
    expect(html).toContain('checked=""')
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-busy="true"')
  })
  it('RadioGroup 提供单选组语义与禁用选项，Switch 提供开关语义', () => {
    const html = renderToStaticMarkup(<DSRadio label="密度" name="density" defaultValue="normal" options={[{value:'normal',label:'标准'}, {value:'compact',label:'紧凑',disabled:true}]} />)
    expect(html).toContain('role="radiogroup"')
    expect(html.match(/type="radio"/g)).toHaveLength(2)
    expect(html).toContain('disabled=""')
    expect(renderToStaticMarkup(<DSSwitch label="通知" defaultChecked />)).toContain('role="switch"')
  })
  it('Form 在处理期间禁用字段并提供错误反馈', () => {
    const html = renderToStaticMarkup(<DSForm label="设置" loading error="保存失败"><input name="name" /></DSForm>)
    expect(html).toContain('<fieldset disabled=""')
    expect(html).toContain('role="alert"')
    expect(html).toContain('data-tone="error"')
    expect(html).toContain('保存失败')
  })
  it('Form 成功反馈使用非颜色语义图标并礼貌播报', () => {
    const html = renderToStaticMarkup(<DSForm label="设置" success="校验成功"><input name="name" /></DSForm>)
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('data-tone="success"')
    expect(html).toContain('校验成功')
    expect(html).toContain('<svg')
  })
})

describe('组合字段', () => {
  it('CheckboxGroup 输出选中与禁用项，不把多选变成独立无关联输入', () => {
    const html = renderToStaticMarkup(<DSCheckboxGroup label="权限" name="permissions" defaultValue={['read']} options={[{value:'read',label:'读取'}, {value:'write',label:'编辑',disabled:true}]} />)
    expect(html).toContain('role="group"')
    expect(html.match(/type="checkbox"/g)).toHaveLength(2)
    expect(html).toContain('checked=""')
    expect(html).toContain('disabled=""')
  })
  it('Field 将标签、说明和错误关联到调用方控件', () => {
    const html = renderToStaticMarkup(<DSField label="标题" description="帮助" error="必填" required>{props => <input {...props} />}</DSField>)
    const id = html.match(/<input[^>]*\sid="([^"]+)"/)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`for="${id}"`)
    expect(html).toContain(`aria-describedby="${id}-description ${id}-error"`)
    expect(html).toContain('aria-invalid="true"')
  })
})
