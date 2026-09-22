import ts from 'typescript'
import fs from 'node:fs'
const configPath=ts.findConfigFile('.',ts.sys.fileExists,'tsconfig.app.json')!
const config=ts.readConfigFile(configPath,ts.sys.readFile)
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,'.')
const program=ts.createProgram(parsed.fileNames,parsed.options)
const checker=program.getTypeChecker()
const file=program.getSourceFile('src/runtime/index.ts')!
const symbol=checker.getSymbolAtLocation(file)!
const result:Record<string,unknown>={}
for(const exported of checker.getExportsOfModule(symbol)){
 if(!/^DS[A-Z]/.test(exported.name))continue
 const type=checker.getTypeOfSymbolAtLocation(exported,file)
 const signature=type.getCallSignatures()[0]
 if(!signature)continue
 const param=signature.parameters[0];if(!param)continue
 const propType=checker.getTypeOfSymbolAtLocation(param,file)
 const props=propType.getProperties().filter(p=>{
  if (/^(aria-|data-)/.test(p.name)) return false
  if (!/^on[A-Z]/.test(p.name) || p.name === 'onClick') return true
  // Retain every event declared by our public API. Only omit inherited DOM noise.
  return (p.declarations ?? []).some(declaration => !declaration.getSourceFile().fileName.includes('node_modules'))
 }).map(p=>({name:p.name,type:checker.typeToString(checker.getTypeOfSymbolAtLocation(p,file),undefined,ts.TypeFormatFlags.NoTruncation),required:!(p.flags&ts.SymbolFlags.Optional)}))
 result[exported.name]=props
}
fs.mkdirSync('src/data/generated',{recursive:true})
fs.writeFileSync('src/data/generated/runtime-api.json',JSON.stringify(result,null,2)+'\n')
console.log(`Generated API for ${Object.keys(result).length} runtime components`)
