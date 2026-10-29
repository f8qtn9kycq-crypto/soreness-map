const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const S=require('../assets/freehand-summary.js');
const G=require('../assets/freehand-summary-geometry.js');
const box=[100,20,600,1440];
const art={get:view=>{assert.equal(view,'F');return {box};}};
const map={locations:[
  {id:'jKnee',view:'F',side:'R',labelPoint:[270,991]},
  {id:'jAnkle',view:'F',side:'R',labelPoint:[285,1324]},
  {id:'jKnee',view:'F',side:'L',labelPoint:[530,991]},
  {id:'jAnkle',view:'F',side:'L',labelPoint:[515,1324]}
]};
const stroke=(view,points=[[.5,.5]])=>({id:'example',view,artVersion:'surface-v1',points,width:.1,severity:0,part:null,note:'保留備註',location:{regions:['knee','lowerLeg'],side:view[0],surface:'outer'}});
const world=point=>[point[0]*box[2]+box[0],point[1]*box[3]+box[1]];
const almost=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
function freeze(value) {if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}

test('UMD 可在沒有 DOM 的瀏覽器全域或 CommonJS 載入',()=>{
  const context=vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../assets/freehand-summary-geometry.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(require.resolve('../assets/freehand-summary.js'),'utf8'),context);
  assert.equal(typeof context.FREEHAND_SUMMARY.project,'function');
  assert.equal(typeof context.FREEHAND_SUMMARY.nearby,'function');
});
test('六視角皆回傳深複本，原筆畫及圖形地標不變；0 分與其他欄位保留',()=>{
  const originalMap=JSON.parse(JSON.stringify(map));
  for(const view of ['F','B','RI','RO','LI','LO']) {
    const input=stroke(view), before=JSON.parse(JSON.stringify(input));
    freeze(input);
    const result=S.project(input,art,map);
    assert.deepEqual(input,before);
    assert.equal(result.view,view==='B'?'B':'F');
    assert.equal(result.severity,0);
    assert.equal(result.id,input.id);
    assert.equal(result.artVersion,input.artVersion);
    assert.equal(result.note,input.note);
    assert.equal(result.part,input.part);
    assert.deepEqual(result.location,input.location);
    assert.notEqual(result,input);
    assert.notEqual(result.points,input.points);
    assert.notEqual(result.points[0],input.points[0]);
    assert.notEqual(result.location,input.location);
    assert.notEqual(result.location.regions,input.location.regions);
    if(view==='F'||view==='B')assert.deepEqual(result,input);
    result.location.regions.push('ankle');
    assert.deepEqual(input,before);
  }
  assert.deepEqual(map,originalMap);
});
test('正背面原值不依賴投影圖形，保留筆形、筆寬與未評分值',()=>{
  for(const view of ['F','B']) {
    const input={...stroke(view,[[.2,.3],[.8,.9]]),severity:null};
    assert.deepEqual(S.project(input),input);
  }
});
test('單點落於已確認的五個 Demo 錨點，寬度換算為相同顯示比例',()=>{
  for(const [sourceY,targetY] of [[65,665],[470,970],[580,1035],[895,1324],[975,1420]]) {
    const result=S.project(stroke('RI',[[.5,sourceY/1040]]),art,map);
    assert.equal(result.points.length,1);
    almost(world(result.points[0])[1],targetY);
    almost(result.width*box[2],.1*320*.45);
  }
});
test('左右與內外側不重疊，水平方向及多點筆形保留',()=>{
  const positions={};
  for(const view of ['RI','RO','LI','LO']) {
    const result=S.project(stroke(view,[[.4,.7],[.5,.7],[.6,.7]]),art,map);
    positions[view]=world(result.points[1])[0];
    const firstDelta=world(result.points[1])[0]-world(result.points[0])[0];
    assert.ok(firstDelta>0);
    almost(world(result.points[2])[0]-world(result.points[1])[0],firstDelta);
    almost(world(result.points[0])[1],world(result.points[2])[1]);
  }
  assert.ok(positions.RO<positions.RI);
  assert.ok(positions.RI<positions.LI);
  assert.ok(positions.LI<positions.LO);
  assert.ok(positions.RI-positions.RO>0);
  assert.ok(positions.LO-positions.LI>0);
});
test('跨膝筆畫保持單一連續折線，不切段或丟棄點；分段邊界連續',()=>{
  const ys=[350,470-1e-6,470,470+1e-6,580-1e-6,580,580+1e-6,750];
  const result=S.project(stroke('LO',ys.map(y=>[.5,y/1040])),art,map);
  assert.ok(result.points.length>ys.length);
  const points=result.points.map(world);
  for(let i=1;i<points.length;i++)assert.ok(points[i][1]>points[i-1][1]);
  for(const sourceY of [470,580]) {
    const near=S.project(stroke('LO',[[-.1,(sourceY-1e-6)/1040],[-.1,(sourceY+1e-6)/1040]]),art,map).points.map(world);
    assert.ok(Math.hypot(near[1][0]-near[0][0],near[1][1]-near[0][1])<1e-4);
  }
});
test('顯示投影保留全部評分，包含無痠痛 0 及未評分 null',()=>{
  for(const severity of [null,0,1,5,10]) {
    assert.equal(S.project({...stroke('RO'),severity},art,map).severity,severity);
  }
});
test('nearby 只回傳已確認位置；跨膝、跨踝保留多項且不重複',()=>{
  assert.deepEqual(S.nearby({location:{regions:['thigh','knee','ankle'],surface:'inner'}},'zh'),{muscles:['大腿內收肌群'],joints:['膝關節','踝關節']});
  assert.deepEqual(S.nearby({location:{regions:['knee','lowerLeg','ankle','knee'],surface:'outer'}},'zh'),{muscles:['腓骨肌群（腓骨長肌、腓骨短肌）'],joints:['膝關節','踝關節']});
  assert.deepEqual(S.nearby({location:{regions:['lowerLeg','knee'],surface:'outer'}},'en'),{muscles:['Fibularis group (fibularis longus, fibularis brevis)'],joints:['Knee joint']});
});
test('不從舊 part、視角、前後側或未知位置猜肌肉；提示也不修改來源',()=>{
  const empty={muscles:[],joints:[]};
  for(const input of [null,{}, {view:'RI',part:'adductors.R'}, {location:null}, {location:{}}, {location:{regions:['thigh','lowerLeg'],surface:null}}, {view:'F',location:{regions:['thigh','lowerLeg'],surface:'front'}}, {view:'B',location:{regions:['thigh','lowerLeg'],surface:'back'}}, {location:{regions:['foot','hip','unknown'],surface:'outer'}}])assert.deepEqual(S.nearby(input,'zh'),empty);
  const input=freeze(stroke('RO')),before=JSON.parse(JSON.stringify(input));
  S.nearby(input,'zh');assert.deepEqual(input,before);
});
test('無效視角與缺少圖形明確失敗，不回寫或猜側別',()=>{
  assert.throws(()=>S.project(stroke('other'),art,map));
  assert.throws(()=>S.project(stroke('RI'),null,map));
});
function polygonContains(points,[x,y]) {
  let hit=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {
    const [xi,yi]=points[i],[xj,yj]=points[j];
    if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;
  }
  return hit;
}
test('回歸：原圖內 RO (160,500) 留於真實同側腿部，不消失',()=>{
  const result=S.project(stroke('RO',[[160/320,500/1040]]),art,map);
  const [x,y]=world(result.points[0]),bounds=S.legBounds(y,'R');
  assert.ok(x>bounds[0] && x<bounds[1]);
  assert.ok(polygonContains(S.clip('RO',art),result.points[0]));
  assert.equal(result.displaySourceView,'RO');
});
test('回歸：source 外 tail 不壓回投影帶內；前後視角無額外 clip',()=>{
  for(const view of ['RI','RO','LI','LO']) {
    const result=S.project(stroke(view,[[160/320,200/1040],[280/320,200/1040]]),art,map),clip=S.clip(view,art);
    assert.ok(polygonContains(clip,result.points[0]));
    assert.equal(polygonContains(clip,result.points[1]),false);
    for(const y of [40,990])assert.equal(polygonContains(clip,S.project(stroke(view,[[.5,y/1040]]),art,map).points[0]),false);
  }
  assert.equal(S.clip('F',art),null);assert.equal(S.clip('B',art),null);
});
test('逐列腿部界線與版本綁定目前 SVG 輪廓，沒有把手臂當成腿',()=>{
  const context=vm.createContext({});context.window=context;
  for(const name of ['female-map.js','freehand-art.js'])vm.runInContext(fs.readFileSync(require.resolve('../assets/'+name),'utf8'),context);
  const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
  assert.equal(G.sourceHash,hash(context.FREEHAND_ART.get('RO').outline));
  assert.equal(G.bodyHash,hash(context.FREEHAND_ART.get('F').outline));
  assert.equal(G.sourceVersion,context.FREEHAND_ART.version);
  assert.equal(G.rowStep,1);
  assert.ok(G.rows.length>900);
  for(const row of G.rows) {
    assert.ok(row[4]<row[5] && row[5]<=320);
    assert.ok(row[6]<row[7] && row[6]>=320);
    assert.ok(row[1]<row[2]);
  }
  for(const invalid of [NaN,650,1430])assert.equal(S.legBounds(invalid,'R'),null);
  assert.equal(S.legBounds(1100,'unknown'),null);
  const right=S.legBounds(987.727272727,'R');
  assert.ok(right[0]>230 && right[1]<310);
});
