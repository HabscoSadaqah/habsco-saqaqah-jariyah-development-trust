/* Legacy Habsco ecosystem UI cleanup.
   The ecosystem section must not appear on the home/member dashboard. */
(function(){
  'use strict';
  const REMOVE_TEXT = 'THE HABSCO ECOSYSTEM';
  function cleanup(){
    document.querySelectorAll('body *').forEach(function(el){
      const text = (el.textContent || '').trim();
      if (!text || !text.toUpperCase().includes(REMOVE_TEXT)) return;
      if (el.children.length > 8 && !el.matches('section,article,div,footer')) return;
      let target = el.closest('section,article');
      if (!target) target = el.closest('div');
      if (target && (target.textContent || '').toUpperCase().includes(REMOVE_TEXT)) target.remove();
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cleanup, {once:true});
  else cleanup();
  new MutationObserver(cleanup).observe(document.documentElement, {childList:true, subtree:true});
})();
