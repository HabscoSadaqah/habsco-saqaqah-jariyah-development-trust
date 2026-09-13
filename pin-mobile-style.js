(()=>{
'use strict';
if(document.getElementById('hfPinMobileStyle'))return;
const style=document.createElement('style');
style.id='hfPinMobileStyle';
style.textContent=`
@media (max-width:520px){
  .hf-pin-modal .hf-pin-sheet{
    width:min(88vw,330px)!important;
    max-width:330px!important;
    padding:18px 16px 16px!important;
    box-sizing:border-box!important;
  }
  .hf-pin-modal #hfPinInput{
    width:100%!important;
    max-width:100%!important;
    box-sizing:border-box!important;
    height:46px!important;
    min-height:46px!important;
    padding:0 8px!important;
    font-size:18px!important;
    line-height:46px!important;
    text-align:center!important;
    letter-spacing:6px!important;
  }
  .hf-pin-modal #hfPinInput::placeholder{
    font-size:11.5px!important;
    line-height:46px!important;
    letter-spacing:0!important;
    text-align:center!important;
    opacity:1!important;
    white-space:nowrap!important;
  }
  .hf-pin-modal .hf-pin-confirm{min-height:44px!important}
}
`;
document.head.appendChild(style);
})();
