// 獨立審查所找到的歷史投影邊界回歸；使用原生 SVG 命中及滑鼠點擊。
const assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const url=process.env.APP_URL||'http://127.0.0.1:8770/';
(async()=>{for(const[name,engine]of [['chromium',chromium],['webkit',webkit]]){const b=await engine.launch();try{const p=await b.newPage({viewport:{width:390,height:844}});await p.goto(url);
for(const view of ['RI','RO','LI','LO'])for(const y of [200,500,895]){
 const stroke={id:'boundary',view,artVersion:'surface-v1',points:[[160/320,y/1040]],width:.045,severity:4,part:null,note:''};
 await p.evaluate(s=>window.FREEHAND_DATA.createStore(localStorage).saveDraft({date:'2026-10-29',workout:'',strokes:[s]}),stroke);await p.reload();const before=await p.evaluate(()=>localStorage.getItem('bodymap.draw.draft.v2'));await p.locator('[data-tab=history]').click();await p.locator('#summary-current [data-summary-stroke]').scrollIntoViewIfNeeded();
 const target=await p.evaluate(s=>{const svg=document.querySelector('[data-summary-view=F]'),projected=FREEHAND_SUMMARY.project(s,FREEHAND_ART,FEMALE_MAP),a=FREEHAND_ART.get('F'),xy=[a.box[0]+projected.points[0][0]*a.box[2],a.box[1]+projected.points[0][1]*a.box[3]],point=svg.createSVGPoint();[point.x,point.y]=xy;const body=svg.querySelector('defs clipPath path'),mask=svg.querySelector('polygon');if(!body.isPointInFill(point)||!mask.isPointInFill(point))throw Error('valid stroke hidden '+s.view+' '+xy);const screen=point.matrixTransform(svg.getScreenCTM());return [screen.x,screen.y];},stroke);
 await p.mouse.click(...target);await p.locator('#editor').waitFor({state:'visible',timeout:5000});assert.equal(await p.locator('#drawing').getAttribute('data-view'),'F');assert.equal(await p.locator('#severity').inputValue(),'4');assert.equal(await p.evaluate(()=>localStorage.getItem('bodymap.draw.draft.v2')),before);
}
// 原source輪廓外尾段：投影位置即使在全身內，也必須被source投影mask裁掉。
for(const view of ['RI','RO','LI','LO']){
 const s={id:'tail',view,artVersion:'surface-v1',points:[[160/320,200/1040],[280/320,200/1040]],width:.045,severity:4,part:null,note:''};await p.evaluate(s=>FREEHAND_DATA.createStore(localStorage).saveDraft({date:'2026-10-29',workout:'',strokes:[s]}),s);await p.reload();await p.locator('[data-tab=history]').click();
 assert(await p.evaluate(s=>{const svg=document.querySelector('[data-summary-view=F]'),a=FREEHAND_ART.get('F'),shown=FREEHAND_SUMMARY.project(s,FREEHAND_ART,FEMALE_MAP),tail=shown.points[1],p=svg.createSVGPoint();p.x=a.box[0]+tail[0]*a.box[2];p.y=a.box[1]+tail[1]*a.box[3];const mask=svg.querySelector('polygon'),paint=svg.querySelector('.paint');let parent=paint.parentElement,clipped=false;while(parent&&parent!==svg){if((parent.getAttribute('clip-path')||'').includes(s.view))clipped=true;parent=parent.parentElement;}return clipped&&!mask.isPointInFill(p);},s),view+' source outside tail must be clipped');
}
console.log('PASS',name,'四側面膝踝邊界可見與原生點擊／體外尾段裁切／顯示不寫原資料');
}finally{await b.close();}}})().catch(e=>{console.error(e);process.exit(1);});
