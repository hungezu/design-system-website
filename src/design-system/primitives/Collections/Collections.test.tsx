import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DSBreadcrumb } from './index'

describe('集合导航组件', () => {
  it('面包屑仅将最后一项标记为当前页', () => {
    const html = renderToStaticMarkup(<DSBreadcrumb items={[
      { id: 'project', label: '项目', href: '/projects' },
      { id: 'component', label: '组件', href: '/components' },
      { id: 'current', label: '当前示例' },
    ]} />)

    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toContain('href="/projects"')
    expect(html).toContain('href="/components"')
  })
})
