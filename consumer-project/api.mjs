import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { dirname } from 'node:path'
const initial = [{id:'policy',name:'政策数据库',owner:'内容运营',revision:0},{id:'experts',name:'专家信息库',owner:'研究中心',revision:0},{id:'topic',name:'专题配置',owner:'内容运营',revision:0}]
export function createResourceApi({dataFile,appOrigin='http://127.0.0.1:4186'}) {
  mkdirSync(dirname(dataFile),{recursive:true})
  if(!existsSync(dataFile))writeFileSync(dataFile,JSON.stringify(initial))
  const read=()=>JSON.parse(readFileSync(dataFile,'utf8'))
  const server=createServer(async(req,res)=>{
    const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value))}
    try{
      const url=new URL(req.url,'http://reference.local')
      if(req.method==='GET'&&url.pathname==='/api/resources'){
        const query=(url.searchParams.get('query')??'').trim().slice(0,100)
        return send(200,{items:read().filter(item=>item.name.includes(query))})
      }
      const match=url.pathname.match(/^\/api\/resources\/([a-z-]+)$/)
      if(req.method==='PUT'&&match){
        const address=server.address(),origin=`http://127.0.0.1:${address.port}`
        if(![origin,appOrigin].includes(req.headers.origin)||req.headers['x-resource-request']!=='1')return send(403,{error:'请求来源无效。'})
        if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'需要 JSON 请求。'})
        let text='';for await(const chunk of req){text+=chunk;if(text.length>10000)return send(413,{error:'请求过大。'})}
        let body;try{body=JSON.parse(text)}catch{return send(400,{error:'JSON 格式无效。'})}
        const name=typeof body.name==='string'?body.name.trim():''
        if(!name||name.length>80)return send(422,{error:'资源名称需为 1–80 个字符。'})
        const items=read(),item=items.find(item=>item.id===match[1])
        if(!item)return send(404,{error:'资源不存在。'})
        if(items.some(other=>other.id!==item.id&&other.name===name))return send(409,{error:'资源名称已存在，请使用其他名称。'})
        if(body.revision!==item.revision)return send(409,{error:'资源已被更新，请重新载入后编辑。'})
        item.name=name;item.revision++
        writeFileSync(dataFile+'.tmp',JSON.stringify(items));renameSync(dataFile+'.tmp',dataFile)
        return send(200,item)
      }
      send(404,{error:'接口不存在。'})
    }catch{send(500,{error:'读取或保存失败，原输入仍保留，请重试。'})}
  })
  return server
}
