// @vitest-environment jsdom
import { cleanup,render,screen,within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach,beforeAll,expect,it,vi} from 'vitest'
import {PatternExample} from './catalog'
import {patternPresets} from './pattern-presets'
beforeAll(()=>{vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}})})
afterEach(cleanup)
it.each(Object.entries(patternPresets).flatMap(([id,items])=>items.map(item=>[id,item.id])))('%s / %s 存在独立业务情形', (patternId,initialScenario)=>{const{container}=render(<PatternExample patternId={patternId} initialScenario={initialScenario}/>);expect(container.querySelector('.resource-workflow')).not.toBeNull();expect(screen.queryByText('模式情形不可用')).toBeNull()})
it('批量归档需要确认，取消保留数据，部分失败保留依赖项',async()=>{
 const user=userEvent.setup();render(<PatternExample patternId="pattern-bulk-actions" initialScenario="partial"/>);await user.click(screen.getByRole('button',{name:'归档所选资源'}));await user.click(screen.getByRole('button',{name:'取消归档'}));expect(screen.getByRole('cell',{name:'政策数据库'})).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'归档所选资源'}));await user.click(screen.getByRole('button',{name:'确认归档 4 项'}));expect(await screen.findByText('已归档 3 项；历史映射存在依赖，未归档。',{selector:'.resource-workflow > p[role="status"]'})).toBeTruthy();expect(screen.getByRole('cell',{name:'历史映射'})).toBeTruthy();expect(screen.queryByRole('cell',{name:'政策数据库'})).toBeNull()
})
it('失效筛选、局部加载和页面错误都可以恢复',async()=>{
 const user=userEvent.setup();const{rerender}=render(<PatternExample patternId="pattern-advanced-filter" initialScenario="invalid"/>);await user.click(screen.getByRole('button',{name:'清除失效条件'}));expect(screen.getByRole('table')).toBeTruthy()
 rerender(<PatternExample key="load" patternId="pattern-loading" initialScenario="table"/>);expect(screen.queryByRole('cell',{name:'政策数据库'})).toBeNull();await user.click(screen.getByRole('button',{name:'完成局部加载演示'}));expect(screen.getByRole('cell',{name:'政策数据库'})).toBeTruthy()
 rerender(<PatternExample key="error" patternId="pattern-error" initialScenario="page"/>);await user.click(screen.getByRole('button',{name:'重新加载页面演示'}));expect(screen.getByRole('table')).toBeTruthy()
})
it('删除撤销恢复原位置，返回列表可直接看到恢复对象',async()=>{
 const user=userEvent.setup();render(<PatternExample patternId="pattern-delete-confirmation"/>);await user.click(screen.getByRole('button',{name:'删除当前资源'}));await user.click(within(screen.getByRole('dialog',{name:'删除资源'})).getByRole('button',{name:'确认删除'}));expect(screen.queryByRole('cell',{name:'政策数据库'})).toBeNull();await user.click(screen.getByRole('button',{name:'撤销删除'}));expect(screen.getByRole('cell',{name:'政策数据库'})).toBeTruthy()
})
it('选择业务情形会报告实际配置，未知情形不会伪装成默认',async()=>{
 const changed=vi.fn(),user=userEvent.setup();const{rerender}=render(<PatternExample patternId="pattern-empty-state" onScenarioChange={changed}/>);await user.click(screen.getByRole('button',{name:/业务情形/}));await user.click(screen.getByRole('option',{name:'筛选为空'}));expect(changed).toHaveBeenLastCalledWith('no-results');expect(screen.getByText('没有匹配资源')).toBeTruthy()
 rerender(<PatternExample key="bad" patternId="pattern-empty-state" initialScenario="bad"/>);expect(screen.getByText('模式情形不可用')).toBeTruthy()
})
