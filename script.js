(function(){
'use strict';
var d=document,root=d.documentElement;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches;
function $(s,c){return (c||d).querySelector(s)}function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}

/* theme toggle */
$$('.theme').forEach(function(b){b.addEventListener('click',function(){var t=root.getAttribute('data-theme')==='light'?'dark':'light';root.setAttribute('data-theme',t);try{localStorage.setItem('theme',t)}catch(e){}var m=$('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#f5f7f2':'#070b16');b.setAttribute('aria-label',t==='light'?'Switch to dark theme':'Switch to light theme')})});

/* mobile menu */
var mb=$('.menu-btn');
if(mb){mb.addEventListener('click',function(){var o=d.body.classList.toggle('menu-open');mb.setAttribute('aria-expanded',o?'true':'false')});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.body.classList.contains('menu-open')){d.body.classList.remove('menu-open');mb.setAttribute('aria-expanded','false');mb.focus()}})}

/* scroll progress */
var pr=$('.progress');
function onScroll(){if(pr){var h=root.scrollHeight-innerHeight;pr.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')'}tl()}
var tlEl=$('.timeline'),tlFill=tlEl&&$('.tl-fill',tlEl);
function tl(){if(!tlFill)return;var r=tlEl.getBoundingClientRect();var p=(innerHeight*0.7-r.top)/r.height;p=Math.max(0,Math.min(1,p));tlFill.style.height=(RM?100:p*100)+'%'}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();

/* counters */
function count(el){var to=parseFloat(el.getAttribute('data-count'));var dec=(el.getAttribute('data-count').split('.')[1]||'').length;var suf=el.getAttribute('data-suffix')||'';if(RM){el.textContent=to.toFixed(dec)+suf;return}var t0=null,dur=1400;function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/dur);var e=1-Math.pow(1-p,3);el.textContent=(to*e).toFixed(dec)+suf;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)}

/* donuts */
function donut(el){var c=$('.d-fg',el);if(!c)return;var r=+c.getAttribute('r');var L=2*Math.PI*r;var v=parseFloat(el.getAttribute('data-value'));c.style.strokeDasharray=(L*v)+' '+L}

/* reveal */
var targets=$$('.rv,.stat,[data-count],.meter,.track,.badges.pop,.donut,.term');
if('IntersectionObserver' in window&&!RM){
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;var t=en.target;t.classList.add('in');if(t.hasAttribute('data-count'))count(t);if(t.classList.contains('stat'))t.classList.add('counted');if(t.classList.contains('donut'))donut(t);if(t.classList.contains('term'))runTerm(t);io.unobserve(t)})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
targets.forEach(function(t){io.observe(t)});
}else{targets.forEach(function(t){t.classList.add('in');if(t.hasAttribute('data-count'))count(t);if(t.classList.contains('stat'))t.classList.add('counted');if(t.classList.contains('donut'))donut(t);if(t.classList.contains('term'))runTerm(t)})}

/* terminal lines */
function runTerm(t){var ls=$$('.l',t);ls.forEach(function(l,i){if(RM){l.classList.add('on');return}setTimeout(function(){l.classList.add('on')},250+i*260)})}

/* typed role */
var ty=$('[data-typed]');
if(ty){var words=JSON.parse(ty.getAttribute('data-typed'));var out=$('.tw',ty);
if(RM){out.textContent=words[0]}else{var wi=0,ci=0,del=false;(function tick(){var w=words[wi];if(!del){ci++;out.textContent=w.slice(0,ci);if(ci===w.length){del=true;return setTimeout(tick,1700)}}else{ci--;out.textContent=w.slice(0,ci);if(ci===0){del=false;wi=(wi+1)%words.length;return setTimeout(tick,350)}}setTimeout(tick,del?34:68)})()}}

/* tilt */
if(fine&&!RM){$$('.tilt').forEach(function(el){var g=d.createElement('span');g.className='glare';el.appendChild(g);var raf;
el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();var x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){el.style.transform='perspective(900px) rotateX('+((.5-y)*8).toFixed(2)+'deg) rotateY('+((x-.5)*10).toFixed(2)+'deg) translateY(-4px)';el.style.setProperty('--gx',(x*100)+'%');el.style.setProperty('--gy',(y*100)+'%')})});
el.addEventListener('pointerleave',function(){cancelAnimationFrame(raf);el.style.transform=''})})}

/* project filters */
var fb=$$('.filters button');
fb.forEach(function(b){b.addEventListener('click',function(){var f=b.getAttribute('data-filter');fb.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
$$('.pitem').forEach(function(it){var show=f==='all'||(' '+it.getAttribute('data-tags')+' ').indexOf(' '+f+' ')>-1;if(show){it.classList.remove('hide');if(!RM){it.classList.add('fade');requestAnimationFrame(function(){requestAnimationFrame(function(){it.classList.remove('fade')})})}}else{it.classList.add('hide')}})})});

/* copy buttons */
var toast=$('.toast');function say(m){if(!toast)return;toast.textContent=m;toast.classList.add('show');clearTimeout(say.t);say.t=setTimeout(function(){toast.classList.remove('show')},1800)}
$$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-copy');function ok(){say('Copied: '+v)}if(navigator.clipboard)navigator.clipboard.writeText(v).then(ok,function(){prompt('Copy',v)});else prompt('Copy',v)})});

/* contact form -> mailto */
var form=$('#hire-form');
if(form){form.addEventListener('submit',function(e){e.preventDefault();var ok=true;
$$('[required]',form).forEach(function(f){var err=$('#'+f.id+'-err');var bad=!f.value.trim()||(f.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));if(err)err.textContent=bad?(f.type==='email'&&f.value.trim()?'Please enter a valid email.':'This field is required.'):'';f.setAttribute('aria-invalid',bad?'true':'false');if(bad&&ok){f.focus();ok=false}});
if(!ok)return;var n=form.name_.value.trim(),em=form.email.value.trim(),co=form.company.value.trim(),ro=form.role.value,msg=form.message.value.trim();
var subj=(ro||'QA opportunity')+' for Nikhil'+(co?' at '+co:'');var body='Hi Nikhil,\n\n'+msg+'\n\n'+n+(co?'\n'+co:'')+'\n'+em;
window.location.href='mailto:nikhilpsing@gmail.com?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);say('Opening your email app…')})}

/* page transitions (fallback for browsers without cross-document view transitions) */
if(!root.classList.contains('vt')&&!RM){d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||a.target==='_blank'||a.hasAttribute('download')||/^(mailto|tel|https?):/i.test(h))return;e.preventDefault();d.body.classList.add('leaving');setTimeout(function(){location.href=a.href},190)})}
addEventListener('pageshow',function(e){if(e.persisted)d.body.classList.remove('leaving','menu-open')});

/* particles background */
var cv=$('#particles');
if(cv&&!RM&&cv.getContext){var ctx=cv.getContext('2d'),W,H,DPR=Math.min(2,window.devicePixelRatio||1),pts=[],run=true,mouse={x:-1e4,y:-1e4};
function size(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);var n=Math.round(Math.min(70,Math.max(22,W*H/26000)));pts=[];for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.6+.8,s:Math.random()<.12})}
function col(a){return root.getAttribute('data-theme')==='light'?'rgba(21,128,61,'+a+')':'rgba(74,222,128,'+a+')'}
function frame(){if(!run)return;ctx.clearRect(0,0,W,H);var max=130;for(var i=0;i<pts.length;i++){var p=pts[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
var mx=p.x-mouse.x,my=p.y-mouse.y,md=mx*mx+my*my;if(md<14400){p.x+=mx/120;p.y+=my/120}
for(var j=i+1;j<pts.length;j++){var q=pts[j],dx=p.x-q.x,dy=p.y-q.y,dd=dx*dx+dy*dy;if(dd<max*max){ctx.strokeStyle=col((1-Math.sqrt(dd)/max)*.22);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}
ctx.fillStyle=p.s?'rgba(248,113,113,.75)':col(.55);ctx.beginPath();ctx.arc(p.x,p.y,p.s?p.r+1:p.r,0,6.283);ctx.fill()}
requestAnimationFrame(frame)}
size();frame();var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,200)});
if(fine)addEventListener('pointermove',function(e){mouse.x=e.clientX;mouse.y=e.clientY},{passive:true});
d.addEventListener('visibilitychange',function(){var was=run;run=!d.hidden;if(run&&!was)frame()})}

var yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();
})();
