import { expect,it } from 'vitest'
import { assertReleaseContext } from './release-context'
it('空文件和 HTML 回退不能伪装为已冻结基线',()=>{const m={projectId:'p',releaseVersion:'1.0.0'};expect(()=>assertReleaseContext('',m,'p','1.0.0')).toThrow('Token');expect(()=>assertReleaseContext('<html>not found</html>',m,'p','1.0.0')).toThrow('Token')})
it('拒绝来自另一项目或版本的 Manifest',()=>{expect(()=>assertReleaseContext('--brand-primary: #123456;',{projectId:'other',releaseVersion:'1.0.0'},'p','1.0.0')).toThrow('不一致')})
