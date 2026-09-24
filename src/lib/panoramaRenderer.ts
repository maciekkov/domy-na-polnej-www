/** Perspective projection of the supplied equirectangular photograph.
 * No scene engine is needed for a single texture. Rendering is requested only on interaction. */
export function createPanorama(container: HTMLElement, read: () => {lon:number;lat:number;fov:number}, onReady:()=>void, onError:()=>void) {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl', { alpha:false, antialias:false, powerPreference:'low-power' })
  if (!gl) throw new Error('WebGL unavailable')
  const shader = (type:number, source:string) => {
    const s=gl.createShader(type); if(!s) throw new Error('Shader allocation failed')
    gl.shaderSource(s,source);gl.compileShader(s)
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) { const error=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(error??'Shader error') }
    return s
  }
  const vert=shader(gl.VERTEX_SHADER,'attribute vec2 p; varying highp vec2 uv; void main(){uv=p;gl_Position=vec4(p,0.,1.);}')
  const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ? 'highp' : 'mediump'
  const frag=shader(gl.FRAGMENT_SHADER,`precision ${precision} float; varying highp vec2 uv; uniform sampler2D panorama; uniform vec4 view;
    void main(){float k=tan(view.z*0.5);vec3 d=normalize(vec3(uv.x*view.w*k,uv.y*k,1.));
    float cl=cos(view.y),sl=sin(view.y);d=vec3(d.x,d.y*cl+d.z*sl,-d.y*sl+d.z*cl);
    float theta=atan(d.x,d.z)+view.x;float phi=asin(clamp(d.y,-1.,1.));
    gl_FragColor=texture2D(panorama,vec2(fract(theta/6.2831853),0.5-phi/3.14159265));}`)
  const program=gl.createProgram(); if(!program) throw new Error('Program allocation failed')
  gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program)
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Program link failed')
  gl.useProgram(program)
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
  const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0)
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
  const view=gl.getUniformLocation(program,'view')
  let disposed=false,loaded=false,frame=0
  const draw=()=>{
    frame=0;if(disposed||!loaded)return
    const v=read(),limit=gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),ratio=Math.min(devicePixelRatio||1,limit/Math.max(container.clientWidth,container.clientHeight,1)),w=Math.max(1,Math.round(container.clientWidth*ratio)),h=Math.max(1,Math.round(container.clientHeight*ratio))
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
    // Match the original inward sphere: u = longitude / (2*PI); image row 0 is north.
    gl.uniform4f(view,v.lon*Math.PI/180,v.lat*Math.PI/180,v.fov*Math.PI/180,w/h)
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
  }
  const request=()=>{if(!disposed&&!frame)frame=requestAnimationFrame(draw)}
  const observer=new ResizeObserver(request);observer.observe(container)
  canvas.addEventListener('webglcontextlost',onError)
  container.replaceChildren(canvas)
  const image=new Image();image.crossOrigin='anonymous';image.decoding='async'
  image.onload=()=>{if(disposed)return;try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);if(gl.getError()!==gl.NO_ERROR)throw new Error('Texture upload failed');canvas.dataset.sourceResolution=`${image.naturalWidth}x${image.naturalHeight}`;canvas.dataset.shaderPrecision=precision;loaded=true;onReady();request()}catch{onError()}}
  image.onerror=()=>{if(!disposed)onError()}
  image.src='/assets/images/neighborhood/panorama-360-grabik.webp?v=c7a1986872c74640'
  return {request,dispose:()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();image.onload=null;image.onerror=null;canvas.removeEventListener('webglcontextlost',onError);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vert);gl.deleteShader(frag);canvas.remove()}}
}
