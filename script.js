(function(){
  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var t=b.getAttribute('data-copy');
      var done=function(){b.textContent='Copied ✓';setTimeout(function(){b.textContent='Copy'},1800)};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){prompt('Email',t)})}else{prompt('Email',t)}
    });
  });
  var dock=document.querySelector('.dock'),contact=document.getElementById('contact');
  var hero=document.getElementById('hero-ctas');
  if(dock&&contact&&hero&&'IntersectionObserver' in window){
    var heroVis=true,contactVis=false;
    var upd=function(){dock.classList.toggle('hide',heroVis||contactVis)};
    new IntersectionObserver(function(es){heroVis=es[0].isIntersecting;upd()}).observe(hero);
    new IntersectionObserver(function(es){contactVis=es[0].isIntersecting;upd()},{threshold:0.1}).observe(contact);
  }
})();
