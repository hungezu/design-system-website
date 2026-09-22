import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DSInput, DSTextArea } from './index'

describe('自有 TextField 语义', () => {
  it('生成字段名、标签关联和只读值', () => {
    const html = renderToStaticMarkup(<DSInput label="项目名称" name="project" value="国科信" readOnly description="项目说明" />)
    expect(html).toContain('name="project"')
    expect(html).toContain('value="国科信"')
    expect(html).toContain('readOnly=""')
    expect(html).toContain('aria-describedby=')
    const inputId = html.match(/<input[^>]*id="([^"]+)"/)?.[1]
    expect(inputId).toBeTruthy()
    expect(html).toContain(`for="${inputId}"`)
  })
  it('禁用字段不渲染清空操作，多行字段保留行数和文本', () => {
    expect(renderToStaticMarkup(<DSInput label="名称" defaultValue="内容" disabled clearable />)).not.toContain('清空名称')
    const html = renderToStaticMarkup(<DSTextArea label="说明" rows={5} defaultValue="多行内容" />)
    expect(html).toContain('<textarea')
    expect(html).toContain('rows="5"')
    expect(html).toContain('多行内容')
  })
  it('可清空字段使用面性语义图标而不是可见文字', () => {
    const html = renderToStaticMarkup(<DSInput label="名称" defaultValue="内容" clearable />)
    expect(html).toContain('aria-label="清空名称"')
    expect(html).toContain('data-icon="clear-input"')
    expect(html).toContain('fill="currentColor"')
    expect(html).not.toContain('>清空</button>')
  })
  it('必填字段同时输出原生必填属性和可见标记', () => {
    const html = renderToStaticMarkup(<DSInput label="项目名称" required />)
    expect(html).toContain('required=""')
    expect(html).toContain('class="ds-input__required"')
    expect(html).toContain('aria-hidden="true"> *</span>')
  })
})
