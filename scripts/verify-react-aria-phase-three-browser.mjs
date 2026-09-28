import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { createRequire } from 'node:module'

const root = process.cwd()
const host = '127.0.0.1'
const expectedProjectCount = 76
const phaseThreeIds = ['token-field', 'grid-list', 'color-wheel', 'navigation-tree', 'preview-trigger', 'group', 'virtualizer']
const checks = []
const consoleErrors = []
const screenshotDirectory = process.env.PHASE_THREE_BROWSER_SCREENSHOT_DIR
  ? resolve(process.env.PHASE_THREE_BROWSER_SCREENSHOT_DIR)
  : null
if (screenshotDirectory) mkdirSync(screenshotDirectory, { recursive: true })

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))

async function reservePort() {
  return new Promise((resolvePromise, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, host, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close((error) => error ? reject(error) : resolvePromise(port))
    })
  })
}

function loadPuppeteer() {
  try {
    const require = createRequire(join(root, 'package.json'))
    const module = require('puppeteer-core')
    return module.default ?? module
  } catch {
    // An explicit path remains available for constrained CI environments.
  }
  const explicit = process.env.PUPPETEER_CORE_PATH
  if (explicit && existsSync(explicit)) {
    const require = createRequire(import.meta.url)
    const module = require(explicit)
    return module.default ?? module
  }
  throw new Error('找不到 puppeteer-core。请在项目安装该依赖，或通过 PUPPETEER_CORE_PATH 指向可加载入口。')
}

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)
  const executable = candidates.find((candidate) => existsSync(candidate))
  if (!executable) throw new Error('找不到 Chrome/Chromium。请通过 CHROME_BIN 指定浏览器可执行文件。')
  return executable
}

async function waitForServer(baseUrl, child, readLogs) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Vite 提前退出（${child.exitCode}）\n${readLogs()}`)
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {
      // Vite is still starting.
    }
    await sleep(150)
  }
  throw new Error(`Vite 在 30 秒内未就绪\n${readLogs()}`)
}

async function stopChild(child) {
  if (!child || child.exitCode !== null) return
  child.kill('SIGTERM')
  const stopped = await Promise.race([once(child, 'exit').then(() => true), sleep(3_000).then(() => false)])
  if (!stopped && child.exitCode === null) {
    child.kill('SIGKILL')
    await once(child, 'exit').catch(() => {})
  }
}

async function runCheck(name, callback) {
  try {
    const detail = await callback()
    checks.push({ name, status: 'passed', detail })
  } catch (error) {
    checks.push({ name, status: 'failed', error: error instanceof Error ? error.message : String(error) })
  }
}

async function main() {
  const port = Number(process.env.PHASE_THREE_BROWSER_PORT) || await reservePort()
  const baseUrl = `http://${host}:${port}`
  const viteEntry = resolve(root, 'node_modules/vite/bin/vite.js')
  const viteConfig = join(tmpdir(), `design-system-phase-three-vite-${process.pid}.mjs`)
  assert.ok(existsSync(viteEntry), `Vite 入口不存在：${viteEntry}`)
  // The normal development config proxies /release-assets to the authenticated
  // workspace. Static acceptance must serve the checked-in public assets directly.
  writeFileSync(viteConfig, `export default { root: ${JSON.stringify(root)}, server: { proxy: {} } }\n`)
  let viteLogs = ''
  const vite = spawn(process.execPath, [viteEntry, '--config', viteConfig, '--host', host, '--port', String(port), '--strictPort'], {
    cwd: root,
    env: { ...process.env, VITE_STATIC_DEMO: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const appendViteLog = (chunk) => { viteLogs = `${viteLogs}${chunk}`.slice(-16_000) }
  vite.stdout.on('data', appendViteLog)
  vite.stderr.on('data', appendViteLog)

  let browser
  try {
    await waitForServer(baseUrl, vite, () => viteLogs)
    const puppeteer = loadPuppeteer()
    browser = await puppeteer.launch({
      executablePath: findChrome(),
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })

    const routeUrl = (route) => `${baseUrl}/#${route}`
    const componentUrl = (id, variant) => {
      const params = new URLSearchParams({ version: 'draft' })
      if (variant && variant !== 'default') params.set('variant', variant)
      return routeUrl(`/projects/guokexin/components/${id}?${params}`)
    }

    async function withPage(name, callback) {
      const page = await browser.newPage()
      const pageErrors = []
      page.on('pageerror', (error) => pageErrors.push(`pageerror: ${String(error)}`))
      page.on('console', (message) => {
        if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`)
      })
      await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 })
      try {
        const detail = await callback(page)
        await sleep(80)
        if (screenshotDirectory) {
          await page.screenshot({ path: join(screenshotDirectory, `${basename(name).replace(/[^a-z0-9-]+/gi, '-')}.png`), fullPage: false })
        }
        return detail
      } finally {
        consoleErrors.push(...pageErrors.map((error) => ({ check: name, url: page.url(), error })))
        await page.close()
      }
    }

    async function openComponent(page, id, variant = 'default') {
      const response = await page.goto(componentUrl(id, variant), { waitUntil: 'domcontentloaded', timeout: 30_000 })
      assert.ok([200, 304].includes(response?.status() ?? 0), `${id} 页面 HTTP 状态不是 200/304`)
      const selector = `.component-doc-playground[data-component-id="${id}"]`
      await page.waitForSelector(selector, { timeout: 15_000 })
      const fallback = await page.$eval(selector, (node) => node.textContent?.includes('尚未提供独立交互示例') ?? false)
      assert.equal(fallback, false, `${id} 仍落入示例占位分支`)
      return selector
    }

    await runCheck('project-directory', () => withPage('project-directory', async (page) => {
      const response = await page.goto(routeUrl('/projects/guokexin/components?version=draft'), { waitUntil: 'domcontentloaded', timeout: 30_000 })
      assert.ok([200, 304].includes(response?.status() ?? 0), '项目目录 HTTP 状态不是 200/304')
      await page.waitForFunction((expected) => document.querySelectorAll('.component-card-preview[data-component-id]').length === expected, { timeout: 15_000 }, expectedProjectCount)
      const result = await page.evaluate((expectedIds) => {
        const ids = [...document.querySelectorAll('.component-card-preview[data-component-id]')].map((node) => node.getAttribute('data-component-id')).filter(Boolean)
        const text = document.body.textContent ?? ''
        const forbidden = ['54 / 54', '54/54', '公共网站覆盖', '国科信项目覆盖', 'React Aria 家族覆盖']
        return {
          count: ids.length,
          uniqueCount: new Set(ids).size,
          missingPhaseThree: expectedIds.filter((id) => !ids.includes(id)),
          visibleCoverageStatistics: forbidden.filter((value) => text.includes(value)),
        }
      }, phaseThreeIds)
      assert.equal(result.count, expectedProjectCount)
      assert.equal(result.uniqueCount, expectedProjectCount)
      assert.deepEqual(result.missingPhaseThree, [])
      assert.deepEqual(result.visibleCoverageStatistics, [])
      return result
    }))

    await runCheck('token-field', () => withPage('token-field', async (page) => {
      await openComponent(page, 'token-field')
      const editor = '.component-doc-preview__stage .owned-token-input[role="textbox"]'
      await page.waitForSelector(editor)
      const before = await page.$eval('.component-doc-preview__stage .owned-token-field', (rootNode) => ({
        tokens: [...rootNode.querySelectorAll('.owned-token')].map((node) => node.textContent?.trim()),
        editable: rootNode.querySelector('[role="textbox"]')?.getAttribute('contenteditable'),
      }))
      assert.deepEqual(before.tokens, ['设计', '开发'])
      assert.ok(before.editable === 'true' || before.editable === 'plaintext-only', 'TokenField 编辑区不是 contenteditable')
      await page.click(editor)
      await page.keyboard.press('End')
      await page.keyboard.type('验收')
      const text = await page.$eval(editor, (node) => node.textContent ?? '')
      assert.match(text, /验收/)
      return { ...before, typedText: text }
    }))

    await runCheck('grid-list', () => withPage('grid-list', async (page) => {
      await openComponent(page, 'grid-list')
      const row = '.component-doc-preview__stage .owned-grid-list__item:not([data-disabled])'
      const before = await page.$$eval('.component-doc-preview__stage .owned-grid-list__item', (nodes) => ({
        count: nodes.length,
        disabled: nodes.filter((node) => node.hasAttribute('data-disabled') || node.getAttribute('aria-disabled') === 'true').length,
      }))
      assert.equal(before.count, 3)
      assert.equal(before.disabled, 1)
      await page.click(row)
      const selected = await page.$eval(row, (node) => node.hasAttribute('data-selected') || node.getAttribute('aria-selected') === 'true')
      assert.equal(selected, true)
      return { ...before, selected }
    }))

    await runCheck('color-wheel', () => withPage('color-wheel', async (page) => {
      await openComponent(page, 'color-wheel')
      const slider = '.component-doc-preview__stage .owned-color-wheel__thumb input[type="range"]'
      await page.waitForSelector(slider)
      const before = await page.$eval(slider, (node) => node.getAttribute('aria-valuenow') ?? node.value ?? node.getAttribute('value'))
      await page.focus(slider)
      await page.keyboard.press('ArrowRight')
      await sleep(100)
      const after = await page.$eval(slider, (node) => node.getAttribute('aria-valuenow') ?? node.value ?? node.getAttribute('value'))
      const output = await page.$eval('.component-doc-preview__stage .runtime-color-wheel-example output', (node) => node.textContent?.trim())
      assert.notEqual(after, before, 'ColorWheel 键盘操作未改变色相')
      assert.match(output ?? '', /^#/)
      return { before, after, output }
    }))

    await runCheck('navigation-tree', () => withPage('navigation-tree', async (page) => {
      await openComponent(page, 'navigation-tree')
      const tree = '.component-doc-preview__stage .owned-navigation-tree'
      const chevron = `${tree} .owned-navigation-tree__chevron`
      const initialLabel = await page.$eval(chevron, (node) => node.getAttribute('aria-label') ?? '')
      if (initialLabel.startsWith('收起')) {
        await page.click(chevron)
        await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('aria-label')?.startsWith('展开'), {}, chevron)
      }
      await page.click(chevron)
      await page.waitForSelector(`${tree} .owned-navigation-tree__link[aria-current="page"]`)
      const result = await page.$eval(tree, (node) => ({
        role: node.getAttribute('role'),
        current: node.querySelector('.owned-navigation-tree__link[aria-current="page"]')?.textContent?.trim(),
        expanded: node.querySelectorAll('.owned-navigation-tree__item').length,
      }))
      assert.equal(result.role, 'treegrid')
      assert.equal(result.current, '颜色')
      assert.ok(result.expanded > 2)
      return result
    }))

    await runCheck('preview-trigger', () => withPage('preview-trigger', async (page) => {
      await openComponent(page, 'preview-trigger')
      const trigger = '.component-doc-preview__stage .owned-preview-trigger'
      await page.focus(trigger)
      await page.waitForSelector('.owned-preview-popover', { visible: true, timeout: 3_000 })
      const result = await page.$eval('.owned-preview-popover', (node) => ({
        label: node.getAttribute('aria-label'),
        text: node.textContent?.replace(/\s+/g, ' ').trim(),
      }))
      assert.equal(result.label, '预览品牌色预览')
      assert.match(result.text ?? '', /品牌主色/)
      return result
    }))

    await runCheck('group', () => withPage('group', async (page) => {
      await openComponent(page, 'group', 'disabled')
      const result = await page.$eval('.component-doc-preview__stage .owned-group', (node) => ({
        role: node.getAttribute('role'),
        label: node.getAttribute('aria-label'),
        disabled: node.hasAttribute('data-disabled'),
        buttons: [...node.querySelectorAll('button')].map((button) => button.disabled),
      }))
      assert.equal(result.role, 'group')
      assert.equal(result.label, '资源操作')
      assert.equal(result.disabled, true)
      assert.deepEqual(result.buttons, [true, true])
      return result
    }))

    await runCheck('virtualizer', () => withPage('virtualizer', async (page) => {
      await openComponent(page, 'virtualizer')
      const grid = '.component-doc-preview__stage .owned-virtualizer'
      await page.waitForSelector(`${grid} [role="row"]`)
      const before = await page.$eval(grid, (node) => ({
        role: node.getAttribute('role'),
        rowCount: Number(node.getAttribute('aria-rowcount')),
        renderedRows: node.querySelectorAll('[role="row"]').length,
        labels: [...node.querySelectorAll('[role="row"]')].map((row) => row.textContent?.trim()),
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
      }))
      assert.equal(before.role, 'grid')
      assert.equal(before.rowCount, 120)
      assert.ok(before.renderedRows > 0 && before.renderedRows < before.rowCount, 'Virtualizer 未裁剪 DOM 行数')
      assert.ok(before.scrollHeight > before.clientHeight, 'Virtualizer 没有可滚动内容')
      await page.click(`${grid} [role="row"]`)
      const selected = await page.$eval(`${grid} [role="row"]`, (node) => node.hasAttribute('data-selected') || node.getAttribute('aria-selected') === 'true')
      assert.equal(selected, true)
      await page.$eval(grid, (node) => { node.scrollTop = node.scrollHeight; node.dispatchEvent(new Event('scroll', { bubbles: true })) })
      await sleep(250)
      const afterLabels = await page.$$eval(`${grid} [role="row"]`, (nodes) => nodes.map((node) => node.textContent?.trim()))
      assert.notDeepEqual(afterLabels, before.labels, 'Virtualizer 滚动后可见行没有变化')
      return { ...before, selected, afterLabels }
    }))

    await runCheck('console-errors', async () => {
      assert.deepEqual(consoleErrors, [])
      return { count: 0 }
    })
  } finally {
    if (browser) await browser.close()
    await stopChild(vite)
    if (existsSync(viteConfig)) unlinkSync(viteConfig)
  }

  const failed = checks.filter((check) => check.status === 'failed')
  const report = {
    status: failed.length ? 'failed' : 'passed',
    mode: 'VITE_STATIC_DEMO=true',
    projectComponentCount: expectedProjectCount,
    phaseThreeIds,
    checks,
    consoleErrors,
    screenshotDirectory,
  }
  console.log(JSON.stringify(report, null, 2))
  if (failed.length) process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
