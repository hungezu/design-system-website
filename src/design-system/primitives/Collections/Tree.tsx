import { Tree, TreeItem, TreeItemContent, Button } from 'react-aria-components'
import type { ComponentProps } from 'react'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
export interface DSTreeNode { id:string; label:string; children?:DSTreeNode[] }
export interface DSTreeProps { label:string; items:DSTreeNode[]; selectionMode?:'none'|'single'|'multiple'; onSelectionChange?:ComponentProps<typeof Tree>['onSelectionChange'] }
function item(node:DSTreeNode):React.ReactElement { return <TreeItem id={node.id} key={node.id} textValue={node.label} className="owned-tree__item"><TreeItemContent>{({hasChildItems,isExpanded})=><span className="owned-tree__content">{hasChildItems && <Button slot="chevron" aria-label={`${isExpanded?'收起':'展开'}${node.label}`}><DSIcon name="chevron-right" className={isExpanded?'is-expanded':''} size="sm" decorative /></Button>}<span>{node.label}</span></span>}</TreeItemContent>{node.children?.map(item)}</TreeItem> }
export function DSTree({label,items,...props}:DSTreeProps) { return <Tree {...props} aria-label={label} className="owned-tree owned-listbox">{items.map(item)}</Tree> }
