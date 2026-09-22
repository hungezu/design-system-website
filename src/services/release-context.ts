import { resolveReleaseThemeFromCss } from './theme-resolver'
/** Reject empty files, HTML fallbacks and a manifest belonging to another context. */
export function assertReleaseContext(css:unknown,manifest:unknown,projectId:string,version:string):asserts css is string {
 if(typeof css!=='string')throw new Error('冻结 Token CSS 格式无效。')
 if(!manifest||typeof manifest!=='object'||!('projectId'in manifest)||manifest.projectId!==projectId||!('releaseVersion'in manifest)||manifest.releaseVersion!==version)throw new Error('冻结文件与当前项目或版本不一致。')
 resolveReleaseThemeFromCss(css)
}
