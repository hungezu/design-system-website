import {mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {createWorkspace} from '../server/workspace'
const root=resolve('artifacts/sizing-acceptance'),temp=mkdtempSync(join(tmpdir(),'sizing-delivery-'))
const workspace=createWorkspace({dbPath:join(temp,'workspace.sqlite'),bootstrapToken:'sizing-acceptance'})
await new Promise<void>(done=>workspace.server.listen(0,'127.0.0.1',done));const origin=`http://127.0.0.1:${(workspace.server.address() as {port:number}).port}`;let cookie=''
const request=async(path:string,method='GET',body?:unknown)=>{const r=await fetch(origin+'/api'+path,{method,headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json','X-Workspace-Request':'1'},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie')!.split(';')[0];const data=await r.json();if(!r.ok)throw new Error(JSON.stringify(data));return data}
try{
 await request('/auth/setup','POST',{token:'sizing-acceptance',email:'sizing@example.test',name:'尺寸验收',password:'Sizing-test-password!'})
 await request('/admin/projects','POST',{id:'sizing-lab',name:'分层尺寸验收'})
 const current=await request('/projects/sizing-lab/theme')
 await request('/projects/sizing-lab/theme','PUT',{...current,theme:{...current.theme,density:'comfortable',sizing:{version:1,overrides:{heightMd:36,inputPadding:18,selectStartPadding:20,popupPadding:32,buttonPadding:22}}}})
 await request('/projects/sizing-lab/releases','POST',{version:'1.0.0',note:'隔离尺寸交付验收'})
 await request('/projects/sizing-lab/deliveries/1.0.0','POST',{});await workspace.deliveries.idle()
 const result=await request('/projects/sizing-lab/deliveries/1.0.0');if(result.status!=='ready')throw new Error(JSON.stringify(result))
 const tokens=await request('/projects/sizing-lab/releases/1.0.0/tokens.json')
 for(const [name,value]of Object.entries({'--control-height-md':'36px','--input-padding-inline':'18px','--popup-padding':'32px','--button-padding-inline':'22px'}))if(tokens[name]!==value)throw new Error(`Incorrect ${name}`)
 mkdirSync(root,{recursive:true});cpSync(join(temp,'deliveries/sizing-lab/1.0.0/ready',result.artifact.archiveName),join(root,result.artifact.archiveName))
 writeFileSync(join(root,'verification.json'),JSON.stringify({scope:'synthetic sizing project',artifact:result.artifact,expected:tokens},null,2))
 await workspace.close();cpSync(join(temp,'workspace.sqlite'),join(root,'workspace.sqlite'));cpSync(join(temp,'deliveries'),join(root,'deliveries'),{recursive:true})
 const consumer=join(root,'consumer');mkdirSync(consumer,{recursive:true})
 writeFileSync(join(consumer,'package.json'),JSON.stringify({name:'sizing-consumer',private:true,type:'module',scripts:{build:'tsc --noEmit && vite build',dev:'vite --force --host 127.0.0.1 --port 4188 --strictPort'},dependencies:{'@design-workspace/sizing-lab':`file:../${result.artifact.archiveName}`,react:'19.2.8','react-dom':'19.2.8'},devDependencies:{vite:'7.3.6',typescript:'5.9.3','@types/react':'19.2.18','@types/react-dom':'19.2.7'}},null,2))
 writeFileSync(join(consumer,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2022',module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,skipLibCheck:true,noEmit:true,lib:['ES2022','DOM']},include:['*.tsx']}))
 writeFileSync(join(consumer,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>分层尺寸交付验收</title><div id="root"></div><script type="module" src="/main.tsx"></script></html>')
 writeFileSync(join(consumer,'main.tsx'),`import {useState} from 'react';import{createRoot}from'react-dom/client';import{ProjectTheme,DSButton,DSInput,DSSelect,DSDialog,PROJECT_RELEASE}from'@design-workspace/sizing-lab';import'@design-workspace/sizing-lab/style.css';function App(){const[open,setOpen]=useState(false);return <ProjectTheme><main style={{maxWidth:700,margin:'32px auto',padding:24}}><h1>分层尺寸交付验收</h1><p>隔离项目 / {PROJECT_RELEASE.releaseVersion}</p><DSButton variant="primary" onClick={()=>setOpen(true)}>打开边距预览</DSButton><DSInput label="输入框" placeholder="左右内边距 18px"/><DSSelect label="选择器" options={[{value:'a',label:'选项 A'}]}/><DSDialog title="弹层边距验收" open={open} onOpenChange={setOpen}><p>桌面内边距 32px；窄屏跟随 16px</p><DSButton onClick={()=>setOpen(false)}>关闭预览</DSButton></DSDialog></main></ProjectTheme>}createRoot(document.getElementById('root')!).render(<App/>);`)
 console.log('Sizing snapshot, package and reference consumer prepared: '+result.artifact.archiveName)
}finally{if(workspace.server.listening)await workspace.close();rmSync(temp,{recursive:true,force:true})}
