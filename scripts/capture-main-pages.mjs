import fs from 'node:fs'
import path from 'node:path'
import puppeteer from '/Users/Zhuanz/Documents/trae_projects/b-design-spec-workbench/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'

const routes = [
  { key: 'home', path: '/' },
  { key: 'public-components', path: '/components' },
  { key: 'public-components-button', path: '/components/button' },
  { key: 'public-template-list', path: '/templates/template-list?variant=advanced' },
  { key: 'project-overview', path: '/projects/guokexin?version=1.5.5' },
  { key: 'project-theme', path: '/projects/guokexin/foundations/theme?version=1.5.5' },
  { key: 'project-components-button', path: '/projects/guokexin/components/button?version=1.5.5' },
  { key: 'project-template-list', path: '/projects/guokexin/templates/template-list?variant=bulk&version=1.5.5' },
]
const widths = [1280, 1440, 1920]
const output = path.resolve('acceptance-workspace/resource-platform-redesign')
fs.mkdirSync(output, { recursive: true })
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] })
const report = []

try {
  for (const route of routes) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    for (const width of widths) {
      await page.setViewport({ width, height: 960 })
      const response = await page.goto(`http://127.0.0.1:5173${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 })
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        heading: document.querySelector('h1')?.textContent ?? '',
        primaryNav: [...document.querySelectorAll('.global-nav a')].map((node) => node.textContent?.trim()),
        projectNav: [...document.querySelectorAll('.project-nav a')].map((node) => node.textContent?.trim()),
      }))
      const file = path.join(output, `${route.key}-${width}.png`)
      await page.screenshot({ path: file, fullPage: true })
      report.push({ route: route.path, width, status: response?.status(), file, errors: [...errors], ...geometry })
    }
    await page.close()
  }
} finally {
  await browser.close()
}

fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ screenshots: report.length, overflow: report.filter((item) => item.overflow).length, consoleErrors: report.filter((item) => item.errors.length).length, output }))
