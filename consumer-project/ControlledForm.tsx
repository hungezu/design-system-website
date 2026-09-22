import { DSInput, DSButton, DSAlert, ProjectTheme } from '@design-workspace/guokexin'
export function ControlledForm({name,error,saving,onChange,onSave}:{name:string;error?:string;saving:boolean;onChange:(value:string)=>void;onSave:()=>void}) {
 return <ProjectTheme><form onSubmit={event=>{event.preventDefault();if(!saving)onSave()}}><DSInput label="资源名称" value={name} onChange={onChange} required invalid={!!error} errorMessage={error}/>{error&&<DSAlert title="保存失败">{error}</DSAlert>}<DSButton type="submit" variant="primary" loading={saving}>保存</DSButton></form></ProjectTheme>
}
