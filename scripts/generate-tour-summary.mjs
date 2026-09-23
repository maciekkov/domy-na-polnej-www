import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
const root=resolve(import.meta.dirname,'..')
const folder=resolve(root,'public/assets/data')
const data={}
for(const [mode,name] of [['interior','spacer-360-wewnetrzny'],['exterior','spacer-360-zewnetrzny']]){
 const tour=JSON.parse(readFileSync(resolve(folder,name+'.json'),'utf8'))
 data[mode]={count:tour.scenes.length,sketchCount:tour.scenes.filter(s=>s.sourceType==='sketch'||s.sourceType==='placeholder').length}
}
writeFileSync(resolve(folder,'tour-summary.json'),JSON.stringify(data,null,2)+'\n')
console.log('Tour summary:',data)
