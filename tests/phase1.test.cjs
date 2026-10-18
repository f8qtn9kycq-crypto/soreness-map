// 零依賴契約回歸：執行實際頁面程式，攔截本機儲存與下載。
process.env.TZ = 'Asia/Taipei';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const part = (s, n = '', t = ['sore']) => ({s, t, n});
const entries = [
  {id:101,date:'2026-10-01',workout:'private workout',parts:{'jKnee.R':part(4,'private note'),'traps.L':part(2)}},
  {id:102,date:'2026-10-02',workout:'other',parts:{'jHip.L':part(3)}},
  {id:103,date:'2026-10-03',workout:'legacy zero',parts:{'jKnee.R':part(0)}},
  {id:104,date:'2026-10-04',workout:'=SUM(1,2) "測試"\n下一行',parts:{'jKnee.R':part(7,'\t@敏感 "文字"\n第二行',['pain','tight'])}}
];
function app(initial = {}, fail = () => false, now) {
  const storage = {...initial}, nodes = {app:{innerHTML:''},'storage-status':{innerHTML:''}}, events = {}, blobs = [], downloads = [];
  const Clock=now?class extends Date {constructor(...args){super(...(args.length?args:[now]))}static now(){return new Date(now).getTime()}}:Date;
  const context = vm.createContext({Date:Clock,navigator:{language:'zh-TW'},Blob,
    URL:{createObjectURL(blob){blobs.push(blob);return 'blob:test'},revokeObjectURL(){}},setTimeout(){},
    localStorage:{getItem(k){return storage[k] ?? null},setItem(k,v){if(fail(k))throw Error('Storage unavailable');storage[k]=v}},
    document:{documentElement:{},getElementById(k){return nodes[k] || null},addEventListener(k,f){events[k]=f},
      createElement(){return {click(){downloads.push(this.download)},remove(){}}},body:{appendChild(){}}},
    FileReader:class {readAsText(file){this.result=file.text;this.onload()}}
  });
  vm.runInContext(source, context);
  return {storage,nodes,events,blobs,downloads,run:code=>vm.runInContext(code,context),
    plain:code=>JSON.parse(JSON.stringify(vm.runInContext(code,context))),
    import(payload){events.change({target:{id:'fi',value:'file',files:[{size:100,text:JSON.stringify(payload)}]}})}
  };
}
const history = () => app({'bodymap.v1':JSON.stringify(entries)});
const tests = [];
function test(name, f) {tests.push([name, f])}
// 以 CSV 語法解析實際下載，而非重建匯出的資料列。
function readCSV(text) {
  const rows = [];let row = [],cell = '',quoted = false;
  for(let n=0;n<text.length;n++) {
    const c=text[n];
    if(c==='"') {if(quoted && text[n+1]==='"'){cell+='"';n++}else quoted=!quoted}
    else if(!quoted && (c===',' || c==='\n')) {row.push(cell);cell='';if(c==='\n'){rows.push(row);row=[]}}
    else cell+=c;
  }
  row.push(cell);rows.push(row);return rows;
}
test('缺部位、舊 0、區間外資料不補 0；趨勢只畫獨立有效圓點', () => {
  const a=history();
  assert.deepEqual(a.plain('trendPoints(S.entries,"jKnee.R",Date.parse("2026-10-01T00:00:00"),Date.parse("2026-10-04T00:00:00"))'),[{d:'2026-10-01',s:4},{d:'2026-10-04',s:7}]);
  assert.equal(a.run('trendPoints(S.entries,"jKnee.R",Date.parse("2026-10-02T00:00:00"),Date.parse("2026-10-03T00:00:00")).length'),0);
  a.run('S.range=10000');const html=a.run('trend()');
  assert.equal((html.match(/<circle /g)||[]).length,2);assert.doesNotMatch(html,/<polyline/);
  a.run('S.tp="jFoot.L"');assert.match(a.run('trend()'),/沒有此部位的有效分數紀錄/);
});
test('臺灣凌晨依本地日期顯示今天、排除明天與第 8 天', () => {
  const dates=['2026-10-12','2026-10-13','2026-10-19','2026-10-20'];
  const list=dates.map((date,n)=>({id:n+1,date,workout:'',parts:{'jKnee.R':part(4)}}));
  const a=app({'bodymap.v1':JSON.stringify(list)},()=>false,'2026-10-19T01:00:00+08:00');
  a.run('S.range=7');const html=a.run('trend()');
  assert.equal((html.match(/<circle /g)||[]).length,2);assert.match(html,/>10-13<\/text>/);assert.match(html,/>10-19<\/text>/);
  assert.match(html,/<circle cx="314"/); // 今天位於日期軸終點，不受 UTC 日期解析影響。
});
test('1–10 意義保留；清除此部位只移除草稿且不改歷史', () => {
  const a=history(),before=a.plain('S.entries');
  a.run('S.sel="jKnee.R";S.draft.parts["jKnee.R"]={s:4,t:["pain"],n:"draft"}');
  const html=a.run('sheet()');assert.match(html,/data-v="0"[^>]*>清除此部位/);
  for(let n=1;n<=10;n++)assert.match(html,new RegExp(`data-v="${n}"`));
  a.run('H.sev("0")');assert.deepEqual(a.plain('S.draft.parts'),{});assert.deepEqual(a.plain('S.entries'),before);
  assert.deepEqual(JSON.parse(a.storage['bodymap.v1']),before);
});
test('37 個穩定部位、左右 key、storage key 與舊名稱匯入相容', () => {
  const a=history(),ids=['scm','traps','chest','deltoid','biceps','forearmF','abs','obliques','hipFlexor','quads','adductors','itBand','shin','rhomboid','lats','erector','rearDelt','rotator','triceps','forearmE','gluteMax','gluteMed','hamstrings','calf','achilles','jNeck','jShoulder','jElbow','jWrist','jHand','jThoracic','jLumbar','jSI','jHip','jKnee','jAnkle','jFoot'];
  assert.deepEqual(a.plain('Object.keys(N)'),ids);assert.deepEqual(a.plain('KS'),ids.flatMap(id=>['R','L'].map(side=>id+'.'+side)));
  assert.deepEqual(a.plain('[K,DK,LK]'),['bodymap.v1','bodymap.draft','bodymap.lang']);
  a.import([{id:200,date:'2026-10-05',workout:'',parts:{'knee.R':part(3)}}]);assert.equal(a.run('S.entries.at(-1).parts["jKnee.R"].s'),3);
  assert.deepEqual(a.plain('N.jSI'),['骨盆後側（薦髂附近）','Back pelvis (near SI joint)']);
  assert.deepEqual(a.plain('[T.zh.muscles,T.en.joints]'),['肌肉與軟組織','Joints & regions']);
});
test('分享預設不含自由文字、草稿；日期邊界含當天，ID 穩定且類型可讀', async () => {
  const a=history();a.run('S.draft.workout="DRAFT PRIVATE";S.draft.parts["jFoot.L"]={s:9,t:[],n:"DRAFT NOTE"};H.exs()');
  assert.equal(a.blobs.length,1);const csv=await a.blobs[0].text();
  assert.equal(a.blobs[0].type,'text/csv;charset=utf-8');assert.doesNotMatch(csv,/private|workout|note|DRAFT|SUM/);
  const rows=readCSV(csv.replace(/^\uFEFF/,''));assert.deepEqual(rows[0],['schema_version','entry_id','part_id','side','part_name','severity','types','date']);
  assert.deepEqual(rows[1],['1','101','jKnee','R','膝','4','痠','2026-10-01']);assert.equal(rows.length,5);
  a.run('S.share.start="2026-10-01";S.share.end="2026-10-01"');
  assert.equal(a.run('shareExport(S.entries,S.share,S.lang).rows.length'),3);assert.equal(a.run('shareExport(S.entries,S.share,S.lang).entries'),1);
  a.run('S.share.start="2026-10-04";S.share.end="2026-10-04";S.lang="en"');
  assert.equal(a.run('shareExport(S.entries,S.share,S.lang).rows[1][6]'),'Pain | Tight');
});
test('日期格式、倒置日期與空結果有清楚訊息且不下載', () => {
  const a=history();
  for(const [start,end,error] of [['2026-02-30','','shareInvalid'],['bad','','shareInvalid'],['2026-10-05','2026-10-01','shareInvalid'],['2026-10-03','2026-10-03','shareEmpty']]) {
    a.run(`S.share.start=${JSON.stringify(start)};S.share.end=${JSON.stringify(end)};H.exs()`);
    assert.equal(a.run('shareExport(S.entries,S.share,S.lang).error'),error);assert.equal(a.downloads.length,0);assert.match(a.run('sharePanel()'),/disabled/);assert.equal(a.run('S.msg'),a.run(`i('${error}')`));
  }
});
test('原生日期輸入不完整不當成空白不限；修正後預覽即更新', () => {
  const a=history();a.run('S.tab="trend"');
  a.events.change({target:{id:'share-start',value:'',validity:{valid:false,badInput:true}}});
  a.run('H.exs()');assert.equal(a.downloads.length,0);assert.match(a.nodes.app.innerHTML,/請輸入有效日期/);
  a.events.change({target:{id:'share-start',value:'2026-10-04',validity:{valid:true,badInput:false}}});
  assert.match(a.nodes.app.innerHTML,/可匯出 1 筆紀錄、1 列部位資料/);
  a.run('H.exs()');assert.equal(a.downloads.length,1);
});
test('文字需主動勾選且不持久化；CSV 引號、換行、Unicode 與公式防護適用所有欄位', async () => {
  const a=history(),before={...a.storage};
  a.events.change({target:{id:'share-text',checked:true}});assert.deepEqual(a.storage,before);assert.equal(app(a.storage).run('S.share.text'),false);
  a.run('H.exs()');const csv=await a.blobs[0].text(),rows=readCSV(csv.replace(/^\uFEFF/,''));
  assert.deepEqual(rows[0].slice(-2),['workout','note']);
  assert.deepEqual(rows.at(-1).slice(-2),["'=SUM(1,2) \"測試\"\n下一行","'\t@敏感 \"文字\"\n第二行"]);
  for(const value of ['=x','+x','-x','@x',' \uFEFF=x','\ttext','\rtext','\ntext'])assert.equal(a.run(`csvCell(${JSON.stringify(value)})`),'"\''+value+'"');
  assert.equal(a.run('csvCell(\'正常 "內容"\\n下一行\')'),'"正常 ""內容""\n下一行"');
  assert.match(a.run('sharePanel()'),/不會自動上傳 Google/);
});
test('完整 JSON 保真、原完整 CSV payload 保留，分享控制不污染備份', async () => {
  const a=history();a.run('S.share.text=true;S.share.start="2026-10-04";H.exj();H.exc()');
  assert.deepEqual(JSON.parse(await a.blobs[0].text()),{v:1,entries});
  const rows=readCSV((await a.blobs[1].text()).replace(/^\uFEFF/,''));
  assert.deepEqual(rows[0],['date','workout','part','side','severity','types','note']);assert.equal(rows.length,5);assert.equal(rows.at(-1)[5],'pain|tight');
  const b=app();b.import(JSON.parse(await a.blobs[0].text()));assert.deepEqual(b.plain('S.entries'),entries);
});
test('歷史儲存失敗保留草稿；恢復後重試，損壞原值不覆寫', async () => {
  const draft={date:'2026-10-05',workout:'unsaved',parts:{'jKnee.R':part(4,'keep me')}};let fail=true;
  const a=app({'bodymap.draft':JSON.stringify(draft)},key=>fail&&key==='bodymap.v1');
  a.run('H.save();H.save()');assert.equal(a.run('S.entries.length'),0);assert.deepEqual(a.plain('S.draft'),draft);assert.match(a.run('S.msg'),/Not saved/);
  a.run('H.exd()');assert.deepEqual(JSON.parse(await a.blobs[0].text()).entries[0].parts,draft.parts);
  fail=false;a.run('H.save()');assert.equal(JSON.parse(a.storage['bodymap.v1']).length,1);assert.deepEqual(a.plain('S.draft.parts'),{});
  const blocked=app({'bodymap.v1':'{broken','bodymap.draft':JSON.stringify(draft)});blocked.run('H.save()');assert.equal(blocked.storage['bodymap.v1'],'{broken');assert.deepEqual(blocked.plain('S.draft'),draft);
});
test('匯入寫入失敗留在記憶體可備份，重試不重複且無效匯入整批拒絕', () => {
  let fail=true;const a=app({},key=>fail&&key==='bodymap.v1');a.import({v:1,entries});assert.match(a.run('S.msg'),/was not saved/);assert.equal(a.storage['bodymap.v1'],undefined);
  fail=false;a.import({v:1,entries});assert.deepEqual(JSON.parse(a.storage['bodymap.v1']),entries);
  const b=app();b.import({v:1,entries:[entries[0],{...entries[1],parts:{'wrong.R':part(3)}}]});assert.equal(b.run('S.entries.length'),0);assert.equal(b.storage['bodymap.v1'],undefined);
});
(async () => {for(const [name,run] of tests){await run();console.log('PASS '+name)}console.log(`PASS ${tests.length} contracts`)})().catch(error=>{console.error(error);process.exitCode=1});
