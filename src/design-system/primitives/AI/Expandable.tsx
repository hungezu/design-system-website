import type {ReactNode} from 'react'
import {Disclosure,Heading,Button,DisclosurePanel} from 'react-aria-components'
import {DSIcon} from '../../../runtime/vendor/runtime.js'
export function AIExpandable({title,children,expanded,defaultExpanded=false,onExpandedChange,className=''}:{title:ReactNode;children:ReactNode;expanded?:boolean;defaultExpanded?:boolean;onExpandedChange?:(value:boolean)=>void;className?:string}){
 return <Disclosure className={`ai-disclosure ${className}`} isExpanded={expanded} defaultExpanded={defaultExpanded} onExpandedChange={onExpandedChange}>
  <Heading><Button slot="trigger" className="ai-disclosure-trigger">{title}<span className="ai-disclosure-chevron"><DSIcon name="chevron-down" decorative size="sm"/></span></Button></Heading>
  <DisclosurePanel className="ai-disclosure-content">{children}</DisclosurePanel>
 </Disclosure>
}
