/* ============ page wipe transition ============ */
(function(){
  var wipe=document.getElementById('wipe');
  requestAnimationFrame(function(){requestAnimationFrame(function(){wipe.classList.add('out');});});
  window.addEventListener('pageshow',function(e){if(e.persisted)wipe.classList.add('out');});
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href$=".html"]');
    if(!a||a.target==='_blank')return;
    e.preventDefault();
    wipe.classList.remove('out');
    setTimeout(function(){location.href=a.getAttribute('href');},240);
  });
})();
/* ============ aurora background (raw WebGL shader) ============ */
(function(){
  var canvas=document.getElementById('aurora');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
  if(!gl){canvas.style.background='radial-gradient(120% 90% at 70% 110%, #0d3b2e 0%, #071a22 45%, #04070a 100%)';return;}
  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs=[
  'precision mediump float;',
  'uniform vec2 R;uniform float T;uniform vec2 M;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
  ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
  'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.1;a*=.5;}return v;}',
  'void main(){',
  ' vec2 uv=gl_FragCoord.xy/R; vec2 q=uv; q.x*=R.x/R.y;',
  ' float t=T*.06;',
  ' vec2 drift=vec2(t*.7,-t*.3)+(M-.5)*.4;',
  ' float n=fbm(q*1.5+drift+fbm(q*2.4-drift)*1.4);',
  ' float band=smoothstep(.3,.92,1.-abs(uv.y-.3-n*.46)*2.4);',
  ' float band2=smoothstep(.42,.95,1.-abs(uv.y-.62-fbm(q*1.9-drift)*.34)*2.8);',
  ' float band3=smoothstep(.55,.98,1.-abs(uv.y-.12-n*.3)*3.4);',
  ' vec3 teal=vec3(.06,.85,.6); vec3 green=vec3(.4,1.,.5); vec3 blue=vec3(.12,.4,.9);',
  ' vec3 col=vec3(.012,.024,.03);',
  ' col+=teal*band*(.38+.45*n);',
  ' col+=green*band2*.34*smoothstep(.15,.8,uv.x);',
  ' col+=blue*band*band*.38*(1.-uv.x);',
  ' col+=green*band3*.3*smoothstep(.6,.1,uv.x);',
  ' col*=smoothstep(1.3,.2,distance(uv,vec2(.5,.35)))+.06;',
  ' gl_FragColor=vec4(col,1.);}'].join('\n');
  function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;}
  var pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(pr);gl.useProgram(pr);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T'),uM=gl.getUniformLocation(pr,'M');
  var mx=.5,my=.4,smx=.5,smy=.4;
  window.addEventListener('pointermove',function(e){mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight;},{passive:true});
  function resize(){
    var s=Math.min(window.devicePixelRatio||1,1.5)*.65;
    canvas.width=Math.max(2,Math.floor(innerWidth*s));
    canvas.height=Math.max(2,Math.floor(innerHeight*s));
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  window.addEventListener('resize',resize,{passive:true});resize();
  var start=performance.now(),hidden=false;
  document.addEventListener('visibilitychange',function(){hidden=document.hidden;});
  function frame(now){
    if(!hidden){
      smx+=(mx-smx)*.03;smy+=(my-smy)*.03;
      gl.uniform2f(uR,canvas.width,canvas.height);
      gl.uniform1f(uT,(now-start)/1000);
      gl.uniform2f(uM,smx,smy);
      gl.drawArrays(gl.TRIANGLES,0,3);
    }
    if(!reduced)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
/* ============ reveal on scroll ============ */
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.1});
document.querySelectorAll('.rv').forEach(function(e){io.observe(e);});
/* ============ scroll progress + parallax strip + bgwords ============ */
(function(){
  var prog=document.getElementById('prog');
  var strips=[].slice.call(document.querySelectorAll('.strip-track'));
  var words=[].slice.call(document.querySelectorAll('.bgword'));
  var ticking=false;
  function onScroll(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
      if(prog)prog.style.width=(h>0?(y/h*100):0)+'%';
      strips.forEach(function(t){var half=t.scrollWidth/2;var x=-(y*.4)%half;t.style.transform='translate3d('+x+'px,0,0)';});
      words.forEach(function(w){var f=parseFloat(w.getAttribute('data-plx')||'0.12');var r=w.parentElement.getBoundingClientRect();var off=(r.top+r.height/2-innerHeight/2)*f;w.style.transform='translate3d(0,'+off+'px,0)';});
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
/* ============ typing terminal ============ */
(function(){
  var pre=document.querySelector('.term pre');
  if(!pre)return;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lines=[
    ['c','# logging a defect...'],
    ['','BUG-102 '],['w2','Cart total wrong after removing an item'],
    ['',''],
    ['k','Steps:'],['s',' 1. Add 2 items to cart'],['s',' 2. Remove 1 item'],['s',' 3. Open cart'],
    ['k','Expected:'],['s',' total updates to Rs 499'],
    ['k','Actual:  '],['w2',' total still shows Rs 998'],
    ['',''],
    ['k','Severity: '],['w2','Major'],['k','   Status: '],['s','Retest passed']
  ];
  var html='';
  lines.forEach(function(l){var cls=l[0]?(' class="'+l[0]+'"'):'';html+='<span'+cls+'>'+l[1]+'</span>\n';});
  if(reduced){pre.innerHTML=html;return;}
  var plain=lines.map(function(l){return l[1]}).join('\n');
  var started=false;
  var tio=new IntersectionObserver(function(es){
    if(!es[0].isIntersecting||started)return;started=true;tio.disconnect();
    var i=0;
    (function type(){
      i++;
      var done=plain.slice(0,i);
      // rebuild coloured spans up to i chars
      var acc=0,out='';
      for(var li=0;li<lines.length;li++){
        var txt=lines[li][1],cls=lines[li][0];
        if(acc+txt.length>=i){var part=txt.slice(0,Math.max(0,i-acc));out+=(cls?'<span class="'+cls+'">':'')+part+(cls?'</span>':'');break;}
        out+=(cls?'<span class="'+cls+'">':'')+txt+(cls?'</span>':'')+'\n';acc+=txt.length+1;
      }
      pre.innerHTML=out+'<span class="cursor"></span>';
      if(i<plain.length)setTimeout(type,plain[i-1]==='\n'?60:18+Math.random()*30);
    })();
  },{threshold:.3});
  tio.observe(pre);
})();
/* ============ interactive 3D knot (raw WebGL, drag to spin) ============ */
(function(){
  var cv=document.getElementById('knot');if(!cv)return;
  try{
  var gl=cv.getContext('webgl',{alpha:true,antialias:true});
  if(!gl){cv.style.display='none';return;}
  var P=2,Q=3,SEG=150,SIDE=22,S=0.52,R2=0.34;
  function C(t){return [(2+Math.cos(Q*t))*Math.cos(P*t),(2+Math.cos(Q*t))*Math.sin(P*t),Math.sin(Q*t)];}
  var verts=[],norms=[],idx=[],up=[0,0,1];
  for(var i=0;i<=SEG;i++){
    var t=i/SEG*Math.PI*2,c=C(t),c2=C(t+0.001);
    var T=[c2[0]-c[0],c2[1]-c[1],c2[2]-c[2]],tl=Math.hypot(T[0],T[1],T[2]);T=[T[0]/tl,T[1]/tl,T[2]/tl];
    var N=[T[1]*up[2]-T[2]*up[1],T[2]*up[0]-T[0]*up[2],T[0]*up[1]-T[1]*up[0]],nl=Math.hypot(N[0],N[1],N[2]);N=[N[0]/nl,N[1]/nl,N[2]/nl];
    var B=[T[1]*N[2]-T[2]*N[1],T[2]*N[0]-T[0]*N[2],T[0]*N[1]-T[1]*N[0]];
    for(var j=0;j<=SIDE;j++){
      var v=j/SIDE*Math.PI*2,cv2=Math.cos(v),sv=Math.sin(v);
      var n=[N[0]*cv2+B[0]*sv,N[1]*cv2+B[1]*sv,N[2]*cv2+B[2]*sv];
      verts.push(c[0]*S+R2*n[0],c[1]*S+R2*n[1],c[2]*S+R2*n[2]);norms.push(n[0],n[1],n[2]);
    }
  }
  for(i=0;i<SEG;i++)for(j=0;j<SIDE;j++){var a=i*(SIDE+1)+j,b=a+SIDE+1;idx.push(a,b,a+1,b,b+1,a+1);}
  var vs='attribute vec3 p;attribute vec3 n;uniform mat3 R;uniform float A;varying vec3 vN;void main(){vec3 rp=R*p;vN=R*n;float z=4.4-rp.z;float f=1.7/z;gl_Position=vec4(rp.x*f/A,rp.y*f,rp.z*.1,1.);}';
  var fs='precision mediump float;varying vec3 vN;void main(){vec3 n=normalize(vN);vec3 L=normalize(vec3(.5,.8,.6));float d=max(dot(n,L),0.);float fr=pow(1.-max(dot(n,vec3(0.,0.,1.)),0.),2.2);vec3 base=vec3(.03,.22,.19);vec3 rim=vec3(.79,.95,.29);vec3 mid=vec3(.1,.5,.75);vec3 col=base+mid*d*.55+rim*fr*.95;gl_FragColor=vec4(col,1.);}';
  function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;}
  var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
  function buf(arr,type,loc){var b=gl.createBuffer();gl.bindBuffer(type,b);gl.bufferData(type,arr,gl.STATIC_DRAW);if(loc!==undefined){var l=gl.getAttribLocation(pr,loc);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,0,0);}return b;}
  buf(new Float32Array(verts),gl.ARRAY_BUFFER,'p');
  buf(new Float32Array(norms),gl.ARRAY_BUFFER,'n');
  var ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);
  var uR=gl.getUniformLocation(pr,'R'),uA=gl.getUniformLocation(pr,'A');
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
  var ax=.4,ay=0,vx=0,vy=.004,drag=false,lx=0,ly=0,idle=0;
  cv.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;vy=dx*.005;vx=dy*.005;ay+=vy;ax+=vx;idle=0;});
  cv.addEventListener('pointerup',function(){drag=false;});
  cv.addEventListener('pointercancel',function(){drag=false;});
  function resize(){var d=Math.min(devicePixelRatio||1,2);var w=cv.clientWidth*d,h=cv.clientHeight*d;if(cv.width!==w){cv.width=w;cv.height=h;gl.viewport(0,0,w,h);}}
  var hidden=false;document.addEventListener('visibilitychange',function(){hidden=document.hidden;});
  function frame(){
    if(!hidden){
      resize();
      if(!drag){idle++;ax+=vx;ay+=vy;vx*=.95;if(idle>40)vy+=(0.004-vy)*.02;else vy*=.985;}
      ax=Math.max(-1.4,Math.min(1.4,ax));
      var ca=Math.cos(ax),sa=Math.sin(ax),cb=Math.cos(ay),sb=Math.sin(ay);
      // R = Rx(ax) * Ry(ay)
      var m=[cb,sa*sb,-ca*sb, 0,ca,sa, sb,-sa*cb,ca*cb];
      gl.uniformMatrix3fv(uR,false,m);
      gl.uniform1f(uA,cv.width/cv.height);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES,idx.length,gl.UNSIGNED_SHORT,0);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  }catch(e){cv.style.display='none';}
})();
