import { expect, it } from 'vitest'
import schema from '../../../template.schema.json'
import { templateAssets } from './templates'

it('正式页面模板提供 AI 可读的完整契约', () => {
  const required = new Set(schema.required)
  for (const template of templateAssets.slice(0, 3)) {
    expect(template.status).toBe('stable')
    for (const field of required) expect(template).toHaveProperty(field)
    expect(template.slots.some(slot => slot.required)).toBe(true)
    expect(template.necessaryStates).toContain('error')
    expect(template.example).toContain('DESIGN.md')
  }
})
