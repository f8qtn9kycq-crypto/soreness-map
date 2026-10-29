const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const L=require('../assets/freehand-location.js');
const D=require('../assets/freehand-data.js');
const leg={box:[0,0,320,1040],inside:(x,y)=>x>=110&&x<=200&&y>=65&&y<=975};
const stroke=(view,coordinates)=>({view,points:coordinates.map(([x,y])=>[x/320,y/1040])});
const at=(view,y)=>L.infer(stroke(view,[[160,y]]),leg);
const body={box:[0,0,100,100],inside:(x,y)=>x>=5&&x<=95&&y>=5&&y<=95};
const locations=[
  {id:'shin',view:'F',side:'R',bounds:[5,50,40,90]},
  {id:'shin',view:'F',side:'L',bounds:[60,50,95,90]},
  {id:'quads',view:'F',side:'R',bounds:[5,10,40,40]},
  {id:'jKnee',view:'F',side:'R',bounds:[5,40,40,50]},
  {id:'calf',view:'B',side:'L',bounds:[5,50,40,90]},
  {id:'calf',view:'B',side:'R',bounds:[60,50,95,90]}
];
const hit=(p,x,y)=>x>=p.bounds[0]&&y>=p.bounds[1]&&x<=p.bounds[2]&&y<=p.bounds[3];
const full=(view,points,map={locations})=>L.infer({view,points:points.map(([x,y])=>[x/100,y/100])},body,map,hit);
test('UMD 無 DOM 可載入；位置白名單與獨立資料驗證一致',()=>{
  const sandbox=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('../assets/freehand-location.js'),'utf8'),sandbox);
  assert.equal(typeof sandbox.FREEHAND_LOCATION.infer,'function');
  for(const region of L.REGIONS) {
    const value={regions:[region],side:null,surface:null};
    assert.deepEqual(D.validateLocation(value),L.validateLocation(value));
  }
});
test('明確左右腿內外視角自動描述體表；既有 key 只作相容索引',()=>{
  for(const view of ['RI','RO','LI','LO']) {
    const result=at(view,730);
    assert.deepEqual(result,{location:{regions:['lowerLeg'],side:view[0],surface:view[1]==='I'?'inner':'outer'},part:null});
    assert.equal(result.part,null);
  }
  assert.equal(L.label(at('RO',730).location,'zh'),'右小腿外側');
  assert.equal(L.label(at('LI',730).location,'en'),'Left lower leg · inner');
});
test('腿圖固定體表分界與跨區描繪保留多區域，不硬設單一 part',()=>{
  for(const [y,region] of [[65,'thigh'],[469,'thigh'],[470,'knee'],[579,'knee'],[580,'lowerLeg'],[894,'lowerLeg'],[895,'foot'],[975,'foot']]) assert.deepEqual(at('RO',y).location.regions,[region]);
  const result=L.infer(stroke('LI',[[160,350],[160,750]]),leg);
  assert.deepEqual(result,{location:{regions:['thigh','knee','lowerLeg'],side:'L',surface:'inner'},part:null});
  assert.equal(L.label(result.location,'zh'),'左大腿／膝部／小腿內側');
});
test('原生輪廓回呼排除人體外；缺少幾何驗證或只命中少數區域不猜位置',()=>{
  assert.deepEqual(L.infer(stroke('RO',[[20,730],[30,750]]),leg),{part:null});
  assert.deepEqual(L.infer(stroke('RO',[[160,730]]),{box:leg.box}),{part:null});
  assert.deepEqual(full('F',[[50,20],[50,90]]),{part:null});
  assert.deepEqual(full('F',[[35,60],[55,60]]),{part:null});
  for(const points of [[],[[NaN,0]],[[1.1,0]],[[0]],null]) assert.deepEqual(L.infer({view:'F',points},body,{locations},hit),{part:null});
});
test('正背面側別由命中圖形決定，背面左右不以畫面方向猜測',()=>{
  assert.deepEqual(full('F',[[20,65],[20,80]]),{location:{regions:['lowerLeg'],side:'R',surface:'front'},part:null});
  assert.deepEqual(full('B',[[20,65],[20,80]]),{location:{regions:['lowerLeg'],side:'L',surface:'back'},part:null});
  assert.deepEqual(full('B',[[80,65],[80,80]]),{location:{regions:['lowerLeg'],side:'R',surface:'back'},part:null});
});
test('跨兩側保留側別未知，跨區及重疊區不以最後或最多命中覆蓋',()=>{
  assert.deepEqual(full('F',[[20,70],[80,70]]),{location:{regions:['lowerLeg'],side:null,surface:'front'},part:null});
  assert.deepEqual(full('F',[[20,20],[20,80]]),{location:{regions:['thigh','knee','lowerLeg'],side:'R',surface:'front'},part:null});
  const overlap={locations:[locations[0],{...locations[0],id:'jKnee'}]};
  assert.deepEqual(full('F',[[20,70]],overlap),{location:{regions:['knee','lowerLeg'],side:'R',surface:'front'},part:null});
  const sideOverlap={locations:[locations[0],{...locations[0],side:'L'}]};
  assert.equal(full('F',[[20,70]],sideOverlap).location.side,null);
});
test('只用明確內外側地標描述；與其他圖形重疊時 surface 保守留空',()=>{
  for(const [id,surface] of [['adductors','inner'],['itBand','outer']]) {
    const map={locations:[{...locations[2],id}]};
    assert.deepEqual(full('F',[[20,20]],map),{location:{regions:['thigh'],side:'R',surface},part:null});
  }
  const overlap={locations:[locations[2],{...locations[2],id:'adductors'}]};
  assert.equal(full('F',[[20,20]],overlap).location.surface,null);
});
test('等弧長取樣不受輸入密度、停留點與方向影響；每筆最多 80 點',()=>{
  const sparse=[[160,300],[160,800]],dense=Array.from({length:501},(_,i)=>[160,300+i]);
  const paused=[...Array.from({length:300},()=>[160,300]),...dense];
  const expected=L.infer(stroke('RO',sparse),leg);
  for(const points of [dense,paused,[...dense].reverse()])assert.deepEqual(L.infer(stroke('RO',points),leg),expected);
  let calls=0;L.infer(stroke('RO',dense),{...leg,inside:(x,y)=>{calls++;return leg.inside(x,y);}});
  assert.equal(calls,80);
  assert.deepEqual(L.infer(stroke('RO',[[160,700],[160,700],[160,700]]),leg),at('RO',700));
});
test('每筆獨立推定；既有 part 不影響新位置，未知不繼承先前部位',()=>{
  const input={...stroke('RO',[[160,730]]),part:null};
  assert.equal(L.infer(input,leg).part,null);
  input.points=[[0,0]];
  assert.deepEqual(L.infer(input,leg),{part:null});
});
test('驗證回傳複本；拒絕自訂碼、重複區域、缺欄與錯誤型別',()=>{
  const source={regions:['thigh','knee'],side:null,surface:null},result=L.validateLocation(source);
  result.regions[0]='foot';assert.equal(source.regions[0],'thigh');
  for(const invalid of [null,[],{}, {...source,regions:[]},{...source,regions:['thigh','thigh']},{...source,regions:['__proto__']},{...source,side:'C'},{...source,side:undefined},{...source,surface:'deep'},{...source,surface:undefined}]) {
    assert.throws(()=>L.validateLocation(invalid));assert.throws(()=>D.validateLocation(invalid));
  }
});

test('粗筆跨區、跨側或內外地標時採保守描述，不只依中心線',()=>{
  const wideLeg={...stroke('RI',[[160,465]]),width:0.1};
  assert.deepEqual(L.infer(wideLeg,leg),{location:{regions:['thigh','knee'],side:'R',surface:'inner'},part:null});
  const map={locations:[{id:'adductors',view:'F',side:'R',bounds:[10,10,30,90]},{id:'quads',view:'F',side:'R',bounds:[30,10,60,90]}]};
  const input={view:'F',points:[[0.29,0.5]],width:0.1};
  const result=L.infer(input,body,map,hit);
  assert.equal(result.location.surface,null);assert.deepEqual(result.location.regions,['thigh']);
  const sides={locations:[{id:'shin',view:'F',side:'R',bounds:[10,10,50,90]},{id:'shin',view:'F',side:'L',bounds:[50,10,90,90]}]};
  assert.equal(L.infer({...input,points:[[0.49,0.5]]},body,sides,hit).location.side,null);
  assert.equal(L.infer({...input,points:[[0.49,0.5]]},body,sides,hit).part,null);
});

test('全身小腿按膝踝中線描述內外側；左右鏡像與跨中線粗筆保持保守',()=>{
 const map={locations:['R','L'].flatMap(side=>[{id:'shin',view:'F',side},{id:'jKnee',view:'F',side,labelPoint:[side==='R'?30:70,40]},{id:'jAnkle',view:'F',side,labelPoint:[side==='R'?30:70,90]}])};
 const detect=(side,x,width=.01)=>L.infer({view:'F',points:[[x/100,.65]],width},{...body,legBounds:(y,s)=>s==='R'?[10,50]:[50,90]},map,(p,px)=>p.id==='shin'&&p.side===side&&(side==='R'?px<50:px>=50));
 assert.equal(detect('R',15).location.surface,'outer');assert.equal(detect('R',42).location.surface,'inner');assert.equal(detect('L',85).location.surface,'outer');assert.equal(detect('L',58).location.surface,'inner');assert.equal(detect('R',30,.2).location.surface,'front');assert.equal(detect('R',39,.2).location.surface,'front');
});
