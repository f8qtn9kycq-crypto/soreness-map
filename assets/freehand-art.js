/* surface-v1：沿用既有 MIT 人體圖；腿部側面為原創體表示意，不是肌肉邊界。 */
(function(root){
 'use strict';
 const version='surface-v1';
 const leg='M155 65 C110 90 92 160 105 240 C112 330 132 405 125 470 C110 520 118 552 135 580 C153 640 135 726 129 815 L115 895 C91 917 70 930 55 948 Q45 971 85 975 L220 975 Q246 967 228 947 L180 898 C177 850 184 790 200 720 C221 642 208 591 190 557 Q178 529 192 495 C218 432 240 337 236 237 C233 143 216 83 190 66 Q173 53 155 65Z';
 function get(id){
  if(id==='F'||id==='B'){
   const v=root.FEMALE_MAP.views[id],box=v.viewBox.split(/\s+/).map(Number);
   return {id,version,box,outline:v.outline,decoration:(v.hairBack?`<path class="hair" d="${v.hairBack}"/>`:'')+(v.hairFront?`<path class="hair" d="${v.hairFront}"/>`:'')+(v.hairLines||[]).map(d=>`<path class="hairline" d="${d}"/>`).join(''),labels:[{x:box[0]+box[2]*.18,y:70,zh:id==='F'?'右':'左',en:id==='F'?'Right':'Left'},{x:box[0]+box[2]*.82,y:70,zh:id==='F'?'左':'右',en:id==='F'?'Left':'Right'}]};
  }
  if(!['RI','RO','LI','LO'].includes(id))throw Error('Invalid surface');
  const inner=id[1]==='I',left=id[0]==='L';
  return {id,version,box:[0,0,320,1040],outline:leg,decoration:`<path class="hairline" d="M${inner?'128 481 Q155 505 188 491':'126 482 Q167 468 194 486'} M137 888 Q157 901 180 898"/>`,labels:[{x:35,y:340,zh:'大腿',en:'Thigh'},{x:35,y:715,zh:'小腿',en:'Lower leg'},{x:160,y:30,zh:(left?'左':'右')+'腿'+(inner?'內側':'外側'),en:(left?'Left':'Right')+' leg · '+(inner?'inner':'outer')}]};
 }
 root.FREEHAND_ART={version,get};
})(window);
