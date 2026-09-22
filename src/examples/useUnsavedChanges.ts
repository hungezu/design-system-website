import { useEffect } from 'react'
/** Works in the host application and the standalone consumer without a router dependency. */
export function useUnsavedChanges(enabled:boolean) {
 useEffect(()=>{
  if(!enabled)return
  const beforeUnload=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''}
  const beforeLink=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
   const link=(event.target as Element|null)?.closest('a[href]') as HTMLAnchorElement|null
   if(!link||link.target==='_blank'||link.hasAttribute('download'))return
   const target=new URL(link.href,location.href)
   if(target.origin===location.origin&&target.pathname===location.pathname&&target.search===location.search)return
   if(!window.confirm('当前编辑尚未保存，确定离开并放弃修改吗？')){event.preventDefault();event.stopPropagation()}
  }
  const currentIndex=window.history.state?.idx
  const beforeTraversal=(event:PopStateEvent)=>{const nextIndex=event.state?.idx;if(typeof currentIndex==='number'&&typeof nextIndex==='number'&&nextIndex!==currentIndex&&!window.confirm('当前编辑尚未保存，确定离开并放弃修改吗？')){event.stopImmediatePropagation();window.history.go(currentIndex-nextIndex)}}
  window.addEventListener('popstate',beforeTraversal,true)
  window.addEventListener('beforeunload',beforeUnload)
  document.addEventListener('click',beforeLink,true)
  return()=>{window.removeEventListener('popstate',beforeTraversal,true);window.removeEventListener('beforeunload',beforeUnload);document.removeEventListener('click',beforeLink,true)}
 },[enabled])
}
