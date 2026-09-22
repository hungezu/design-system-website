// @vitest-environment jsdom
import { cleanup,render,screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach,expect,it,vi } from 'vitest'
import { DSAlert,DSBadge,DSEmpty,DSField,DSLoading } from '../runtime'
afterEach(cleanup)
it('Alert 错误通过 alert 宣告并能触发关闭回调',async()=>{const user=userEvent.setup(),close=vi.fn();render(<DSAlert tone="error" title="提交失败" onClose={close}>保留输入并重试</DSAlert>);expect(screen.getByRole('alert').textContent).toContain('保留输入');await user.click(screen.getByRole('button',{name:'关闭提交失败'}));expect(close).toHaveBeenCalledOnce()})
it.each(['info','success','warning','error'] as const)('Badge %s 保留文字及语义色入口',tone=>{const{container}=render(<DSBadge tone={tone}>当前状态</DSBadge>);expect(container.querySelector(`[data-tone="${tone}"]`)?.textContent).toBe('当前状态')})
it('Empty 主行动执行真实回调',async()=>{const user=userEvent.setup(),create=vi.fn();render(<DSEmpty title="暂无数据" action={<button onClick={create}>创建资源</button>}/>);await user.click(screen.getByRole('button',{name:'创建资源'}));expect(create).toHaveBeenCalledOnce()})
it('Loading 提供不确定进度名称而不伪造百分比',()=>{render(<DSLoading label="读取数据"/>);const progress=screen.getByRole('progressbar',{name:'读取数据'});expect(progress.hasAttribute('aria-valuenow')).toBe(false)})
it('Field 将错误、标签与输入程序化关联',()=>{render(<DSField label="名称" required error="请输入名称">{props=><input {...props}/>}</DSField>);const input=screen.getByRole('textbox',{name:/名称/});expect(input.getAttribute('aria-invalid')).toBe('true');expect(input.getAttribute('aria-describedby')).toBeTruthy();expect(screen.getByText('请输入名称')).toBeTruthy()})
