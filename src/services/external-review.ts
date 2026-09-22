/** Optional host adapter. No credentials are stored in the browser and no requests run until invoked. */
export interface ExternalReviewInput { projectId:string; version:string; source:string; allowedComponents:string[] }
export interface ExternalReviewResult { summary:string; findings:Array<{rule:string;evidence:string;line?:number}> }
export function createExternalReviewAdapter(endpoint:string,request:typeof fetch=fetch){
 const url=new URL(endpoint,typeof location==='undefined'?'http://127.0.0.1':location.origin)
 const local=['127.0.0.1','localhost','[::1]'].includes(url.hostname)
 if(!local&&(typeof location==='undefined'||url.origin!==location.origin))throw new Error('评审代理必须位于同源或本地服务，凭据由服务端持有。')
 return async(input:ExternalReviewInput,signal?:AbortSignal):Promise<ExternalReviewResult>=>{
  const response=await request(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal})
  if(!response.ok)throw new Error(`评审服务失败：HTTP ${response.status}`)
  const data:unknown=await response.json()
  if(!data||typeof data!=='object'||!('summary'in data)||typeof data.summary!=='string'||!('findings'in data)||!Array.isArray(data.findings)||data.findings.some(row=>!row||typeof row.rule!=='string'||typeof row.evidence!=='string'))throw new Error('评审服务响应格式无效。')
  return data as ExternalReviewResult
 }
}
