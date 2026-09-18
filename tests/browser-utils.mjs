import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { root } from '../scripts/asset-inventory.mjs'
export async function startServer(script='preview-server.mjs',port=4173,args=[],env={}) {
  const child=spawn(process.execPath,[script,...args],{cwd:root,stdio:'pipe',env:{...process.env,...env,PORT:String(port)}})
  let log='';child.stderr.on('data',chunk=>{log+=chunk});child.stdout.on('data',chunk=>{log+=chunk})
  const url=`http://127.0.0.1:${port}`
  for(let i=0;i<100;i++){
    if(child.exitCode!==null)throw new Error(log || 'Serwer nie wystartował')
    try{if((await fetch(url,{signal:AbortSignal.timeout(300)})).ok)return {child,url}}catch{}
    await new Promise(resolve=>setTimeout(resolve,150))
  }
  child.kill();throw new Error(log || 'Timeout serwera')
}
export async function browser() {
  const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)
  return chromium.launch({headless:true,executablePath})
}
export async function noOverflow(page) {
  const delta=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
  if(delta>1)throw new Error(`Overflow poziomy ${delta}px`)
}
