const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const fine=matchMedia('(pointer:fine)').matches;

/* preloader */
const loader=$('#loader'),wipe=$('#wipe');
function ready(){document.body.classList.add('ready')}
if(loader&&sessionStorage.getItem('pl')){loader.remove();ready()}
else if(loader){
  const pct=loader.querySelector('.pct b');let p=0;
  const iv=setInterval(()=>{p=Math.min(100,p+Math.random()*16+6);pct.textContent=String(Math.floor(p)).padStart(3,'0');
    if(p>=100){clearInterval(iv);setTimeout(()=>{loader.classList.add('done');ready();sessionStorage.setItem('pl','1');setTimeout(()=>loader.remove(),1000)},220)}},80);
}else ready();

/* page wipe transitions */
if(wipe){
  const wipeOut=()=>{wipe.classList.remove('in');wipe.style.transition='none';wipe.style.transform='scaleY(1)';
    wipe.getBoundingClientRect();wipe.style.transition='';wipe.style.transform='';wipe.classList.add('out')};
  if(loader&&!sessionStorage.getItem('pl')){wipe.style.display='none'}
  else wipeOut();
  window.addEventListener('pageshow',e=>{if(e.persisted)wipeOut()});
  $$('a[href$=".html"]').forEach(a=>a.addEventListener('click',e=>{
    const href=a.getAttribute('href');if(!href||e.metaKey||e.ctrlKey)return;
    e.preventDefault();wipe.style.display='';wipe.classList.remove('out');wipe.classList.add('in');
    setTimeout(()=>location.href=href,520);
  }));
}

/* scroll progress */
const prog=$('#prog');
if(prog)addEventListener('scroll',()=>{const h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});

/* custom cursor */
if(fine){
  document.body.classList.add('js-cur');
  const c1=document.createElement('div');c1.className='cur';
  const c2=document.createElement('div');c2.className='cur2';
  document.body.append(c1,c2);
  let x=innerWidth/2,y=innerHeight/2,x2=x,y2=y;
  addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;c1.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`});
  (function loop(){x2+=(x-x2)*.16;y2+=(y-y2)*.16;c2.style.transform=`translate(${x2}px,${y2}px) translate(-50%,-50%)`;requestAnimationFrame(loop)})();
  $$('a,button,.card,.panel,input,textarea').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'))});
}

/* magnetic buttons */
if(fine)$$('.btn,.logo,.orbit').forEach(el=>{
  el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();
    el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});
  el.addEventListener('mouseleave',()=>el.style.transform='');
});

/* nav scramble */
const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ#@%&';
$$('.nl').forEach(el=>{const orig=el.textContent;let iv;
  el.addEventListener('mouseenter',()=>{let i=0;clearInterval(iv);
    iv=setInterval(()=>{el.textContent=orig.split('').map((c,idx)=>idx<i?orig[idx]:CH[Math.random()*CH.length|0]).join('');
      i+=.6;if(i>=orig.length){clearInterval(iv);el.textContent=orig}},34)})});

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
const groups=new Map();
$$('.rv').forEach(el=>{const p=el.parentElement;if(!groups.has(p))groups.set(p,0);el.style.transitionDelay=(groups.get(p)*70)+'ms';groups.set(p,groups.get(p)+1);io.observe(el)});

/* parallax extras */
const px=$$('[data-plx]');
if(px.length){const tick=()=>{const y=scrollY;px.forEach(el=>el.style.transform=`translateY(${y*parseFloat(el.dataset.plx)}px)`);requestAnimationFrame(tick)};tick()}

/* count-up stats */
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);
  const t=+e.target.dataset.count;let s=null;
  const step=ts=>{if(!s)s=ts;const p=Math.min(1,(ts-s)/1300);e.target.textContent=Math.floor(t*(1-Math.pow(1-p,3)));
    if(p<1)requestAnimationFrame(step);else e.target.textContent=t};
  requestAnimationFrame(step)}),{threshold:.5});
$$('[data-count]').forEach(n=>cio.observe(n));

/* horizontal work scroll */
const hs=$('.hscroll');
if(hs&&matchMedia('(min-width:901px)').matches){
  const track=hs.querySelector('.hs-track'),bar=hs.querySelector('.hs-prog i');
  const set=()=>{const r=hs.getBoundingClientRect();
    const prog2=Math.min(1,Math.max(0,-r.top/(r.height-innerHeight)));
    track.style.transform=`translateX(${-prog2*(track.scrollWidth-innerWidth)}px)`;
    if(bar)bar.style.transform=`scaleX(${prog2})`};
  addEventListener('scroll',set,{passive:true});addEventListener('resize',set);set();
}

/* 3d tilt + glow tracking */
if(fine)$$('.card,.panel').forEach(el=>{
  el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();
    el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');
    const rx=((e.clientY-r.top)/r.height-.5)*-5,ry=((e.clientX-r.left)/r.width-.5)*5;
    el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`});
  el.addEventListener('mouseleave',()=>el.style.transform='');
});

/* terminal typing */
const term=$('.term pre');
if(term){
  const lines=[
'$ nikhil run smoke-check --build 142','',
'  ✓ app opens','  ✓ login works','  ✓ core flow completes','',
'  5 of 5 passed','',
'$ cat bug-report.txt','',
'  ID:       QA-101','  Title:    Login button unresponsive on mobile Safari',
'  Severity: Major','  Steps:    1. Open /login   2. Tap "Sign in"',
'  Expected: dashboard loads','  Actual:   nothing happens','',
'  Status:   logged → assigned → retested ✓ fixed'];
  let started=false;
  const tio=new IntersectionObserver(es=>{if(es[0].isIntersecting&&!started){started=true;tio.disconnect();
    let i=0;const tick=()=>{if(i>lines.length)return;term.textContent=lines.slice(0,i).join('\n');i++;setTimeout(tick,i<3?420:190)};tick()}},{threshold:.35});
  tio.observe(term.parentElement);
}
