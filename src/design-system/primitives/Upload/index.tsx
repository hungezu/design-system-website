import { useId, useState } from 'react'
import { FileTrigger } from 'react-aria-components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import { Button } from '../Button'
import './Upload.css'
export interface DSUploadProps { label:string; accept?:string; multiple?:boolean; disabled?:boolean; loading?:boolean; error?:string; maxBytes?:number; onFiles:(files:File[])=>void; onError?:(message:string)=>void }
export function DSUpload({label,accept,multiple,disabled,loading,error,maxBytes,onFiles,onError}:DSUploadProps) {
 const id=useId(); const [localError,setLocalError]=useState('')
 const handle=(files:File[])=>{const invalid=maxBytes&&files.find(file=>file.size>maxBytes);if(invalid){const message=`文件 ${invalid.name} 超过大小限制`;setLocalError(message);onError?.(message);return}setLocalError('');onFiles(files)}
 return <div className="owned-upload"><span className="owned-field-label" id={`${id}-label`}>{label}</span><FileTrigger acceptedFileTypes={accept?.split(',').map(x=>x.trim()).filter(Boolean)} allowsMultiple={multiple} onSelect={files=>{if(files)handle(Array.from(files))}}><Button disabled={disabled||loading} loading={loading} icon={<DSIcon name="upload" size="sm" decorative />} aria-label={`选择${label}`} aria-describedby={error||localError?`${id}-error`:undefined}>{loading?'处理中':'选择文件'}</Button></FileTrigger>{(error||localError)&&<div className="owned-upload__error" id={`${id}-error`} role="alert"><DSIcon name="error" weight="filled" size="sm" decorative /><span>{error||localError}</span></div>}</div>
}
