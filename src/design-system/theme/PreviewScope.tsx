import { useContext, type CSSProperties, type ReactNode, type ComponentProps } from 'react'
import { Popover } from 'react-aria-components'
import { PreviewContext, PreviewOwnerContext } from './preview-context'
/** Explicit per-instance overrides travel through React portals; no root mutation. */
export function PreviewScope({vars,children,inspectionId}:{vars:CSSProperties;children:ReactNode;inspectionId?:string}) {
 const parent=useContext(PreviewContext)
 const parentOwner=useContext(PreviewOwnerContext)
 const owner=inspectionId??parentOwner
 const merged={...parent,...vars}
 return <PreviewContext.Provider value={merged}><PreviewOwnerContext.Provider value={owner}><div style={{fontFamily:'var(--preview-font-family, var(--bds-font, inherit))',fontSize:'var(--preview-body-size, inherit)',color:'var(--text-primary, inherit)',...merged}} data-preview-owner={owner}>{children}</div></PreviewOwnerContext.Provider></PreviewContext.Provider>
}
export function ScopedPopover({style,...props}:ComponentProps<typeof Popover>) {
 const vars=useContext(PreviewContext)
 const owner=useContext(PreviewOwnerContext)
 return <Popover data-preview-owner={owner} {...props} style={state=>({...vars,...(typeof style==='function'?style(state):style)})}/>
}
