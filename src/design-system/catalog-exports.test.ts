import { it, expect } from 'vitest'
import { COMPONENT_CATALOG } from './component-catalog'
import * as runtime from '../runtime'
it('所有已登记的桌面组件有可解析的 Runtime 导出',()=>{
 const missing=COMPONENT_CATALOG.filter(item=>!Object.hasOwn(runtime,item.runtimeExport)).map(x=>x.runtimeExport)
 expect(missing).toEqual([])
})
