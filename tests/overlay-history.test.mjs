import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import ts from 'typescript'

test('spacer and panorama can mount when crypto.randomUUID is unavailable', () => {
  const source = readFileSync(new URL('../src/hooks/useOverlayHistory.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const exports = {}
  const blockedCrypto = Object.defineProperty({}, 'randomUUID', {
    get() { throw new Error('randomUUID is unavailable on this HTTP origin') },
  })
  runInNewContext(outputText, { exports, require: createRequire(import.meta.url), crypto: blockedCrypto })
  function Viewer() {
    exports.useOverlayHistory(() => {})
    return createElement('div', null, 'Spacer gotowy')
  }
  assert.match(renderToString(createElement(Viewer)), /Spacer gotowy/)
})
