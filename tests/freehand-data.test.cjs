// 新資料契約與儲存失敗回歸：node --test tests/freehand-data.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const D = require('../assets/freehand-data.js');
const copy = value => JSON.parse(JSON.stringify(value));
const stroke = (extra = {}) => ({id:'stroke-1',view:'F',artVersion:'surface-v1',points:[[0,0],[0.23,0.67],[1,1]],width:0.025,severity:4,part:'jKnee.R',note:'私密備註',...extra});
const draft = (extra = {}) => ({date:'2026-10-26',workout:'私密訓練',strokes:[stroke()],...extra});
const entry = (extra = {}) => ({id:'entry-1',...draft(),...extra});
const legacy = (extra = {}) => ({id:1,date:'2026-10-25',workout:'舊訓練',parts:{'jKnee.R':{s:0,t:['sore'],n:'舊備註'}},...extra});
function storage(initial = {}) {
  const values = {...initial}, writes = [];
  return {values,writes,failRead:new Set(),failWrite:new Set(),failRemove:new Set(),
    getItem(key) { if (this.failRead.has(key)) throw Error('read denied'); return Object.hasOwn(values,key) ? values[key] : null; },
    setItem(key,value) { if (this.failWrite.has(key)) throw Error('quota'); writes.push(['set',key]); values[key] = value; },
    removeItem(key) { if (this.failRemove.has(key)) throw Error('remove denied'); writes.push(['remove',key]); delete values[key]; }
  };
}
function readCSV(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i=0;i<text.length;i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i+1] === '"') { cell+='"'; i++; } else quoted = !quoted; }
    else if (!quoted && (c === ',' || c === '\n')) { row.push(cell); cell=''; if (c === '\n') { rows.push(row); row=[]; } }
    else if (!(c === '\r' && !quoted)) cell+=c;
  }
  row.push(cell); rows.push(row); return rows;
}
test('UMD 在沒有 DOM 或儲存區的環境可載入，既有 74 key 保持穩定', () => {
  const sandbox = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/freehand-data.js'),'utf8'),sandbox);
  assert.equal(typeof sandbox.FREEHAND_DATA.createStore,'function');
  assert.equal(D.PARTS.length,74);
  assert.equal(new Set(D.PARTS).size,74);
  assert.deepEqual(D.KEYS,{entries:'bodymap.draw.v2',draft:'bodymap.draw.draft.v2'});
});
test('六個視角與邊界座標可往返；驗證回傳深複本，草稿可未評分', () => {
  for (const view of D.VIEWS) {
    const source = draft({strokes:[stroke({view,severity:null,part:null})]});
    const normalized = D.validateDraft(source);
    assert.deepEqual(normalized,source);
    normalized.strokes[0].points[0][0] = 0.5;
    assert.equal(source.strokes[0].points[0][0],0);
    assert.throws(() => D.validateEntry({id:'entry-1',...source}));
  }
  assert.deepEqual(D.validateDraft(draft({strokes:[]})).strokes,[]);
  assert.throws(() => D.validateEntry(entry({strokes:[]})));
  assert.equal(D.validateEntry(entry({strokes:[stroke({severity:1}),stroke({id:'stroke-2',severity:10})]})).strokes.length,2);
});
test('拒絕不安全 ID、錯誤版本、重複筆畫與超限文字，不猜日期或分數', () => {
  for (const id of ['', '<svg>', '../a', 'a b', 'a_1', 'a'.repeat(129)]) assert.throws(() => D.validateEntry(entry({id})));
  for (const date of ['2026-02-29','2026-13-01','2026-10-26T00:00:00','2026-1-01','']) assert.throws(() => D.validateDraft(draft({date})));
  assert.equal(D.validDate('2024-02-29'),true);
  for (const severity of [-1,11,1.5,NaN,Infinity,'4',undefined]) assert.throws(() => D.validateDraft(draft({strokes:[stroke({severity})]})));
  for (const extra of [{view:'SIDE'},{artVersion:'surface-v2'},{part:'jKnee.C'},{part:'knee.R'},{part:'__proto__'}, {note:'x'.repeat(10001)}]) assert.throws(() => D.validateDraft(draft({strokes:[stroke(extra)]})));
  assert.throws(() => D.validateDraft(draft({workout:'x'.repeat(10001)})));
  assert.throws(() => D.validateDraft(draft({strokes:[stroke(),stroke()]})));
  assert.equal(D.validateDraft(draft({workout:'x'.repeat(10000),strokes:[stroke({note:'x'.repeat(10000)})]})).workout.length,10000);
});
test('座標、筆寬、筆畫數與每筆點數均有安全界線', () => {
  for (const points of [[],[[0]],[[0,0,0]],[[NaN,0]],[[Infinity,0]],[[0,-0.01]],[[1.01,0]], [['0',0]],Array.from({length:2001},()=>[0,0])]) assert.throws(() => D.validateDraft(draft({strokes:[stroke({points})]})));
  for (const width of [0,0.0009,0.2001,NaN,Infinity,'0.02']) assert.throws(() => D.validateDraft(draft({strokes:[stroke({width})]})));
  for (const width of [0.001,0.2]) assert.equal(D.validateDraft(draft({strokes:[stroke({width})]})).strokes[0].width,width);
  const strokes = Array.from({length:200},(_,i) => stroke({id:'s-'+i,points:[[0.5,0.5]]}));
  assert.equal(D.validateDraft(draft({strokes})).strokes.length,200);
  assert.throws(() => D.validateDraft(draft({strokes:[...strokes,stroke({id:'extra'})]})));
  assert.equal(D.validateDraft(draft({strokes:[stroke({points:Array.from({length:2000},()=>[0,0])})]})).strokes[0].points.length,2000);
});
test('完整 v2 備份往返保留幾何、草稿、自由文字與舊版 0', () => {
  const unsaved = draft({strokes:[stroke({severity:null,part:null,view:'LI'})]});
  const backup = D.makeBackup([legacy()],[entry()],unsaved);
  assert.deepEqual(D.parseBackup(JSON.stringify(backup)),{entries:[legacy()],drawEntries:[entry()],drawDraft:unsaved});
  assert.deepEqual(D.parseBackup(D.makeBackup([],[])),{entries:[],drawEntries:[]});
  assert.equal(backup.entries[0].parts['jKnee.R'].s,0);
  assert.equal(backup.drawDraft.strokes[0].severity,null);
});
test('v1、無版本包裝與純陣列維持相容，舊別名依既有對照轉換', () => {
  const source = legacy({parts:{'knee.R':{s:3,t:['pain','pain'],n:'保留'}}});
  for (const payload of [[source],{v:1,entries:[source]},{entries:[source]}]) {
    assert.deepEqual(D.parseBackup(payload),{entries:[legacy({parts:{'jKnee.R':{s:3,t:['pain'],n:'保留'}}})],drawEntries:[]});
  }
  for (const payload of [{v:3,entries:[],drawEntries:[]},{v:2,entries:[]},{v:1,entries:[legacy(),legacy()]},{v:1,entries:[legacy({parts:{'knee.R':{s:3,t:[],n:''},'jKnee.R':{s:4,t:[],n:''}}})]}]) assert.throws(() => D.parseBackup(payload));
  assert.throws(() => D.parseBackup({v:1,entries:[legacy({parts:{'jKnee.R':{s:3,t:['unknown'],n:''}}})]}));
});
test('相同繪圖 ID 同內容去重、異內容整批拒絕，不因屬性順序改變誤判', () => {
  const same = {strokes:entry().strokes,workout:entry().workout,date:entry().date,id:entry().id};
  assert.deepEqual(D.mergeEntries([entry()],[same,entry({id:'entry-2'})]),[entry(),entry({id:'entry-2'})]);
  assert.throws(() => D.mergeEntries([entry()],[entry({id:'entry-2'}),entry({workout:'不同'})]));
  assert.throws(() => D.parseBackup({v:2,entries:[],drawEntries:[entry(),entry({strokes:[stroke({severity:7})]})]}));
  assert.equal(D.parseBackup({v:2,entries:[],drawEntries:[entry(),same]}).drawEntries.length,1);
});
test('分享 CSV 預設排除訓練與備註；選入文字後正確引號、換行與公式保護', () => {
  const source = entry({workout:'\t=SUM(1,2) "測試"\n下一行',strokes:[stroke({note:'\n @私密 "備註"\r\n第二行'})]});
  const plain = D.csv([source]);
  assert.doesNotMatch(plain,/SUM|私密|workout|note|下一行/);
  assert.deepEqual(readCSV(plain),[['entry_id','date','stroke_id','view','side','part','severity'],['entry-1','2026-10-26','stroke-1','F','R','jKnee.R','4']]);
  const rows = readCSV(D.csv([source],true));
  assert.equal(rows[1][7],"'"+source.workout);
  assert.equal(rows[1][8],"'"+source.strokes[0].note);
  for (const prefix of ['=','+','-','@',' \t=','\uFEFF=']) assert.equal(readCSV(D.csv([entry({workout:prefix+'payload'})],true))[1][7],"'"+prefix+'payload');
});
test('CSV 側別採明確腿部視角或正背面手動標籤，未知側別留白且不推定部位', () => {
  const cases = [
    ['RI',null,'R'],['RO',null,'R'],['LI',null,'L'],['LO',null,'L'],
    ['F','jKnee.R','R'],['F','jHip.L','L'],['B','calf.R','R'],['B','calf.L','L'],
    ['F',null,''],['B',null,'']
  ];
  for (const [view,part,side] of cases) {
    const rows = readCSV(D.csv([entry({strokes:[stroke({view,part,points:[[0.05,0.99]]})]})]));
    assert.equal(rows[0][4],'side');
    assert.equal(rows[1][4],side,view+' / '+part);
    assert.equal(rows[1][5],part ?? '');
  }
});
test('趨勢保留同日同部位各筆分數，不平均、不補 0、不帶入缺少部位', () => {
  const entries = [entry({id:'e-2',date:'2026-10-26',strokes:[stroke(),stroke({id:'s-2',severity:8}),stroke({id:'s-3',severity:3,part:null})]}),entry({id:'e-1',date:'2026-10-24',strokes:[stroke({severity:2})]}),entry({id:'e-3',date:'2026-10-25',strokes:[stroke({part:'jHip.L'})]})];
  assert.deepEqual(D.trend(entries,'jKnee.R'),[{entryId:'e-1',strokeId:'stroke-1',date:'2026-10-24',severity:2},{entryId:'e-2',strokeId:'stroke-1',date:'2026-10-26',severity:4},{entryId:'e-2',strokeId:'s-2',date:'2026-10-26',severity:8}]);
  assert.deepEqual(D.trend(entries,'jFoot.L'),[]);
  assert.deepEqual(D.trend(entries,null),[{entryId:'e-2',strokeId:'s-3',date:'2026-10-26',severity:3}]);
});
test('草稿持久保存、儲存後清空與刪除歷史；不讀寫舊 key', () => {
  const rawLegacy = JSON.stringify([legacy()]), rawLegacyDraft = '{raw old draft}';
  const s = storage({'bodymap.v1':rawLegacy,'bodymap.draft':rawLegacyDraft});
  s.failRead.add('bodymap.v1'); s.failRead.add('bodymap.draft');
  const store = D.createStore(s);
  assert.equal(store.load().entries.length,0);
  assert.deepEqual(store.saveDraft(draft()),{ok:true});
  assert.deepEqual(D.createStore(s).load().draft,draft());
  assert.deepEqual(store.saveEntry(entry()),{ok:true});
  const loaded = D.createStore(s).load();
  assert.deepEqual(loaded.entries,[entry()]);
  assert.deepEqual(loaded.draft,{date:'2026-10-26',workout:'',strokes:[]});
  loaded.entries[0].strokes[0].severity=10;
  assert.equal(store.load().entries[0].strokes[0].severity,4);
  assert.deepEqual(store.deleteEntry('entry-1'),{ok:true});
  assert.deepEqual(store.load().entries,[]);
  assert.equal(s.values['bodymap.v1'],rawLegacy); assert.equal(s.values['bodymap.draft'],rawLegacyDraft);
  assert.ok(s.writes.every(([,key])=>Object.values(D.KEYS).includes(key)));
});
test('混合匯入以一次寫入保存新舊紀錄與匯入草稿，既有草稿不會覆蓋還原內容', () => {
  const s = storage(), store = D.createStore(s);
  assert.equal(store.saveEntry(entry()).ok,true);
  assert.equal(store.saveDraft(draft({workout:'較舊草稿'})).ok,true);
  const restoredDraft = draft({workout:'匯入草稿',strokes:[stroke({severity:null})]});
  const payload = D.parseBackup(D.makeBackup([legacy()],[entry({id:'entry-2'})],restoredDraft));
  const before = s.writes.length;
  assert.deepEqual(store.importBackup(payload),{ok:true});
  assert.equal(s.writes.length-before,1);
  assert.equal(s.writes.at(-1)[1],D.KEYS.entries);
  const loaded = D.createStore(s).load();
  assert.deepEqual(loaded.entries,[entry(),entry({id:'entry-2'})]);
  assert.deepEqual(loaded.importedLegacy,[legacy()]);
  assert.deepEqual(loaded.draft,restoredDraft);
  assert.deepEqual(store.saveDraft(draft({workout:'還原後編輯'})),{ok:true});
  assert.equal(store.load().draft.workout,'還原後編輯');
});
test('匯入沒有草稿保留目前草稿；舊 ID 碰撞沿用既有優先且不丟繪圖', () => {
  const s = storage(), store = D.createStore(s);
  store.saveDraft(draft());
  assert.equal(store.importBackup([legacy()]).ok,true);
  assert.equal(store.importBackup(D.makeBackup([legacy({workout:'相同 ID 另一內容'})],[entry()])).ok,true);
  assert.deepEqual(store.load().draft,draft());
  assert.deepEqual(store.load().importedLegacy,[legacy()]);
  assert.deepEqual(store.load().entries,[entry()]);
  const backup = D.makeBackup([legacy(),legacy({workout:'匯入碰撞'})],store.load().entries);
  assert.deepEqual(backup.entries,[legacy()]);
  assert.deepEqual(backup.drawEntries,[entry()]);
});
test('任一匯入紀錄無效、繪圖碰撞或寫入失敗皆整批不變', () => {
  const s = storage(), store = D.createStore(s);
  store.saveEntry(entry()); store.saveDraft(draft());
  const before = copy(s.values), writeCount = s.writes.length;
  for (const payload of [{v:2,entries:[legacy()],drawEntries:[entry({id:'entry-2'}),entry({workout:'碰撞'})]}, {v:2,entries:[legacy()],drawEntries:[entry({id:'entry-2',strokes:[stroke({severity:null})]})]}]) {
    assert.equal(store.importBackup(payload).ok,false);
    assert.deepEqual(s.values,before); assert.equal(s.writes.length,writeCount);
  }
  s.failWrite.add(D.KEYS.entries);
  assert.equal(store.importBackup(D.makeBackup([legacy()],[entry({id:'entry-2'})],draft({workout:'不應套用'}))).ok,false);
  assert.deepEqual(s.values,before);
  assert.deepEqual(store.load().importedLegacy,[]);
  assert.equal(store.load().draft.workout,'私密訓練');
});
test('歷史寫入失敗不清草稿；草稿清理失敗仍成功且重新載入不重現已存草稿', () => {
  const s = storage(), store = D.createStore(s);
  store.saveDraft(draft());
  const rawDraft = s.values[D.KEYS.draft];
  s.failWrite.add(D.KEYS.entries);
  assert.equal(store.saveEntry(entry()).ok,false);
  assert.equal(s.values[D.KEYS.draft],rawDraft);
  assert.deepEqual(store.load().entries,[]);
  s.failWrite.clear(); s.failRemove.add(D.KEYS.draft);
  const result = store.saveEntry(entry());
  assert.equal(result.ok,true); assert.match(result.warning,/清理失敗/);
  assert.equal(s.values[D.KEYS.draft],rawDraft);
  assert.deepEqual(D.createStore(s).load().entries,[entry()]);
  assert.deepEqual(D.createStore(s).load().draft.strokes,[]);
});
test('只有既有草稿且儲存全面拒寫時，混合匯入不會部分套用或覆蓋草稿', () => {
  const s = storage();
  const existingDraft = draft({workout:'尚未儲存的既有草稿',strokes:[stroke({severity:null,part:null})]});
  assert.equal(D.createStore(s).saveDraft(existingDraft).ok,true);
  const before = copy(s.values), writesBefore = s.writes.length;
  s.failWrite.add(D.KEYS.entries); s.failWrite.add(D.KEYS.draft);
  const store = D.createStore(s);
  const result = store.importBackup(D.makeBackup([legacy()],[entry()],draft({workout:'不可部分還原'})));
  assert.equal(result.ok,false);
  assert.deepEqual(s.values,before); assert.equal(s.writes.length,writesBefore);
  assert.deepEqual(store.load().entries,[]); assert.deepEqual(store.load().importedLegacy,[]);
  assert.deepEqual(store.load().draft,existingDraft);
  assert.deepEqual(D.createStore(s).load().draft,existingDraft);
});
test('損壞或拒讀的儲存區保留原始值並封鎖該 key 覆寫', () => {
  for (const raw of ['{broken',JSON.stringify({v:2,revision:0,drawEntries:[entry({strokes:[]})],importedLegacy:[],drawDraft:draft()})]) {
    const s = storage({[D.KEYS.entries]:raw}), store = D.createStore(s);
    assert.deepEqual(store.load().blocked,[D.KEYS.entries]);
    assert.equal(store.saveEntry(entry()).ok,false);
    assert.equal(store.saveDraft(draft()).ok,false);
    assert.equal(store.importBackup(D.makeBackup([legacy()],[entry()])).ok,false);
    assert.equal(store.deleteEntry('entry-1').ok,false);
    assert.equal(s.values[D.KEYS.entries],raw); assert.equal(s.writes.length,0);
  }
  const s = storage({[D.KEYS.draft]:'{broken'}), store = D.createStore(s);
  assert.deepEqual(store.load().blocked,[D.KEYS.draft]);
  assert.equal(store.saveDraft(draft()).ok,false);
  const result = store.saveEntry(entry());
  assert.equal(result.ok,true); assert.match(result.warning,/原始資料仍保留/);
  assert.equal(s.values[D.KEYS.draft],'{broken');
  assert.ok(s.writes.every(([,key]) => key !== D.KEYS.draft));
  const denied = storage(); denied.failRead.add(D.KEYS.entries);
  assert.equal(D.createStore(denied).saveEntry(entry()).ok,false);
  assert.equal(denied.writes.length,0);
});
test('新草稿寫入失敗回傳失敗，不改原草稿；刪除仍保留匯入舊資料與未存草稿', () => {
  const s = storage(), store = D.createStore(s);
  store.importBackup(D.makeBackup([legacy()],[entry()])); store.saveDraft(draft());
  const before = s.values[D.KEYS.draft];
  s.failWrite.add(D.KEYS.draft);
  assert.equal(store.saveDraft(draft({workout:'無法保存'})).ok,false);
  assert.equal(s.values[D.KEYS.draft],before);
  s.failWrite.clear();
  assert.equal(store.deleteEntry('entry-1').ok,true);
  assert.deepEqual(store.load().importedLegacy,[legacy()]);
  assert.deepEqual(store.load().draft,draft());
});

test('明確0分可保存備份與趨勢；null仍未評分且舊0保真',()=>{const e=entry({strokes:[stroke({severity:0})]});assert.equal(D.validateEntry(e).strokes[0].severity,0);assert.equal(D.parseBackup(D.makeBackup([], [e])).drawEntries[0].strokes[0].severity,0);assert.equal(D.trend([e],'jKnee.R')[0].severity,0);assert.throws(()=>D.validateEntry(entry({strokes:[stroke({severity:null})]})));});

test('新體表位置可往返草稿、紀錄、JSON 備份；舊筆畫不補欄位且 0/null 保真',()=>{
  const location={regions:['lowerLeg'],side:'R',surface:'outer'};
  const saved=entry({strokes:[stroke({location,severity:0,view:'RO',part:'calf.R'})]});
  const unsaved=draft({strokes:[stroke({location,severity:null,view:'RO',part:'calf.R'})]});
  const parsed=D.parseBackup(JSON.stringify(D.makeBackup([legacy()],[saved],unsaved)));
  assert.deepEqual(parsed,{entries:[legacy()],drawEntries:[saved],drawDraft:unsaved});
  const normalized=D.validateEntry(saved);normalized.strokes[0].location.regions[0]='foot';
  assert.equal(saved.strokes[0].location.regions[0],'lowerLeg');
  assert.equal(Object.hasOwn(D.validateEntry(entry()).strokes[0],'location'),false);
  const s=storage(),store=D.createStore(s);
  assert.equal(store.saveDraft(unsaved).ok,true);assert.deepEqual(store.load().draft,unsaved);
  assert.equal(store.saveEntry(saved).ok,true);assert.deepEqual(store.load().entries,[saved]);
});
test('無效新增位置整批拒絕，不覆寫既有資料；相同 ID 不同位置視為碰撞',()=>{
  const location={regions:['lowerLeg'],side:'R',surface:'outer'};
  for(const invalid of [null,{},undefined,{...location,regions:['calf']},{...location,regions:[]},{...location,regions:['lowerLeg','lowerLeg']},{...location,side:'right'},{...location,surface:'deep'}]) assert.throws(()=>D.validateDraft(draft({strokes:[stroke({location:invalid})]})));
  const saved=entry({strokes:[stroke({location})]});
  assert.throws(()=>D.mergeEntries([saved],[entry({strokes:[stroke({location:{...location,surface:'inner'}})]})]));
  const s=storage(),store=D.createStore(s);store.saveEntry(entry());const before=copy(s.values);
  assert.equal(store.importBackup({v:2,entries:[],drawEntries:[entry({id:'new',strokes:[stroke({location:null})]})]}).ok,false);
  assert.deepEqual(s.values,before);
});
test('CSV 位置欄保留體表描述；舊列留空且原欄位與自由文字位置不變',()=>{
  const location={regions:['thigh','knee'],side:'R',surface:'inner'};
  const saved=entry({strokes:[stroke({location,part:null}),stroke({id:'old'})]});
  const rows=readCSV(D.csv([saved]));
  assert.equal(rows[0].at(-1),'location');assert.deepEqual(JSON.parse(rows[1].at(-1)),location);assert.equal(rows[2].at(-1),'');
  assert.equal(rows[1][4],'R');assert.equal(rows[1][5],'');assert.equal(rows[1][6],'4');
  const withText=readCSV(D.csv([saved],true));assert.equal(withText[0][7],'workout');assert.equal(withText[0][8],'note');assert.equal(withText[0][9],'location');
});

test('自動體表位置趨勢不指定肌肉，區域順序不同仍是一個觀察',()=>{const l={regions:['thigh','knee'],side:'R',surface:'inner'};const e=entry({strokes:[stroke({part:null,location:l})]});assert.equal(D.trend([e],{location:{...l,regions:['knee','thigh']}}).length,1);assert.equal(D.trend([e],'quads.R').length,0);assert.throws(()=>D.trend([e],{location:{...l,side:'invalid'}}));});
