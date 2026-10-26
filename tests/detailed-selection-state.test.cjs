const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const api=require('../prototypes/detailed-selection-state.js');
const fresh=()=>({records:new Map(),selected:null,undo:null,lang:'zh',view:'F',region:'chest'});
const choose=(state,zone='upper-inner',region='chest',side='R')=>api.select(state,{region,side,zone});
const entry=(state,zone='upper-inner',region='chest',side='R')=>state.records.get(api.key({region,side,zone}));

test('重點既有 3/10 只回到編輯；兩個細格分數保持獨立',()=>{
  const state=fresh();choose(state);api.rate(state,3);api.complete(state);
  choose(state,'lower-outer');api.rate(state,7);
  const snapshot=state.undo;
  assert.deepEqual(choose(state),{existing:true,replaced:0});
  assert.equal(state.undo,snapshot);
  assert.equal(entry(state).severity,3);assert.equal(entry(state).completed,true);
  api.rate(state,4);
  assert.equal(entry(state).completed,false);assert.equal(entry(state,'lower-outer').severity,7);
  assert.deepEqual(api.counts(state),{completed:0,pending:2,total:2});
  assert.equal(state.lang,'zh');assert.equal(state.view,'F');assert.equal(state.region,'chest');
});

test('row 3 分改 cell 5 分為替換，不相加；可復原原分數與完成狀態',()=>{
  const state=fresh();choose(state,'row-upper');api.rate(state,3);api.complete(state);
  assert.deepEqual(choose(state),{existing:false,replaced:1});api.rate(state,5);
  assert.equal(state.records.size,1);assert.equal(entry(state).severity,5);
  assert.equal(api.undo(state),true);
  assert.equal(entry(state,'row-upper').severity,3);assert.equal(entry(state,'row-upper').completed,true);
  assert.equal(state.selected,null);assert.equal(api.undo(state),false);
});

test('同向列與同向欄可多選；列欄、整區、無法定位互斥',()=>{
  const state=fresh();choose(state,'row-upper');choose(state,'row-lower');assert.equal(state.records.size,2);
  assert.equal(choose(state,'col-inner').replaced,2);choose(state,'col-outer');assert.equal(state.records.size,2);
  assert.equal(choose(state,'whole').replaced,2);assert.equal(state.records.size,1);
  assert.equal(choose(state,'unspecified').replaced,1);assert.equal(state.records.size,1);
  assert.equal(choose(state).replaced,1);assert.equal(state.records.size,1);
  assert.deepEqual(['whole','unspecified','row-upper','col-inner','upper-inner'].map(api.level),['whole','unknown','row','column','cell']);
});

test('替換、刪除、清空與復原保留跨部位跨側分數及先前編輯位置',()=>{
  const state=fresh();choose(state);api.rate(state,3);api.complete(state);
  choose(state,'lower-outer','chest','L');api.rate(state,6);api.complete(state);
  choose(state,'upper-inner','quads','R');api.rate(state,8);const selected=state.selected;
  choose(state,'whole');assert.equal(state.records.size,3);
  assert.equal(entry(state,'lower-outer','chest','L').severity,6);
  assert.equal(entry(state,'upper-inner','quads','R').severity,8);
  api.undo(state);assert.equal(state.selected,selected);
  const firstKey=api.key({region:'chest',side:'R',zone:'upper-inner'});
  assert.equal(api.remove(state,firstKey),true);assert.equal(state.selected,selected);
  api.undo(state);assert.equal(entry(state).severity,3);assert.equal(entry(state).completed,true);
  api.clear(state);assert.deepEqual(api.counts(state),{completed:0,pending:0,total:0});
  api.undo(state);assert.equal(state.records.size,3);assert.equal(state.selected,selected);
  assert.deepEqual(api.counts(state),{completed:2,pending:1,total:3});
});

test('快照及復原各自複製 Map 與紀錄，不與後續修改連動',()=>{
  const state=fresh();choose(state);api.rate(state,3);
  const original=entry(state);choose(state,'lower-outer');const snapshot=state.undo;
  original.severity=9;assert.equal(snapshot.records.values().next().value.severity,3);
  api.undo(state);const restored=entry(state);assert.notEqual(restored,original);
  restored.severity=5;assert.equal(snapshot.records.values().next().value.severity,3);
  snapshot.records.clear();assert.equal(state.records.size,1);
});

test('無效輸入不產生分數，未評分不能完成；空操作不覆蓋復原點',()=>{
  const state=fresh();assert.equal(api.rate(state,3),false);assert.equal(api.complete(state),false);
  for(const record of [null,{}, {region:'chest',side:'X',zone:'upper'}, {region:'chest',side:'R',zone:''}, {region:'chest',side:'R',zone:'row-'}, {region:'bad.region',side:'R',zone:'upper'}])assert.equal(api.select(state,record),null);
  assert.equal(state.records.size,0);choose(state);
  for(const value of [0,11,-1,1.5,NaN,Infinity,null,undefined,'3'])assert.equal(api.rate(state,value),false);
  assert.equal(entry(state).severity,null);assert.equal(api.complete(state),false);
  api.rate(state,1);assert.equal(api.complete(state),true);assert.equal(state.selected,null);
  api.clear(state);const snapshot=state.undo;
  assert.equal(api.clear(state),false);assert.equal(api.remove(state,'abs.R:whole'),false);assert.equal(state.undo,snapshot);
  api.undo(state);assert.equal(entry(state).severity,1);assert.equal(entry(state).completed,true);
});

test('瀏覽器匯出且完成操作不存取 DOM 或正式儲存',()=>{
  const window={};
  Object.defineProperty(window,'localStorage',{get(){throw new Error('不可存取正式儲存');}});
  vm.runInNewContext(fs.readFileSync(require.resolve('../prototypes/detailed-selection-state.js'),'utf8'),{window});
  const state=fresh();window.DETAIL_SELECTION_STATE.select(state,{region:'chest',side:'R',zone:'whole'});
  window.DETAIL_SELECTION_STATE.rate(state,10);assert.equal(window.DETAIL_SELECTION_STATE.complete(state),true);
  assert.equal(entry(state,'whole').completed,true);
});
