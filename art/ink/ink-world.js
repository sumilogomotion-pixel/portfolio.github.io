(()=>{'use strict';
const canvas=document.querySelector('#gallery-world');if(!canvas)return;
const stage=canvas.parentElement, enter=document.querySelector('#enter-world'), motion=document.querySelector('#world-motion'),status=document.querySelector('.world-status');
// Shared input state for both renderers. A hold never inherits an automatic journey.
function controls(surface,adapter){
 const forwardSpeed=1.2;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const progress=document.querySelector('.world-progress'),back=document.querySelector('#world-back');
 let mode='idle',direction=1,pointer=null,timer=0,originX=0,originY=0,lastX=0,lastY=0,dragging=false,previous=performance.now(),backPointer=null,backTimer=0,backHeld=false;
 surface.style.touchAction='none';
 function update(){
  const value=adapter.progress();
  stage.dataset.progress=value.toFixed(4);stage.dataset.interaction=mode;
  stage.classList.toggle('holding',mode==='hold');stage.classList.toggle('pressing',!!timer);
  progress.style.transform='scaleX('+value+')';
  enter.textContent=mode==='auto'?'Ⅱ 一時停止':'→ 自動で見る';
  enter.setAttribute('aria-label',mode==='auto'?'移動を一時停止':'入口から展示室の奥まで自動で見る');
  motion.disabled=false;back.disabled=false;
 }
 function stop(){
  clearTimeout(timer);timer=0;clearTimeout(backTimer);backTimer=0;
  mode='idle';pointer=null;backPointer=null;dragging=false;surface.classList.remove('dragging');update();
 }
 function move(distance,side=0){adapter.walk(distance,side);update();}
 surface.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;stop();surface.focus({preventScroll:true});
  pointer=e.pointerId;originX=lastX=e.clientX;originY=lastY=e.clientY;
  surface.setPointerCapture(e.pointerId);
  timer=setTimeout(()=>{timer=0;if(pointer!==null&&!dragging){direction=1;mode='hold';if(reduced){move(.65*forwardSpeed);mode='idle';}update();}},350);update();
 });
 surface.addEventListener('pointermove',e=>{
  if(e.pointerId!==pointer)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;
  if(Math.hypot(e.clientX-originX,e.clientY-originY)>10){
   clearTimeout(timer);timer=0;mode='idle';dragging=true;surface.classList.add('dragging');
  }
  if(dragging)adapter.look(dx,dy);lastX=e.clientX;lastY=e.clientY;update();
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,e=>{if(e.pointerId===pointer)stop();});
 surface.tabIndex=0;
 surface.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(!['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d','escape','home'].includes(key))return;
  e.preventDefault();stop();
  if(key==='arrowleft'||key==='arrowright')adapter.look(key==='arrowleft'?-35:35,0);
  if(key==='arrowup'||key==='w')move(.5*forwardSpeed);
  if(key==='arrowdown'||key==='s')move(-.5);
  if(key==='a'||key==='d')move(0,key==='a'?-.5:.5);
  if(key==='home')adapter.reset();
  update();
 });
 for(const event of ['contextmenu','dragstart'])surface.addEventListener(event,e=>e.preventDefault());
 addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 enter.addEventListener('click',()=>{const wasAuto=mode==='auto';stop();if(!wasAuto){adapter.reset();mode='auto';if(reduced){adapter.position(1);mode='idle';}}update();});
 motion.addEventListener('click',()=>{stop();adapter.reset();status.textContent='Gateの入口です。左右に360度見渡せます。';update();});
 back.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;stop();backHeld=false;backPointer=e.pointerId;back.setPointerCapture(e.pointerId);
  backTimer=setTimeout(()=>{backTimer=0;if(backPointer!==null){backHeld=true;direction=-1;mode='hold';if(reduced){move(-.65);mode='idle';}update();}},350);
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])back.addEventListener(event,e=>{if(e.pointerId===backPointer){if(event!=='pointerup')backHeld=true;stop();}});
 back.addEventListener('click',e=>{if(backHeld&&e.detail>0){backHeld=false;return;}stop();move(-.65);});
 back.addEventListener('contextmenu',e=>e.preventDefault());
 function tick(now){
  const dt=Math.min((now-previous)/1000,.06);previous=now;
  if(mode==='hold')move(direction*dt*2.4*(direction>0?forwardSpeed:1));
  if(mode==='auto'){const v=Math.min(1,adapter.progress()+dt*forwardSpeed/10);adapter.position(v);if(v===1){mode='idle';status.textContent='展示室の奥です。後ろにも作品があります。';}update();}
  requestAnimationFrame(tick);
 }
 adapter.reset();update();requestAnimationFrame(tick);
}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function movement(state,distance,side=0){
 state.x=clamp(state.x-Math.sin(state.yaw)*distance+Math.cos(state.yaw)*side,-4.15,4.15);
 state.z=clamp(state.z-Math.cos(state.yaw)*distance-Math.sin(state.yaw)*side,-33.5,10);
}
const gateAnatomy=["heart","brain","eye-l","eye-r","lung-l","lung-r","liver","stomach","pancreas","intestines"];
function cssWorld(reason){
 canvas.hidden=true;stage.classList.add('css-world-active');stage.dataset.renderer='css-3d';stage.dataset.graphicsReason=reason;
 const view=document.createElement('div');view.className='css-world';view.setAttribute('aria-label','立体展示室。ドラッグして見渡せます。');const camera=document.createElement('div');camera.className='css-camera';view.append(camera);stage.insertBefore(view,canvas);
 const planes=[
 ['floor',0,280,-2100,1000,4800,'rotateX(90deg)',''],
 ['ceiling',0,-400,-2100,1000,4800,'rotateX(90deg)',''],
 ['leftwall',-500,-60,-2100,4800,680,'rotateY(90deg)',''],
 ['rightwall',500,-60,-2100,4800,680,'rotateY(-90deg)',''],
 ['backwall',0,-60,-4500,1000,680,'',''],
 ['backwall',0,-60,300,1000,680,'rotateY(180deg)',''],
 ['gate',0,0,-900,415,553,'','gateway'],
 ['art',-497,-65,-1600,370,277,'rotateY(90deg)','revive'],
 ['art',497,-65,-1800,260,347,'rotateY(-90deg)','canvas-work'],
 ['art',-497,-65,-2500,260,347,'rotateY(90deg)','yume-wo-miru'],
 ['art',497,-65,-2700,260,347,'rotateY(-90deg)','shinryu'],
 ['art',-230,-70,-4400,340,255,'','heart'],
 ['art',230,-70,-4400,340,255,'','brain'],
 ['art',-230,-65,290,340,255,'rotateY(180deg)','eye-l'],
 ['art',230,-65,290,340,255,'rotateY(180deg)','eye-r']
 ];
 // The reverse of Gateway is a ten-work Silent Anatomy display.
 gateAnatomy.forEach((file,i)=>planes.push(['art',(i%2===0?83:-83),-210+Math.floor(i/2)*105,-904,132,99,'rotateY(180deg)',file]));
 for(const [type,x,y,z,w,h,rotation,file]of planes){const e=document.createElement('div');e.className='world-plane '+type;e.style.width=w+'px';e.style.height=h+'px';e.style.transform=`translate3d(${x-w/2}px,${y-h/2}px,${z}px) ${rotation}`;if(file){e.style.backfaceVisibility='hidden';const img=document.createElement('img');img.src='../assets/'+file+'.webp';img.alt='';img.draggable=false;e.append(img);}camera.append(e);}
 const state={x:0,z:9,yaw:0};let pitch=0;
 view.style.perspective='800px';
 // Subtract perspective distance so the CSS eye matches the WebGL eye.
 function render(){camera.style.transform='translateZ(800px) rotateX('+pitch+'deg) rotateY('+(-state.yaw*180/Math.PI)+'deg) translate3d('+(-state.x*100)+'px,32px,'+((9-state.z)*100)+'px)';view.dataset.cameraX=state.x.toFixed(2);view.dataset.cameraZ=state.z.toFixed(2);view.dataset.yaw=state.yaw.toFixed(3);}
 controls(view,{progress:()=>clamp((9-state.z)/31,0,1),position:v=>{state.x=0;state.z=9-v*31;render();},walk:(d,s)=>{movement(state,d,s);render();},look:(dx,dy)=>{state.yaw-=dx*.004;pitch=clamp(pitch-dy*.172,-26,26);render();},reset:()=>{state.x=0;state.z=9;state.yaw=0;pitch=0;render();}});render();
}
if(location.protocol==='file:'){cssWorld('Local file preview');return;}
let gl;try{gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'low-power'});}catch(error){cssWorld('WebGL context unavailable');return;}if(!gl){cssWorld('WebGL unavailable');return;}
const state={x:0,z:9,yaw:0};let pitch=-.015,frame=0,dirty=true;
const vs=`attribute vec3 aPosition;attribute vec2 aUv;uniform mat4 uVP;varying vec2 vUv;varying float vDepth;void main(){vec4 p=uVP*vec4(aPosition,1.);gl_Position=p;vUv=aUv;vDepth=p.w;}`;
const fs=`precision mediump float;varying vec2 vUv;varying float vDepth;uniform sampler2D uTexture;uniform vec4 uColor;uniform bool uTextured;uniform bool uGate;void main(){if(uGate){vec2 hole=(vUv-vec2(.50,.56))*vec2(1.,1.33);if(length(hole)<.07)discard;}vec4 c=uTextured?texture2D(uTexture,vUv):uColor;if(c.a<.1)discard;float fog=smoothstep(12.,46.,vDepth);gl_FragColor=vec4(mix(c.rgb,vec3(.97),fog*.62),1.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Link failed');}catch(e){cssWorld('WebGL shader unavailable');return;}
gl.useProgram(program);const pos=gl.getAttribLocation(program,'aPosition'),uv=gl.getAttribLocation(program,'aUv'),vp=gl.getUniformLocation(program,'uVP'),col=gl.getUniformLocation(program,'uColor'),tex=gl.getUniformLocation(program,'uTextured'),gate=gl.getUniformLocation(program,'uGate');gl.enable(gl.DEPTH_TEST);gl.clearColor(.97,.97,.97,1);
const objects=[];
function plane(cx,cy,cz,w,h,axis,color,url,isGate=false){const corners=axis==='floor'?[[cx-w/2,cy,cz+h/2],[cx+w/2,cy,cz+h/2],[cx+w/2,cy,cz-h/2],[cx-w/2,cy,cz-h/2]]:axis==='side'?[[cx,cy-h/2,cz+w/2],[cx,cy-h/2,cz-w/2],[cx,cy+h/2,cz-w/2],[cx,cy+h/2,cz+w/2]]:[[cx-w/2,cy-h/2,cz],[cx+w/2,cy-h/2,cz],[cx+w/2,cy+h/2,cz],[cx-w/2,cy+h/2,cz]];const flip=axis==='rear'||(axis==='side'&&cx>0);const uvs=flip?[[1,0],[0,0],[0,1],[1,1]]:[[0,0],[1,0],[1,1],[0,1]],data=[];for(const i of (flip?[0,2,1,0,3,2]:[0,1,2,0,2,3]))data.push(...corners[i],...uvs[i]);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const o={buffer,color,url,isGate,texture:null};objects.push(o);if(url){const image=new Image();image.onload=()=>{o.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,o.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);dirty=true;};image.src=url;}return o;}
// The hall is real perspective geometry: floor, ceiling, two side walls, end wall and framed works.
plane(0,-2.8,-12,10,48,'floor',[.85,.85,.84,1]);plane(0,4,-12,10,48,'floor',[.97,.97,.97,1]);plane(-5,.6,-12,48,6.8,'side',[.91,.91,.9,1]);plane(5,.6,-12,48,6.8,'side',[.96,.96,.95,1]);plane(0,.6,-36,10,6.8,'front',[.985,.985,.98,1]);
plane(0,.6,12,10,6.8,'rear',[.985,.985,.98,1]);
// Sparse joints establish scale and depth without invented imagery.
for(let d=9;d>=-35;d-=3)plane(0,-2.795,d,10,.014,'floor',[.69,.69,.68,1]);for(let x=-4;x<=4;x+=2)plane(x,-2.79,-12,.012,48,'floor',[.75,.75,.74,1]);
for(let d=-4;d>=-32;d-=7){plane(-4.995,.6,d,.025,6.8,'side',[.75,.75,.74,1]);plane(4.995,.6,d,.025,6.8,'side',[.8,.8,.79,1]);}
// Gate is a freestanding canvas at the entrance. Only its center is a passage in this virtual view.
plane(0,0,.02,4.15,5.53,'front',[.2,.2,.2,1],'../assets/gateway.webp',true);
// No blank backing: the reverse face is the Silent Anatomy display below.
// A thin physical surround and foot, rather than a full-screen flat image.
plane(-2.11,0,0,.06,5.6,'front',[.25,.25,.24,1]);plane(2.11,0,0,.06,5.6,'front',[.25,.25,.24,1]);plane(0,-2.77,.13,4.4,.18,'floor',[.45,.45,.44,1]);
function artwork(x,y,d,w,h,axis,file){plane(x+(axis==='side'?(x<0?-.025:.025):0),y,d+(axis==='rear'?.025:-.025),w+.09,h+.09,axis,[.20,.20,.19,1]);plane(x,y,d,w,h,axis,[1,1,1,1],'../assets/'+file+'.webp');}
artwork(-4.96,.65,-7,3.7,2.77,'side','revive');artwork(4.96,.65,-9,2.6,3.47,'side','canvas-work');artwork(-4.96,.65,-16,2.6,3.47,'side','yume-wo-miru');artwork(4.96,.65,-18,2.6,3.47,'side','shinryu');artwork(-2.3,.7,-35,3.4,2.55,'front','heart');artwork(2.3,.7,-35,3.4,2.55,'front','brain');
artwork(-2.3,.65,11.9,3.4,2.55,'rear','eye-l');artwork(2.3,.65,11.9,3.4,2.55,'rear','eye-r');
gateAnatomy.forEach((file,i)=>artwork(i%2===0?.83:-.83,2.1-Math.floor(i/2)*1.05,-.04,1.32,.99,'rear',file));
function perspective(fov,aspect,n,f){let t=1/Math.tan(fov/2);return [t/aspect,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0];}
function mul(a,b){let out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;}
function view(ex,ey,ez,ya,pi){const sx=Math.sin(ya),cx=Math.cos(ya),sp=Math.sin(pi),cp=Math.cos(pi);const r=[cx,0,-sx],up=[sx*sp,cp,cx*sp],back=[sx*cp,-sp,cx*cp];return [r[0],up[0],back[0],0,r[1],up[1],back[1],0,r[2],up[2],back[2],0,-(r[0]*ex+r[1]*ey+r[2]*ez),-(up[0]*ex+up[1]*ey+up[2]*ez),-(back[0]*ex+back[1]*ey+back[2]*ez),1];}
function draw(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.6),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);let aspect=w/h;gl.uniformMatrix4fv(vp,false,mul(perspective((aspect<1?63:54)*Math.PI/180,aspect,.025,80),view(state.x,.32,state.z,state.yaw,pitch)));for(const o of objects){gl.bindBuffer(gl.ARRAY_BUFFER,o.buffer);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,20,12);if(o.url)gl.enable(gl.CULL_FACE);else gl.disable(gl.CULL_FACE);gl.uniform4fv(col,o.color);gl.uniform1i(tex,!!o.texture);gl.uniform1i(gate,o.isGate);if(o.texture)gl.bindTexture(gl.TEXTURE_2D,o.texture);gl.drawArrays(gl.TRIANGLES,0,6);}canvas.dataset.cameraX=state.x.toFixed(2);canvas.dataset.cameraZ=state.z.toFixed(2);canvas.dataset.yaw=state.yaw.toFixed(3);canvas.dataset.rendered='true';}
controls(canvas,{progress:()=>clamp((9-state.z)/31,0,1),position:v=>{state.x=0;state.z=9-v*31;dirty=true;},walk:(d,s)=>{movement(state,d,s);dirty=true;},look:(dx,dy)=>{state.yaw-=dx*.004;pitch=clamp(pitch+dy*.003,-.45,.45);dirty=true;},reset:()=>{state.x=0;state.z=9;state.yaw=0;pitch=-.015;dirty=true;}});

function loop(){if(dirty){draw();dirty=false;}frame=requestAnimationFrame(loop);}frame=requestAnimationFrame(loop);
addEventListener('resize',()=>{dirty=true});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);stage.classList.add('world-unavailable');});
})();

