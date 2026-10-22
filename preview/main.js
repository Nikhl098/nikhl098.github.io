/* Cinematic aurora background: raw WebGL fragment shader, mobile-tuned. */
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
  ' float t=T*.05;',
  ' vec2 drift=vec2(t*.6,-t*.25)+(M-.5)*.35;',
  ' float n=fbm(q*1.6+drift+fbm(q*2.6-drift)*1.2);',
  ' float band=smoothstep(.35,.9,1.-abs(uv.y-.28-n*.42)*2.6);',
  ' float band2=smoothstep(.5,.95,1.-abs(uv.y-.62-fbm(q*2.-drift)*.3)*3.2);',
  ' vec3 teal=vec3(.05,.75,.55); vec3 green=vec3(.35,.95,.45); vec3 blue=vec3(.1,.35,.8);',
  ' vec3 col=vec3(.012,.024,.03);',
  ' col+=teal*band*(.35+.45*n);',
  ' col+=green*band2*.28*smoothstep(.2,.8,uv.x);',
  ' col+=blue*band*band*.35*(1.-uv.x);',
  ' col*=smoothstep(1.25,.25,distance(uv,vec2(.5,.35)));',
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
    var s=Math.min(window.devicePixelRatio||1,1.5)*.6;
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
/* Reveal on scroll */
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.1});
document.querySelectorAll('.rv').forEach(function(e){io.observe(e);});
