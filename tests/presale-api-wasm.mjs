// Optional runner: PHP_WASM_NODE_MODULES points to an installation of @php-wasm/node and universal.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
const base=process.env.PHP_WASM_NODE_MODULES
if(!base)throw new Error('Set PHP_WASM_NODE_MODULES')
const {PHP}=await import(pathToFileURL(base+'/@php-wasm/universal/index.js'))
const {loadNodeRuntime}=await import(pathToFileURL(base+'/@php-wasm/node/index.js'))
const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:process.pid}}))
for(const dir of ['/www','/www/api','/www/api/lib','/www/data','/private'])php.mkdir(dir)
for(const name of ['presale.php','lib/presale.php','lib/security.php','lib/smtp.php'])php.writeFile('/www/api/'+name,readFileSync('api/'+name))
php.writeFile('/www/api/config.php',"<?php return ['security'=>['allowed_origins'=>['https://domynapolnej.pl'],'storage_dir'=>'/private']];")
php.writeFile('/www/data/site-data.json',JSON.stringify({salesStage:'prelaunch'}))
const results=[]
let peer=1
const payload={email:'test@example.invalid',consent:true,consentVersion:'presale-1.0'}
async function request(name,{data=payload,method='POST',headers={},expected=200,ip}={}){
 const response=await php.run({scriptPath:'/www/api/presale.php',method,relativeUri:'/api/presale.php',headers:{'Content-Type':'application/json','Origin':'https://domynapolnej.pl',...headers},body:new TextEncoder().encode(JSON.stringify(data)),$_SERVER:{REMOTE_ADDR:ip||`192.0.2.${peer++}`}})
 assert.equal(response.httpStatusCode,expected,`${name}: ${response.text}`)
 results.push({name,status:response.httpStatusCode});return response
}
try{
 await request('register')
 assert.equal(php.listFiles('/private/presale').filter(f=>f.endsWith('.json')).length,1)
 await request('duplicate')
 assert.equal(php.listFiles('/private/presale').filter(f=>f.endsWith('.json')).length,1)
 await request('consent required',{data:{email:'new@example.invalid'},expected:422})
 await request('email invalid',{data:{...payload,email:'bad'},expected:422})
 await request('reject cross origin',{headers:{Origin:'https://other.invalid'},expected:403})
 await request('reject GET',{method:'GET',expected:405})
 await request('reject content type',{headers:{'Content-Type':'text/plain'},expected:415})
 await request('honeypot',{data:{...payload,email:'bot@example.invalid',website:'bot'}})
 assert.equal(php.listFiles('/private/presale').filter(f=>f.endsWith('.json')).length,1)
 await request('unsubscribe',{data:{email:payload.email,action:'unsubscribe'}})
 assert.equal(php.listFiles('/private/presale').filter(f=>f.endsWith('.json')).length,0)
 await request('unsubscribe unknown',{data:{email:payload.email,action:'unsubscribe'}})
 php.writeFile('/www/data/site-data.json',JSON.stringify({salesStage:'selling'}))
 await request('selling blocks registration',{expected:409})
 await request('selling still allows unsubscribe',{data:{email:payload.email,action:'unsubscribe'}})
 php.writeFile('/www/data/site-data.json',JSON.stringify({salesStage:'prelaunch'}))
 for(let i=0;i<5;i++)await request('rate allowance '+i,{ip:'192.0.2.240'})
 await request('rate rejection',{ip:'192.0.2.240',expected:429})
 console.log(JSON.stringify(results,null,2))
}finally{php.exit();mkdirSync('docs/rc4',{recursive:true});writeFileSync('docs/rc4/php-api.json',JSON.stringify(results,null,2))}
