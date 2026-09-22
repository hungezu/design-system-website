// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
it('兼容按钮规则不匹配正式 Primitive；导入顺序不会覆盖边框、行高和状态', () => {
  const css = readFileSync('src/runtime/vendor/runtime.css', 'utf8')
  const style = document.createElement('style'); style.textContent = css; document.head.append(style)
  try {
    const element = document.createElement('button')
    element.className = 'gkx-button ds-btn ds-btn--primary ds-btn--sem-default ds-btn--md'
    const rules = Array.from(style.sheet!.cssRules).filter((rule): rule is CSSStyleRule => 'selectorText' in rule && /\.ds-btn(?:[\s:.,#[]|--)/.test((rule as CSSStyleRule).selectorText))
    expect(rules.length).toBeGreaterThan(20)
    expect(rules.filter(rule => element.matches(rule.selectorText))).toEqual([])
    element.classList.remove('gkx-button')
    expect(rules.some(rule => element.matches(rule.selectorText))).toBe(true)
  } finally { style.remove() }
})
