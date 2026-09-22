import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import puppeteer from '/Users/Zhuanz/Documents/trae_projects/b-design-spec-workbench/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'

const baseUrl = process.env.BDS_BASE_URL ?? 'http://127.0.0.1:5173'
const output = path.resolve('acceptance-workspace/component-audit')
const screenshots = path.join(output, 'screens')
fs.mkdirSync(screenshots, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox'],
})

const indexPage = await browser.newPage()
await indexPage.setViewport({ width: 1280, height: 900 })
await indexPage.goto(`${baseUrl}/components`, { waitUntil: 'networkidle0', timeout: 30000 })
const routes = await indexPage.evaluate(() => [...new Set(
  [...document.querySelectorAll('a[href^="/components/"]')]
    .map((node) => node.getAttribute('href'))
    .filter(Boolean),
)])
await indexPage.close()

async function auditRoute(route) {
  const page = await browser.newPage()
  const consoleErrors = []
  page.on('pageerror', (error) => consoleErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.setViewport({ width: 1280, height: 900 })
  let response
  try {
    response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForSelector('.component-doc-playground', { timeout: 15000 })
  } catch (error) {
    consoleErrors.push(String(error))
    await page.close()
    return { route, status: response?.status() ?? 0, consoleErrors, missingPreview: true, previewOverflowX: false, previewOverflowY: false, fallback: false, nativeSelects: 0, outside: [], undersized: [], fieldOverflow: [], unresolvedColors: 0 }
  }
  const result = await page.evaluate(() => {
    const preview = document.querySelector('.component-doc-preview')
    if (!(preview instanceof HTMLElement)) return { missingPreview: true }
    const previewRect = preview.getBoundingClientRect()
    const visible = (node) => {
      const style = getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      const internalEmptyButton = node.tagName === 'BUTTON' && !node.className && !node.textContent?.trim() && !node.children.length
      return !internalEmptyButton && node.getAttribute('aria-hidden') !== 'true' && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && !style.clipPath.includes('inset(50%') && rect.left >= 0 && rect.top >= 0 && rect.width > 1 && rect.height > 1
    }
    const controls = [...preview.querySelectorAll('button,input,textarea,select,[role="button"],[role="slider"],[role="switch"],[role="checkbox"],[role="radio"]')].filter(visible)
    const outside = controls.filter((node) => {
      const rect = node.getBoundingClientRect()
      return rect.left < previewRect.left - 1 || rect.right > previewRect.right + 1 || rect.top < previewRect.top - 1 || rect.bottom > previewRect.bottom + 1
    }).map((node) => ({ tag: node.tagName.toLowerCase(), name: node.getAttribute('aria-label') || node.textContent?.trim().slice(0, 40) || '', className: node.className }))
    const undersized = controls.filter((node) => {
      const rect = node.getBoundingClientRect()
      const type = node.getAttribute('type')
      const wrapper = node.closest('.ds-input__box,.owned-control-row,.owned-field')
      return rect.height < 24 && !(wrapper && wrapper.getBoundingClientRect().height >= 28) && !['checkbox', 'radio', 'color', 'range'].includes(type || '')
    }).map((node) => ({ tag: node.tagName.toLowerCase(), name: node.getAttribute('aria-label') || node.textContent?.trim().slice(0, 40) || '', height: Math.round(node.getBoundingClientRect().height * 10) / 10 }))
    const nativeSelects = [...preview.querySelectorAll('select')].filter(visible).length
    const fieldOverflow = [...preview.querySelectorAll('input,textarea')].filter(visible).filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).map((node) => ({ tag: node.tagName.toLowerCase(), name: node.getAttribute('aria-label') || '', clientWidth: node.clientWidth, scrollWidth: node.scrollWidth, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight }))
    const unresolvedColors = [...preview.querySelectorAll('*')].filter(visible).filter((node) => {
      const style = getComputedStyle(node)
      return [style.color, style.backgroundColor, style.borderColor].some((value) => value.includes('var('))
    }).length
    return {
      missingPreview: false,
      heading: document.querySelector('h1')?.textContent?.trim() ?? '',
      previewOverflowX: preview.scrollWidth > preview.clientWidth + 1,
      previewOverflowY: preview.scrollHeight > preview.clientHeight + 1 && getComputedStyle(preview).overflowY === 'visible',
      fallback: preview.textContent?.includes('尚未提供独立交互示例') ?? false,
      nativeSelects,
      outside,
      undersized,
      fieldOverflow,
      unresolvedColors,
    }
  })
  const id = route.split('/').filter(Boolean).at(-1)
  const preview = await page.$('.component-doc-playground')
  if (preview) await preview.screenshot({ path: path.join(screenshots, `${id}.png`) })
  await page.close()
  return { route, status: response?.status(), consoleErrors, ...result }
}

const queue = [...routes]
const results = []
await Promise.all(Array.from({ length: 2 }, async () => {
  while (queue.length) {
    const route = queue.shift()
    if (route) results.push(await auditRoute(route))
  }
}))
results.sort((a, b) => a.route.localeCompare(b.route))
const failures = results.filter((item) => item.status !== 200 || item.consoleErrors.length || item.missingPreview || item.previewOverflowX || item.previewOverflowY || item.fallback || item.nativeSelects || item.outside.length || item.undersized.length || item.fieldOverflow.length || item.unresolvedColors)
const report = { generatedAt: new Date().toISOString(), viewport: { width: 1280, height: 900 }, total: results.length, failures: failures.length, results }
fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
const groups = Array.from({ length: Math.ceil(results.length / 12) }, (_, index) => results.slice(index * 12, index * 12 + 12))
for (const [index, group] of groups.entries()) {
  const gallery = await browser.newPage()
  await gallery.setViewport({ width: 1280, height: 900 })
  const cards = group.map((item) => {
    const id = item.route.split('/').filter(Boolean).at(-1)
    const file = path.join(screenshots, `${id}.png`)
    const src = fs.existsSync(file) ? `data:image/png;base64,${fs.readFileSync(file).toString('base64')}` : pathToFileURL(file).href
    return `<figure><figcaption>${item.heading} <code>${id}</code></figcaption><img src="${src}" alt="${item.heading}"></figure>`
  }).join('')
  await gallery.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#eef0f2;font:14px sans-serif}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;padding:12px;background:white;border:1px solid #dfe2e5;border-radius:8px}figcaption{margin-bottom:8px;font-weight:600}code{margin-left:6px;color:#687078;font-weight:400}img{display:block;width:100%;height:300px;object-fit:contain;object-position:center;background:#fafafa}</style><div class="grid">${cards}</div>`, { waitUntil: 'networkidle0' })
  await gallery.screenshot({ path: path.join(output, `contact-${index + 1}.png`), fullPage: true })
  await gallery.close()
}
const stateOutput = path.join(output, 'states')
fs.mkdirSync(stateOutput, { recursive: true })
const interactionCases = [
  { id: 'checkbox', action: async (page) => { await page.click('.owned-choice'); return page.$eval('.owned-choice', (node) => node.hasAttribute('data-selected')) } },
  { id: 'radio', action: async (page) => { await page.click('.owned-radio'); return page.$eval('.owned-radio', (node) => node.hasAttribute('data-selected')) } },
  { id: 'switch', action: async (page) => { await page.click('.owned-switch'); return page.$eval('.owned-switch', (node) => node.hasAttribute('data-selected')) } },
  { id: 'toggle-button', action: async (page) => { await page.click('.owned-toggle'); return page.$eval('.owned-toggle', (node) => node.hasAttribute('data-selected')) } },
  { id: 'accordion', action: async (page) => { await page.click('.owned-accordion button'); return page.$eval('.owned-accordion button', (node) => node.getAttribute('aria-expanded') === 'true') } },
  { id: 'tree', action: async (page) => { await page.click('.owned-tree button'); return page.$eval('.owned-tree__item', (node) => node.hasAttribute('data-expanded')) } },
  { id: 'select', action: async (page) => { await page.click('.ds-select__trigger'); await page.waitForSelector('[role="listbox"]'); return page.$eval('.ds-select__trigger', (node) => node.getAttribute('aria-expanded') === 'true') } },
  { id: 'date-picker', action: async (page) => { await page.click('.owned-date-picker button'); await page.waitForSelector('[role="dialog"]'); return true } },
  { id: 'input-otp', action: async (page) => { await page.click('.owned-otp input'); await page.keyboard.type('123456'); return page.$$eval('.owned-otp input', (nodes) => nodes.map((node) => node.value).join('') === '123456') } },
  { id: 'number-field', action: async (page) => { await page.click('.owned-number button[slot="increment"]'); return page.$eval('.owned-number input', (node) => node.value === '3') } },
]
const interactionResults = []
for (const item of interactionCases) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  try {
    await page.goto(`${baseUrl}/components/${item.id}`, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForSelector('.component-doc-playground', { timeout: 15000 })
    const passed = await item.action(page)
    await page.screenshot({ path: path.join(stateOutput, `${item.id}.png`), fullPage: false })
    interactionResults.push({ id: item.id, passed, errors })
  } catch (error) {
    interactionResults.push({ id: item.id, passed: false, errors: [...errors, String(error)] })
  }
  await page.close()
}
fs.writeFileSync(path.join(output, 'interaction-report.json'), JSON.stringify(interactionResults, null, 2))
console.log(JSON.stringify({ total: results.length, failures: failures.length, failureRoutes: failures.map((item) => item.route), output }, null, 2))
await browser.close()
