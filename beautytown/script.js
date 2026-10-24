/* Beauty Town Makeup Studio — site script */
(function(){
var d=document,h=d.documentElement;h.classList.add('js');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var nativeVT=('onpagereveal' in window)&&!reduce;
if(nativeVT)h.classList.add('vt');
function $(s,c){return (c||d).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
d.addEventListener('DOMContentLoaded',function(){
  /* nav state */
  var nav=$('.nav'),prog=$('.progress');
  function onScroll(){var y=scrollY;if(nav)nav.classList.toggle('scrolled',y>24);
    if(prog){var m=h.scrollHeight-innerHeight;prog.style.transform='scaleX('+(m>0?y/m:0)+')'}}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* mobile menu */
  var burger=$('.burger'),menu=$('.mmenu');
  function setMenu(open){d.body.classList.toggle('menu-open',open);if(burger){burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Close menu':'Open menu')}
    if(menu)menu.setAttribute('aria-hidden',!open)}
  if(burger)burger.addEventListener('click',function(){setMenu(!d.body.classList.contains('menu-open'))});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.body.classList.contains('menu-open'))setMenu(false)});

  /* reveals */
  var rv=$$('[data-r]');
  if('IntersectionObserver' in window&&!reduce){
    var groups=new Map();
    rv.forEach(function(el){var p=el.parentElement,i=groups.get(p)||0;groups.set(p,i+1);el.style.transitionDelay=Math.min(i,6)*90+'ms'});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(el){io.observe(el)});
    var tk=0;function sweep(){tk=0;var vh=innerHeight;rv.forEach(function(el){if(!el.classList.contains('in')&&el.getBoundingClientRect().top<vh){el.classList.add('in');io.unobserve(el)}})}
    addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(sweep)},{passive:true});setTimeout(sweep,1200);
  }else rv.forEach(function(el){el.classList.add('in')});

  /* counters */
  var cs=$$('[data-count]');
  function fmt(v,dec){return dec?v.toFixed(dec):String(Math.round(v))}
  function run(el){var t=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),suf=el.dataset.suffix||'';
    if(reduce){el.textContent=fmt(t,dec)+suf;return}
    var s=null;function step(ts){if(!s)s=ts;var p=Math.min(1,(ts-s)/1600),e=1-Math.pow(1-p,3);el.textContent=fmt(t*e,dec)+suf;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)}
  if('IntersectionObserver' in window){var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cio.unobserve(e.target);run(e.target)}})},{threshold:.4});cs.forEach(function(c){cio.observe(c)})}
  else cs.forEach(run);

  /* glow tracking on price cards */
  $$('.price').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')})});

  /* hero parallax (fine pointers only) */
  var art=$('.hero-art');
  if(art&&!reduce&&matchMedia('(pointer:fine)').matches){
    art.addEventListener('pointermove',function(e){var r=art.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      art.style.transform='perspective(1200px) rotateY('+(x*5)+'deg) rotateX('+(-y*5)+'deg)'});
    art.addEventListener('pointerleave',function(){art.style.transform=''});
    art.style.transition='transform .6s cubic-bezier(.22,.8,.24,1)';
  }

  /* gallery filters */
  var fb=$$('.filters button');
  fb.forEach(function(b){b.addEventListener('click',function(){var f=b.dataset.f;
    fb.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    $$('.masonry .tile').forEach(function(t){t.classList.toggle('hide',f!=='all'&&t.dataset.cat!==f)})})});

  /* lightbox */
  var lb=$('.lb');
  if(lb){
    var img=$('img',lb),cap=$('figcaption',lb),list=[],idx=0,last=null;
    function visible(){return $$('[data-lb]').filter(function(t){return t.offsetParent!==null&&!t.closest('[aria-hidden="true"]')})}
    function show(i){idx=(i+list.length)%list.length;var t=list[idx];img.classList.remove('ld');
      img.onload=function(){img.classList.add('ld')};img.src=t.getAttribute('href');img.alt=t.dataset.alt||'';
      cap.innerHTML='';cap.appendChild(d.createTextNode(t.dataset.cap||''));var sp=d.createElement('span');sp.textContent=(idx+1)+' / '+list.length;cap.appendChild(sp);
      var n=list[(idx+1)%list.length];if(n){var pre=new Image();pre.src=n.getAttribute('href')}}
    function open(t){list=visible();if(list.indexOf(t)<0)list=[t];last=t;show(list.indexOf(t));lb.classList.add('open');lb.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';$('.x',lb).focus()}
    function close(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');d.body.style.overflow='';if(last)last.focus()}
    d.addEventListener('click',function(e){var t=e.target.closest('[data-lb]');if(t){e.preventDefault();open(t)}});
    $('.x',lb).addEventListener('click',close);
    $('.pv',lb).addEventListener('click',function(){show(idx-1)});
    $('.nx',lb).addEventListener('click',function(){show(idx+1)});
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.tagName==='FIGURE')close()});
    d.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')close();else if(e.key==='ArrowRight')show(idx+1);else if(e.key==='ArrowLeft')show(idx-1);
      else if(e.key==='Tab'){var f=$$('button',lb),a=f[0],z=f[f.length-1];if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus()}}});
    var sx=null;lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>45)show(idx+(dx<0?1:-1));sx=null});
  }

  /* enquiry form -> WhatsApp (or email) */
  var form=$('#enquiry');
  if(form){
    function msg(){var g=function(n){return (form.elements[n]&&form.elements[n].value||'').trim()};
      return 'Hi Beauty Town! I would like to book.\nName: '+g('name')+'\nDate: '+(g('date')||'-')+'\nOccasion: '+g('occasion')+'\n'+(g('message')?'Details: '+g('message'):'')}
    form.addEventListener('submit',function(e){e.preventDefault();if(!form.reportValidity())return;
      window.open('https://wa.me/919548267020?text='+encodeURIComponent(msg()),'_blank','noopener')});
    var em=$('#enq-email');
    if(em)em.addEventListener('click',function(e){e.preventDefault();if(!form.reportValidity())return;
      location.href='mailto:beautytownmakeupstudio@gmail.com?subject='+encodeURIComponent('Booking enquiry from '+form.elements.name.value)+'&body='+encodeURIComponent(msg())});
  }

  /* page transitions (fallback where native view transitions are absent) */
  if(!nativeVT&&!reduce){
    $$('a[href]').forEach(function(a){var href=a.getAttribute('href');
      if(!/^[\w-]+\.html(#.*)?$/.test(href)||a.target||a.hasAttribute('data-lb'))return;
      a.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();
        h.classList.add('leaving');setTimeout(function(){location.href=href},300)})});
    addEventListener('pageshow',function(e){if(e.persisted)h.classList.remove('leaving')});
  }
  var y=$('#yr');if(y)y.textContent=new Date().getFullYear();
});
})();
