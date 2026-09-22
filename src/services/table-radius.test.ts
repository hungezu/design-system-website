import { expect, it } from 'vitest'
import { baselineThemeSettings, projectPreviewVariables } from './project-theme'
import { checkTheme } from './workspace-backup'
import { createReleaseSnapshot } from './release-snapshot'
import { guokexinProject } from '../data/projects'
import { generateProjectDesignMarkdown } from './design-markdown'

it('兼容旧主题，校验圆角边界并将独立表格圆角冻结到交付规范', () => {
 const legacy = {...baselineThemeSettings}
 delete legacy.tableRadius
 expect(()=>checkTheme(legacy)).not.toThrow()
 expect(projectPreviewVariables(legacy)['--radius-table']).toBe('6px')
 for(const tableRadius of [-1,25,NaN,'12']) expect(()=>checkTheme({...baselineThemeSettings,tableRadius})).toThrow()
 const snapshot=createReleaseSnapshot({project:guokexinProject,theme:{...baselineThemeSettings,tableRadius:12},version:'9.0.0',status:'candidate',note:'test'})
 expect(snapshot.assets['tokens.json']).toHaveProperty('--radius-table','12px')
 expect(snapshot.assets['tokens.json']).toHaveProperty('--bds-table-radius','12px')
 const md=generateProjectDesignMarkdown(snapshot,{packageName:'@local/design-system',archiveName:'test.tgz',mode:'candidate'})
 expect(md).toContain('| `--radius-table` | 12px |')
})
