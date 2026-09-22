import {expect,it} from 'vitest'
import {createReleaseSnapshot} from './release-snapshot'
import {generateProjectDesignMarkdown} from './design-markdown'
import {AI_COMPONENT_IDS} from '../data/ai-components'
import {guokexinProject} from '../data/projects'
import {defaultProjectTheme} from './project-theme'
it('AI APIs and their interaction rules are captured in new project snapshots',()=>{
 const project=guokexinProject
 const snapshot=createReleaseSnapshot({project,theme:defaultProjectTheme(project),version:'9.0.0'})
 const manifest=snapshot.assets['manifest.json'] as {availableComponents:{id:string}[]}
 expect(manifest.availableComponents.filter(item=>AI_COMPONENT_IDS.includes(item.id))).toHaveLength(14)
 const md=generateProjectDesignMarkdown(snapshot,{mode:'project',packageName:'@design-workspace/guokexin',archiveName:'ai-test.tgz'})
 expect(md).toContain('AI 交互组件');expect(md).toContain('onSubmit={onSend}');expect(md).toContain('不自行请求模型')
})
it('old project approvals do not silently acquire an AI usage example',()=>{
 const project={...guokexinProject,componentIds:guokexinProject.componentIds.filter(id=>!AI_COMPONENT_IDS.includes(id))}
 const snapshot=createReleaseSnapshot({project,theme:defaultProjectTheme(project),version:'9.0.0'})
 const md=generateProjectDesignMarkdown(snapshot,{mode:'project',packageName:'@design-workspace/guokexin',archiveName:'ai-test.tgz'})
 expect(md).not.toContain('export function ProjectChat')
})
