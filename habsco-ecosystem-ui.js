/* Legacy Habsco ecosystem UI removal. The old ecosystem section is permanently disabled. */
(function(){
  'use strict';
  const BAD_PHRASES = [
    'THE HABSCO ECOSYSTEM',
    'ONE HABSCO ECOSYSTEM. THREE CLEAR PURPOSES.'
  ];
  function isBadText(text){
    const value = String(text || '').replace(/\s+/g,' ').trim().toUpperCase();
    return BAD_PHRASES.some(function(phrase){ return value.includes(phrase); });
  }
  function removeLegacySections(){
    if(!document.body) return;
    const candidates = Array.from(document.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,div,section,article,footer'));
    candidates.forEach(function(el){
      if(!isBadText(el.textContent)) return;
      const own = String(el.textContent || '').replace(/\s+/g,' ').trim().toUpperCase();
      if(!own.includes('THE HABSCO ECOSYSTEM') && !own.includes('ONE HABSCO ECOSYSTEM. THREE CLEAR PURPOSES.')) return;
      let target = el.closest('section');
      if(!target) target = el.closest('article');
      if(!target) target = el.closest('[id]');
      if(!target) target = el.parentElement;
      if(target && target !== document.body && target !== document.documentElement) target.remove();
    });
  }
  function run(){
    removeLegacySections();
    setTimeout(removeLegacySections, 50);
    setTimeout(removeLegacySections, 250);
    setTimeout(removeLegacySections, 1000);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
  new MutationObserver(run).observe(document.documentElement, {childList:true,subtree:true});
})();
