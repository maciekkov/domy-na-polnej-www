import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { walk, root } from '../scripts/asset-inventory.mjs'
const require=createRequire(import.meta.url)
let ts
ts=require('../vendor/typescript.cjs')
let modules=0, scripts=0
for (const file of [...walk(join(root,'src')),join(root,'vite.config.ts')]) {
  if (!/\.tsx?$/.test(file) || file.endsWith('.d.ts')) continue
  const result=ts.transpileModule(readFileSync(file,'utf8'), {
    fileName:file, reportDiagnostics:true,
    compilerOptions:{ target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,isolatedModules:true },
  })
  const errors=(result.diagnostics || []).filter(item=>item.category===ts.DiagnosticCategory.Error)
  if(errors.length)throw new Error(ts.formatDiagnosticsWithColorAndContext(errors,{getCurrentDirectory:()=>root,getCanonicalFileName:x=>x,getNewLine:()=> '\n'}))
  modules++
}
for (const file of [...walk(join(root,'public/tour')),...walk(join(root,'scripts')),...walk(join(root,'src'))]) {
  if (!/\.(js|mjs)$/.test(file))continue
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});scripts++
}
console.log(`PASS składnia: ${modules} modułów TS/TSX (TypeScript ${ts.version}), ${scripts} plików JS/MJS. To kontrola składni, nie pełny typecheck/build.`)
