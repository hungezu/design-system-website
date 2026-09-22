// @vitest-environment jsdom
import {useState} from 'react'
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach,beforeAll,expect,it,vi} from 'vitest'
import {DSPromptInput,DSChatTool,DSChatConversation,DSMarkdown,DSCodeBlock,DSChatSource,DSChainOfThought} from './index'
import {AIExample} from '../../../components/AIExample'
import {AI_COMPONENTS} from '../../../data/ai-components'
beforeAll(()=>{vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}})})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
it('all AI previews and declared variants render without placeholder exports',()=>{
 for(const item of AI_COMPONENTS)for(const [variant] of item.variants){const view=render(<AIExample id={item.id} variant={variant}/>);expect(view.container.querySelector('.ai-example')).toBeTruthy();expect(view.container.textContent).not.toContain('尚未实现');view.unmount()}
})
it('prompt keeps failed input, ignores composition Enter, allows newline and clears only after success',async()=>{
 const submit=vi.fn().mockRejectedValueOnce(new Error('请求失败')).mockResolvedValue(undefined)
 function Harness(){const[value,setValue]=useState('');return <DSPromptInput value={value} onChange={setValue} onSubmit={submit}/>}
 const user=userEvent.setup();render(<Harness/>);const input=screen.getByRole('textbox') as HTMLTextAreaElement
 expect((screen.getByRole('button',{name:'发送消息'}) as HTMLButtonElement).disabled).toBe(true)
 await user.type(input,'检查设计')
 fireEvent.compositionStart(input);fireEvent.keyDown(input,{key:'Enter'});expect(submit).not.toHaveBeenCalled();fireEvent.compositionEnd(input)
 fireEvent.keyDown(input,{key:'Enter',keyCode:229});expect(submit).not.toHaveBeenCalled()
 await user.keyboard('{Shift>}{Enter}{/Shift}');expect(input.value).toContain('\n');expect(submit).not.toHaveBeenCalled()
 await user.click(screen.getByRole('button',{name:'发送消息'}));expect(await screen.findByRole('alert')).toHaveProperty('textContent','请求失败');expect(input.value).toContain('检查设计')
 await user.click(screen.getByRole('button',{name:'发送消息'}));expect(submit).toHaveBeenCalledTimes(2);expect(input.value).toBe('')
})
it('prompt prevents duplicate sends and streaming exposes the stop action',async()=>{
 let finish!:()=>void;const submit=vi.fn(()=>new Promise<void>(resolve=>{finish=resolve}))
 const {rerender}=render(<DSPromptInput value="你好" onChange={()=>{}} onSubmit={submit}/>)
 const form=screen.getByRole('form',{name:'AI 消息输入'});act(()=>{fireEvent.submit(form);fireEvent.submit(form)})
 expect(submit).toHaveBeenCalledTimes(1);await act(async()=>finish())
 const stop=vi.fn();rerender(<DSPromptInput value="" onChange={()=>{}} onSubmit={submit} status="streaming" onStop={stop}/>)
 expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(true)
 await userEvent.setup().click(screen.getByRole('button',{name:'停止生成'}));expect(stop).toHaveBeenCalledOnce()
})
it('tool approvals wait for explicit action, lock duplicate requests and expose failure',async()=>{
 let fail!:(error:Error)=>void;const approve=vi.fn(()=>new Promise<void>((_,reject)=>{fail=reject}))
 render(<DSChatTool name="写入示例" state="approval" input={{id:1}} onApprove={approve} onReject={()=>{}}/>)
 expect(approve).not.toHaveBeenCalled();const button=screen.getByRole('button',{name:'确认执行'})
 act(()=>{fireEvent.click(button);fireEvent.click(button)});expect(approve).toHaveBeenCalledOnce();expect((screen.getByRole('button',{name:'拒绝'}) as HTMLButtonElement).disabled).toBe(true)
 await act(async()=>fail(new Error('没有完成')));expect(await screen.findByRole('alert')).toHaveProperty('textContent','没有完成');expect((button as HTMLButtonElement).disabled).toBe(false)
})
it('markdown and code never execute raw HTML or unsafe links; copy reports actual result',async()=>{
 const user=userEvent.setup();const write=vi.fn().mockRejectedValueOnce(new Error('clipboard')).mockResolvedValue(undefined)
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:write}})
 const source='<script>alert(1)</script>'
 const {container}=render(<><DSMarkdown content={'<img src=x onerror=alert(1)>\n\n[bad](javascript:alert(1))\n\n[正常](https://example.com)'}/><DSCodeBlock code={source} language="xml"/></>)
 expect(container.querySelector('script,img,a[href^="javascript:"]')).toBeNull();expect(screen.getByRole('link',{name:'正常'}).getAttribute('rel')).toContain('noopener')
 await user.click(screen.getByRole('button',{name:'复制代码'}));expect(await screen.findByRole('status')).toHaveProperty('textContent','复制失败，请手动选择内容。')
 await user.click(screen.getByRole('button',{name:'复制代码'}));expect(await screen.findByRole('status')).toHaveProperty('textContent','已复制');expect(write).toHaveBeenLastCalledWith(source)
})
it('conversation preserves historical reading position until jump-to-latest is requested',async()=>{
 const {rerender}=render(<DSChatConversation><p>第一条</p></DSChatConversation>)
 const log=screen.getByRole('log');let scrollHeight=1000
 Object.defineProperties(log,{clientHeight:{get:()=>200},scrollHeight:{get:()=>scrollHeight}})
 log.scrollTop=100;fireEvent.scroll(log)
 expect(screen.getByRole('button',{name:'回到最新消息'})).toBeTruthy()
 scrollHeight=1200;rerender(<DSChatConversation><p>第一条</p><p>新增内容</p></DSChatConversation>);expect(log.scrollTop).toBe(100)
 await userEvent.setup().click(screen.getByRole('button',{name:'回到最新消息'}));expect(log.scrollTop).toBeGreaterThan(100);expect(screen.queryByRole('button',{name:'回到最新消息'})).toBeNull()
})
it('attachment previews revoke local URLs and reject oversized or disallowed drops',async()=>{
 const create=vi.fn(()=> 'blob:preview'),revoke=vi.fn();Object.defineProperties(URL,{createObjectURL:{configurable:true,value:create},revokeObjectURL:{configurable:true,value:revoke}})
 const image=new File(['image'],'photo.png',{type:'image/png'});const user=userEvent.setup()
 function Harness(){const[files,setFiles]=useState([image]);return <DSPromptInput value="" onChange={()=>{}} onSubmit={()=>{}} files={files} onFilesChange={setFiles} accept="image/*" maxFileSize={8}/>}
 render(<Harness/>);expect(create).toHaveBeenCalledWith(image)
 await user.click(screen.getByRole('button',{name:'移除 photo.png'}));expect(revoke).toHaveBeenCalledWith('blob:preview')
 fireEvent.drop(screen.getByRole('form'),{dataTransfer:{files:[new File(['pdf'],'a.pdf',{type:'application/pdf'})]}})
 expect(screen.getByRole('alert').textContent).toContain('类型不支持')
 fireEvent.drop(screen.getByRole('form'),{dataTransfer:{files:[new File(['more than eight bytes'],'a.png',{type:'image/png'})]}})
 expect(screen.getByRole('alert').textContent).toContain('不能超过')
})
it('trace and sources disclosures operate through keyboard and use safe destinations',async()=>{
 const user=userEvent.setup();render(<><DSChainOfThought title="执行步骤" steps={[{id:'one',title:'已读取',description:'公开进度摘要',status:'success'}]}/><DSChatSource sources={[{id:'bad',title:'无效来源',href:'javascript:alert(1)'},{id:'good',title:'组件文档',href:'/components'}]} collapsible/></>)
 const trigger=screen.getByRole('button',{name:'执行步骤'});trigger.focus();await user.keyboard('{Enter}')
 expect(trigger.getAttribute('aria-expanded')).toBe('true');expect(screen.getByText('公开进度摘要')).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'2 个来源'}));expect(screen.queryByRole('link',{name:/无效来源/})).toBeNull();expect(screen.getByRole('link',{name:/组件文档/}).getAttribute('href')).toBe('/components')
})
