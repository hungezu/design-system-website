import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer-core'

const root=process.cwd()
const host='127.0.0.1'
const expectedComponentCount=76
const expectedColors={
  default:'rgb(22, 93, 255)',
  hover:'rgb(14, 66, 210)',
  active:'rgb(12, 55, 176)',
  text:'rgb(255, 255, 255)',
}
const interactionSettleMs=180
const sleep=milliseconds=>new Promise(resolvePromise=>setTimeout(resolvePromise,milliseconds))

async function reservePort(){return new Promise((resolvePromise,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,host,()=>{const address=server.address();const port=typeof address==='object'&&address?address.port:0;server.close(error=>error?reject(error):resolvePromise(port))})})}
function findChrome(){const candidates=[process.env.CHROME_BIN,process.env.PUPPETEER_EXECUTABLE_PATH,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Chromium.app/Contents/MacOS/Chromium','/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);const executable=candidates.find(candidate=>existsSync(candidate));if(!executable)throw new Error('找不到 Chrome/Chromium，请通过 CHROME_BIN 指定浏览器。');return executable}
async function waitForServer(baseUrl,child,readLogs){const deadline=Date.now()+30_000;while(Date.now()<deadline){if(child.exitCode!==null)throw new Error(`Consumer Vite 提前退出（${child.exitCode}）\n${readLogs()}`);try{const response=await fetch(baseUrl);if(response.ok)return}catch{/* still starting */}await sleep(150)}throw new Error(`Consumer Vite 在 30 秒内未就绪\n${readLogs()}`)}
async function stopChild(child){if(!child||child.exitCode!==null)return;child.kill('SIGTERM');const stopped=await Promise.race([once(child,'exit').then(()=>true),sleep(3000).then(()=>false)]);if(!stopped&&child.exitCode===null){child.kill('SIGKILL');await once(child,'exit').catch(()=>{})}}

const port=Number(process.env.CONSUMER_BROWSER_PORT)||await reservePort()
const baseUrl=`http://${host}:${port}`
const viteEntry=resolve(root,'node_modules/vite/bin/vite.js')
const vite=spawn(process.execPath,[viteEntry,'--host',host,'--port',String(port),'--strictPort'],{cwd:resolve(root,'consumer'),stdio:['ignore','pipe','pipe']})
let viteLogs=''
for(const stream of [vite.stdout,vite.stderr])stream.on('data',chunk=>{viteLogs=`${viteLogs}${chunk}`.slice(-16000)})
let browser
try{
  await waitForServer(baseUrl,vite,()=>viteLogs)
  browser=await puppeteer.launch({executablePath:findChrome(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
  const page=await browser.newPage()
  const errors=[]
  const requests=[]
  page.on('pageerror',error=>errors.push(`pageerror: ${String(error)}`))
  page.on('console',message=>{if(message.type()==='error'){const location=message.location();errors.push(`console: ${message.text()}${location.url?` (${location.url})`:''}`)}})
  page.on('request',request=>requests.push(request.url()))
  const response=await page.goto(baseUrl,{waitUntil:'networkidle0',timeout:30_000})
  assert.equal(response?.status(),200)
  await page.waitForSelector('main h1',{timeout:10_000})
  const identity=await page.evaluate(()=>({
    title:document.querySelector('main h1')?.textContent?.trim(),
    status:document.querySelector('[role="status"]')?.textContent?.trim(),
    approved:Array.from(document.querySelectorAll('main p')).map(node=>node.textContent?.trim()).find(text=>text?.startsWith('批准组件：')),
  }))
  assert.equal(identity.title,'独立消费验收')
  assert.equal(identity.status,'运行时与冻结快照：一致')
  assert.equal(identity.approved,`批准组件：${expectedComponentCount} 项`)

  const selector='.ds-btn--primary:not([disabled])'
  await page.waitForSelector(selector,{timeout:10_000})
  const colors={default:await page.$eval(selector,node=>getComputedStyle(node).backgroundColor),text:await page.$eval(selector,node=>getComputedStyle(node).color)}
  await page.hover(selector);await sleep(interactionSettleMs)
  colors.hover=await page.$eval(selector,node=>getComputedStyle(node).backgroundColor)
  const box=await page.$eval(selector,node=>{const rect=node.getBoundingClientRect();return{x:rect.left+rect.width/2,y:rect.top+rect.height/2}})
  await page.mouse.move(box.x,box.y);await page.mouse.down();await sleep(interactionSettleMs)
  colors.active=await page.$eval(selector,node=>getComputedStyle(node).backgroundColor)
  await page.mouse.up()
  assert.deepEqual(colors,expectedColors)
  assert.equal(requests.some(url=>/127\.0\.0\.1:517[34]\/api\//.test(url)),false,'Consumer 不应请求管理端 API')
  assert.deepEqual(errors,[])
  console.log(JSON.stringify({status:'passed',url:baseUrl,identity,colors,workspaceRequests:0,consoleErrors:0},null,2))
}finally{
  if(browser)await browser.close()
  await stopChild(vite)
}
