/* Offline, deterministic production packer. Uses the same React 19.1.1 API.
   It validates syntax but deliberately does not claim TypeScript type checking. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const ts = require('../vendor/typescript.cjs');
const out = path.join(root, 'dist');
const modules = new Map(), cssFiles = new Set();
const id = f => path.relative(root, f).replaceAll('\\', '/');
const ext = new Set(['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime']);
function resolveFile(from, spec) {
  const base = path.resolve(path.dirname(from), spec);
  for (const f of [base, ...['.tsx','.ts','.mjs','.js','.json','.css','/index.tsx','/index.ts'].map(e=>base+e)])
    if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  throw new Error(`Missing dependency ${spec} in ${id(from)}`);
}
function visit(file) {
  const name=id(file); if (modules.has(name)) return name;
  modules.set(name, '');
  if (file.endsWith('.css')) { cssFiles.add(file); return name; }
  if (file.endsWith('.json')) { const j=JSON.parse(fs.readFileSync(file,'utf8')); modules.set(name,`module.exports=${JSON.stringify(j)};`); return name; }
  let source=fs.readFileSync(file,'utf8');
  if (name==='src/main.tsx') source=source.replace(/const DemoAdmin = import\.meta\.env\.DEV[\s\S]*?\n  : null/, 'const DemoAdmin = null');
  // Demo endpoint is unreachable in production; do not include the demo lead store.
  source=source.replace(/import\(['"]([^'"]*admin\/demoStore)['"]\)/g, 'Promise.reject(new Error("Demo disabled in production"))');
  source=source.replace(/import\.meta\.env/g, '({DEV:false,PROD:true,BASE_URL:"/",MODE:"production",VITE_ENABLE_DEMO_ADMIN:"false"})');
  const result=ts.transpileModule(source,{fileName:file.replace(/\.mjs$/, ".ts"), reportDiagnostics:true, compilerOptions:{
    target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX,
    esModuleInterop:true, resolveJsonModule:true, removeComments:true
  }});
  const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if (errors.length) throw new Error(`${name}: ${ts.formatDiagnosticsWithColorAndContext(errors,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'})}`);
  let js=result.outputText.replace(/require\(["']([^"']+)["']\)/g, (all,spec) => {
    if(ext.has(spec)) return `require(${JSON.stringify(spec)})`;
    if(!spec.startsWith('.')) throw new Error(`Unbundled external ${spec} in ${name}`);
    return `require(${JSON.stringify(visit(resolveFile(file,spec)))})`;
  });
  modules.set(name,js); return name;
}
function flattenCss(file, seen=new Set()) {
  if(seen.has(file)) return ''; seen.add(file);
  return fs.readFileSync(file,'utf8').replace(/@import\s+['"]([^'"]+)['"];?/g, (_,spec)=>flattenCss(path.resolve(path.dirname(file),spec),seen));
}
cp.execFileSync(process.execPath,[path.join(root,'scripts/generate-tour-summary.mjs')],{cwd:root,stdio:'inherit'});
cp.execFileSync(process.execPath,[path.join(root,'scripts/version-assets.mjs')],{cwd:root,stdio:'inherit'});
cp.execFileSync(process.execPath,[path.join(root,'scripts/generate-seo.mjs')],{cwd:root,stdio:'inherit'});
fs.rmSync(out,{recursive:true,force:true}); fs.cpSync(path.join(root,'public'),out,{recursive:true});
const entry=visit(path.join(root,'src/main.tsx'));
const runtime=fs.readFileSync(path.join(root,'vendor/react-19.1.1.mjs'),'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const vendorName=`react-${hash(runtime)}.js`;
const prelude=`import { React, ReactDOM, ReactDOMClient, jsxRuntime } from './${vendorName}';\nconst cache=new Map();\nconst external={'react':React,'react-dom':ReactDOM,'react-dom/client':ReactDOMClient,'react/jsx-runtime':jsxRuntime};\nconst modules={\n`;
const body=[...modules].map(([k,v])=>`${JSON.stringify(k)}:function(module,exports,require){\n${v}\n}`).join(',\n');
const tail=`\n};\nfunction require(id){if(id in external)return external[id];if(cache.has(id))return cache.get(id).exports;const factory=modules[id];if(!factory)throw Error('Missing module: '+id);const m={exports:{}};cache.set(id,m);factory(m,m.exports,require);return m.exports;}\nrequire(${JSON.stringify(entry)});\n`;
const js=prelude+body+tail, css=[...cssFiles].map(f=>flattenCss(f)).join('\n');
const jsName=`site-${hash(js)}.js`, cssName=`site-${hash(css)}.css`;
const dest=path.join(out,'assets/build');fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,vendorName),runtime);fs.writeFileSync(path.join(dest,jsName),js);fs.writeFileSync(path.join(dest,cssName),css);
let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/,`<script type="module" src="/assets/build/${jsName}"></script>`);
html=html.replace('</head>',`<link rel="stylesheet" href="/assets/build/${cssName}" />\n<link rel="modulepreload" href="/assets/build/${vendorName}" />\n</head>`);
fs.writeFileSync(path.join(out,'index.html'),html);
cp.execFileSync(process.execPath,[path.join(root,'scripts/prepare-dist.mjs')],{cwd:root,stdio:'inherit'});
cp.execFileSync(process.execPath,[path.join(root,'scripts/build-hosting.mjs')],{cwd:root,stdio:'inherit'});
fs.writeFileSync(path.join(root,'BUILD-VERIFIED.json'),JSON.stringify({builder:'portable',typescript:ts.version,react:'19.1.1',node:process.version,modules:modules.size,jsBytes:Buffer.byteLength(js),runtimeBytes:Buffer.byteLength(runtime),cssBytes:Buffer.byteLength(css),entry:jsName,syntaxChecked:true,typeChecked:false},null,2));
console.log(`Portable production build: ${modules.size} modules, JS ${Math.round(js.length/1024)} KB + React ${Math.round(runtime.length/1024)} KB, CSS ${Math.round(css.length/1024)} KB.`);
