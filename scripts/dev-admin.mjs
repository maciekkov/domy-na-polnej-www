import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
// Works on Windows, macOS and Linux without shell-specific environment syntax.
const child = spawn(process.execPath, [resolve('node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', ...(process.env.DNP_NO_OPEN ? [] : ['--open', '/administrator']), ...process.argv.slice(2)], {
  stdio: 'inherit', env: { ...process.env, VITE_ENABLE_DEMO_ADMIN: 'true' },
})
child.on('error', (error) => { console.error(error.message); process.exitCode = 1 })
child.on('exit', (code) => { process.exitCode = code ?? 1 })
