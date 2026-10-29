const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const A=require('../assets/freehand-anatomy.js');
const art={box:[0,0,100,100],inside:(x,y)=>x>=0&&x<=100&&y>=0&&y<=100};
const loc=(id,side='R',view='F',bounds=[0,0,100,100])=>({id,side,view,bounds});
const hit=(l,x,y)=>x>=l.bounds[0]&&x<=l.bounds[2]&&y>=l.bounds[1]&&y<=l.bounds[3];
const stroke=(points=[[0.5,0.5]],width=0,view='F')=>({view,points,width});
const analyze=(s,locations,a=art)=>A.analyze(s,a,{locations},hit);
const ids=result=>[...result.muscles,...result.joints].map(x=>x.id+':'+x.side);
const empty={muscles:[],joints:[]};

test('瀏覽器 UMD 匯出且沒有儲存或 DOM 依賴',()=>{
 const sandbox={};Object.defineProperty(sandbox,'localStorage',{get(){throw Error('不得讀取儲存');}});Object.defineProperty(sandbox,'document',{get(){throw Error('不得讀取DOM');}});
 vm.runInNewContext(fs.readFileSync(require.resolve('../assets/freehand-anatomy.js'),'utf8'),sandbox);
 assert.equal(typeof sandbox.FREEHAND_ANATOMY.analyze,'function');
 assert.deepEqual(JSON.parse(JSON.stringify(sandbox.FREEHAND_ANATOMY.analyze(null))),empty);
});
test('37 類既有 ID 全部明示映射或 fallback，每側名稱可重現',()=>{
 const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../assets/female-map.js'),'utf8'),sandbox);
 const family=[...new Set(sandbox.window.FEMALE_MAP.locations.map(x=>x.id))];
 assert.equal(family.length,37);assert.deepEqual([...family].sort(),Object.keys(A.MAPPING).sort());
 for(const id of family)for(const side of ['R','L']) {
  const expected=A.MAPPING[id],result=analyze(stroke(),[loc(id,side)]);
  if(expected.kind==='fallback'){assert.ok(expected.reason);assert.deepEqual(result,empty);}
  else assert.deepEqual(result[expected.kind],[{id:expected.id,side,zh:expected.zh,en:expected.en}]);
 }
});
test('弧長取樣不受事件密度、重複點、反向與 map 順序影響',()=>{
 const locations=[loc('deltoid','R','F',[0,0,45,100]),loc('biceps','R','F',[45,0,100,100])];
 const basic=stroke([[0.1,0.5],[0.9,0.5]],0.02),dense=stroke([[0.1,0.5],[0.1,0.5],[0.11,0.5],[0.12,0.5],[0.2,0.5],[0.9,0.5]],0.02);
 const expected=analyze(basic,locations);
 assert.deepEqual(ids(expected),['deltoid:R','biceps:R']);assert.deepEqual(analyze(dense,locations),expected);
 assert.deepEqual(analyze(stroke([...basic.points].reverse(),basic.width),locations.slice().reverse()),expected);
});
test('跨區域與關節保留多項，結果不只由起點決定',()=>{
 const result=analyze(stroke([[0.1,0.5],[0.9,0.5]]),[loc('biceps','R','F',[0,0,38,100]),loc('jElbow','R','F',[38,0,62,100]),loc('forearmF','R','F',[62,0,100,100])]);
 assert.deepEqual(ids(result),['biceps:R','forearmF:R','jElbow:R']);
});
test('左右依原始 map 保留；正背三角肌使用同一 canonical 名稱',()=>{
 const both=analyze(stroke([[0.1,0.5],[0.9,0.5]]),[loc('deltoid','L','F',[50,0,100,100]),loc('deltoid','R','F',[0,0,50,100])]);
 assert.deepEqual(ids(both),['deltoid:R','deltoid:L']);
 assert.deepEqual(analyze(stroke(),[loc('deltoid')]),analyze(stroke([[0.5,0.5]],0,'B'),[loc('rearDelt','R','B')]));
 assert.deepEqual(ids(analyze(stroke(),[loc('deltoid'),loc('deltoid')])) ,['deltoid:R']);
});
test('筆刷寬度涵蓋的鄰區可列出，單一邊緣樣本不列出',()=>{
 const broad=stroke([[0.5,0.5]],0.2);
 assert.deepEqual(ids(analyze(broad,[loc('biceps','R','F',[0,0,54,100]),loc('forearmF','R','F',[54,0,100,100])])),['biceps:R','forearmF:R']);
 assert.deepEqual(ids(analyze(broad,[loc('biceps'),loc('jElbow','R','F',[58.4,0,100,100])])),['biceps:R']);
});
test('輪廓外不參與肌肉命中；少量體內殘留與低總覆蓋不猜名稱',()=>{
 const clipped={...art,inside:(x,y)=>art.inside(x,y)&&x<=53};
 assert.deepEqual(ids(analyze(stroke([[0.5,0.5]],0.2),[loc('biceps','R','F',[0,0,53,100]),loc('jElbow','R','F',[54,0,100,100])],clipped)),['biceps:R']);
 assert.deepEqual(analyze(stroke([[0.9,0.5]],0.2),[loc('biceps')],clipped),empty);
 assert.deepEqual(analyze(stroke([[0.1,0.5],[0.9,0.5]]),[loc('biceps','R','F',[0,0,30,100])]),empty);
});
test('巨大、不確定、未知與側面投影回到區域顯示',()=>{
 for(const view of ['RI','RO','LI','LO','unknown'])assert.deepEqual(analyze(stroke(undefined,0,view),[loc('quads','R',view)]),empty);
 assert.deepEqual(analyze(stroke(),[loc('unrecognized')]),empty);
 assert.deepEqual(analyze(stroke(),['scm','traps','chest','deltoid','biceps','forearmF','abs'].map(id=>loc(id))),empty);
 assert.deepEqual(analyze(stroke([[0.1,0.1],[0.9,0.9]]),[loc('biceps','R','F',[0,0,5000,5000])],{box:[0,0,5000,5000],inside:()=>true}),empty);
 for(const value of [null,{},stroke([[NaN,0.5]]),stroke([[1.1,0.5]]),stroke(undefined,0.3)])assert.deepEqual(A.analyze(value,art,{locations:[loc('biceps')]},hit),empty);
});
test('舊 location、part、分數與輸入不變，不把儲存名稱當分析依據',()=>{
 const s={...stroke(),severity:7,part:'quads:R',location:{regions:['thigh'],side:'R',surface:'front'}},locations=[loc('biceps')];
 const original=JSON.stringify({s,locations});Object.freeze(s.points[0]);Object.freeze(s.points);Object.freeze(s);
 assert.deepEqual(ids(analyze(s,locations)),['biceps:R']);assert.equal(JSON.stringify({s,locations}),original);
 const first=analyze(s,locations);first.muscles[0].zh='changed';assert.equal(analyze(s,locations).muscles[0].zh,'肱二頭肌');
});
test('工作量上限為 80 中心與 13 個筆刷樣本，僅查相同 native view',()=>{
 let calls=0;const s=stroke([[0.1,0.1],[0.9,0.9]],0.1);
 const result=A.analyze(s,{box:[0,0,1000,1000],inside:()=>true},{locations:[loc('biceps'),loc('triceps','R','B')]},l=>{calls++;return l.view==='F';});
 assert.equal(calls,80*13);assert.deepEqual(ids(result),['biceps:R']);
});
