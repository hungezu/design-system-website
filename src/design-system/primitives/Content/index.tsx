import { useState, type ReactNode, type HTMLAttributes, type CSSProperties } from 'react'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import { DSIconAction } from '../IconAction'
import './Content.css'
export interface DSCardProps extends HTMLAttributes<HTMLElement> { title?:string }
export function DSCard({title,children,className='',...props}:DSCardProps) { return <section {...props} className={`owned-card ${className}`}>{title && <h3>{title}</h3>}{children}</section> }
export interface DSStackProps extends HTMLAttributes<HTMLDivElement> { gap?:string; direction?:'row'|'column'; align?:CSSProperties['alignItems'] }
export function DSStack({gap='var(--bds-space-lg, 16px)',direction='column',align,style,className='',...props}:DSStackProps) { return <div {...props} className={`owned-stack ${className}`} style={{display:'flex',flexDirection:direction,gap,alignItems:align,...style}} /> }
export function DSSpace(props:DSStackProps) { return <DSStack direction="row" {...props} /> }
export interface DSGridProps extends HTMLAttributes<HTMLDivElement> { columns?:number; gap?:string }
export function DSGrid({columns=2,gap='var(--bds-space-lg, 16px)',style,className='',...props}:DSGridProps) { return <div {...props} className={`owned-grid ${className}`} style={{display:'grid',gridTemplateColumns:`repeat(${Math.max(1,columns)}, minmax(0,1fr))`,gap,...style}} /> }
export function DSPageContainer({style,className='',...props}:HTMLAttributes<HTMLDivElement>) { return <div {...props} className={`owned-page-container ${className}`} style={{maxWidth:'var(--ds-page-max-width, 1200px)',marginInline:'auto',padding:'var(--bds-space-xl, 24px)',...style}} /> }
export function DSSurface({className='',...props}:HTMLAttributes<HTMLDivElement>) { return <div {...props} className={`owned-surface ${className}`} /> }
export function DSKbd(props:HTMLAttributes<HTMLElement>) { return <kbd {...props} className="owned-kbd" /> }
export interface DSAvatarProps { src?:string; name:string; size?:number }
export function DSAvatar({src,name,size=32}:DSAvatarProps) {
 return <span className="owned-avatar" role="img" aria-label={name.trim()||'用户头像'} style={{width:size,height:size}}><AvatarContent key={src??''} src={src} name={name}/></span>
}
function AvatarContent({src,name}:Pick<DSAvatarProps,'src'|'name'>) {
 const [failed,setFailed]=useState(false)
 return src&&!failed?<img src={src} alt="" onError={()=>setFailed(true)}/>:<>{Array.from(name.trim())[0]??<DSIcon name="user" size="sm" decorative/>}</>
}
export interface DSDescriptionsProps { label:string; items:{label:string; value:ReactNode}[] }
export function DSDescriptions({label,items}:DSDescriptionsProps) { return <dl aria-label={label} className="owned-descriptions">{items.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl> }
export interface DSFileListProps { files:{id:string; name:string; size?:number}[]; onRemove?:(id:string)=>void }
export function DSFileList({files,onRemove}:DSFileListProps) { return <ul className="owned-files">{files.map(file=><li key={file.id}><DSIcon className="owned-files__icon" name="file-text" size="sm" decorative /><span className="owned-files__content"><strong>{file.name}</strong>{file.size !== undefined && <small>{file.size < 1024 ? `${file.size} B` : `${(file.size/1024).toFixed(1)} KB`}</small>}</span>{onRemove && <DSIconAction semantic="remove-item" iconWeight="filled" compact onPress={()=>onRemove(file.id)} aria-label={`移除${file.name}`} />}</li>)}</ul> }
export function DSSkeleton({label='加载中',...props}:HTMLAttributes<HTMLDivElement>&{label?:string}) { return <div {...props} className="owned-skeleton" role="status" aria-label={label} /> }
export function DSScrollShadow({style,className='',...props}:HTMLAttributes<HTMLDivElement>) { return <div {...props} tabIndex={props.tabIndex??0} className={`owned-scroll-shadow ${className}`} style={{overflow:'auto',maxHeight:'var(--ds-scroll-height, 200px)',...style}} /> }
