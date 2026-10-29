// 真實頁面＋圖形的零依賴契約；醫療正確性及像素命中另行驗證。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),asset=fs.readFileSync(path.join(root,'assets/female-map.js'),'utf8');
const source=fs.readFileSync(path.join(root,'legacy.html'),'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const baseline=JSON.parse(fs.readFileSync(path.join(root,'scripts/source/legacy-locations.json'),'utf8'));
function app(withArt=true){const storage={},events={},nodes={app:{innerHTML:''}};
 const c=vm.createContext({navigator:{language:'zh-TW'},Date,Blob,URL:{createObjectURL(){return 'blob:test'},revokeObjectURL(){}},setTimeout(){},localStorage:{getItem(k){return storage[k]||null},setItem(k,v){storage[k]=v}},document:{documentElement:{},getElementById(k){return nodes[k]||null},addEventListener(k,f){events[k]=f}}});
 c.window=c;if(withArt)vm.runInContext(asset,c);vm.runInContext(source,c);
 return {run:s=>vm.runInContext(s,c),plain:s=>JSON.parse(JSON.stringify(vm.runInContext(s,c))),events,nodes,storage};}
const a=app(),map=a.plain('femaleMap'),ids=Object.keys(baseline.N);
assert.equal(ids.length,37);assert.deepEqual(a.plain('KS'),ids.flatMap(id=>['R','L'].map(s=>id+'.'+s)));assert.deepEqual(a.plain('Z'),baseline.Z);assert.deepEqual(a.plain('N'),baseline.N);
assert.equal(new Set(map.locations.map(p=>p.id+'.'+p.side)).size,74);assert.equal(map.locations.length,92);
for(const view of ['F','B']){
 const expected=baseline.Z.filter(z=>z[1].includes(view)).flatMap(z=>['R','L'].map(s=>z[0]+'.'+s)).sort(),locations=map.locations.filter(p=>p.view===view);
 assert.deepEqual(locations.map(p=>p.id+'.'+p.side).sort(),expected);assert.equal(map.zooms[view].length,6);
 for(const box of map.zooms[view]){const n=box.split(/\s+/).map(Number);assert.equal(n.length,4);assert(n.every(Number.isFinite)&&n[2]>0&&n[3]>0)}
 for(const p of locations){assert.match(p.path,/^[Mm]/);assert(!/NaN|undefined|[<>]/.test(p.path));assert(p.labelPoint.every(Number.isFinite));const center=view==='F'?320:1140;assert((p.labelPoint[0]<center)===(view==='F'?p.side==='R':p.side==='L'),`${view}:${p.id}.${p.side}`)}
 for(const layer of ['m','j']){a.run(`S.view='${view}';S.layer='${layer}'`);const rendered=a.run(`body('${view}',{},1)`);const keys=a.plain(`visibleLocations('${view}')`);assert.equal((rendered.match(/data-location=/g)||[]).length,keys.length);for(const k of keys){assert(rendered.includes(`data-location="${k}"`));assert(a.run('locationChoices()').includes(`value="${k}"`));}}
}
console.log('PASS 37類／74 keys、原可見性、側別、6種放大、文字替代契約');
const all=Object.fromEntries(ids.flatMap((id,n)=>['R','L'].map(side=>[id+'.'+side,{s:n%10+1,t:['sore'],n:'fixture'}])));
a.run(`S.draft.parts=${JSON.stringify(all)}`);const prior=a.plain('S.draft');a.run("H.view('B');H.layer('j');H.zoom('4');H.lang();H.view('F')");assert.deepEqual(a.plain('S.draft'),prior);assert(!a.run("body('F',S.draft.parts,0)").includes('data-k='));
a.run('H.save()');assert.deepEqual(a.plain('S.entries[0].parts'),all);
a.run(`S.draft.parts=${JSON.stringify(all)};S.sel='traps.L';H.sev('0')`);assert.equal(a.run('S.entries[0].parts["traps.L"].s'),all['traps.L'].s);
a.run("S.mapCandidates=['jNeck.R','jNeck.L'];S.layer='j';S.view='F'");assert.match(a.run('mapCandidates()'),/data-k="jNeck.R"/);a.run("H.view('B')");assert.deepEqual(a.plain('S.mapCandidates'),[]);
console.log('PASS 畫面切換不改草稿、全部key儲存保真、摘要唯讀、候選清除');
const b=app(false);assert.match(b.nodes.app.innerHTML,/人體圖未載入/);assert.match(b.nodes.app.innerHTML,/id="map-part"/);b.events.change({target:{id:'map-part',value:'scm.R'}});assert.equal(b.run('S.sel'),null);assert.equal(b.run('S.draft.parts["scm.R"].s'),7);b.events.change({target:{id:'map-part',value:'scm.R'}});assert.equal(b.run('S.sel'),'scm.R');assert.match(b.nodes.app.innerHTML,/role="dialog"/);b.events.keydown({key:'Escape',preventDefault(){}});assert.equal(b.run('S.sel'),null);
console.log('PASS 圖形失敗仍可用清單開啟面板、Esc關閉');
// Regression for a subtle SVG rule: each source fragment starts a fresh coordinate system.
for(const p of map.locations)assert(!/z\s+m/i.test(p.path.replace(/z\s+M/g,'zM')),`relative fragment concatenation ${p.view}:${p.id}`);
assert.match(map.source.license,/Copyright \(c\) 2022 ELABBASSI Hicham/);
console.log('PASS MIT來源與獨立fragment起點保留');
const ime=app();ime.run('openPart("jNeck.R","#map-part");openPart("jNeck.R","#map-part")');
for(const extra of [{isComposing:true},{keyCode:229}]){ime.events.keydown({key:'Escape',preventDefault(){throw Error('IME Esc must remain native')},...extra});assert.equal(ime.run('S.sel'),'jNeck.R')}
ime.events.keydown({key:'Escape',preventDefault(){}});assert.equal(ime.run('S.sel'),null);
ime.run("S.mapCandidates=['traps.R','rhomboid.R'];H.tab('trend')");assert.deepEqual(ime.plain('S.mapCandidates'),[]);
console.log('PASS IME組字Esc不關閉、一般Esc仍有效、分頁切換清除候選');
const clicks=app();let chosen=[];
const svg={getScreenCTM(){return {inverse(){return null}}},createSVGPoint(){return {matrixTransform(){return {x:25,y:50}}}},querySelectorAll(){return chosen.map(key=>({dataset:{location:key},querySelector(){return {isPointInFill(point){assert.equal(point.x,25);assert.equal(point.y,50);return true}}}}))}};
function clickAt(keys){chosen=keys;clicks.events.click({detail:1,clientX:20,clientY:40,target:{closest(selector){return selector==='svg[data-map]'?svg:null}}})}
clickAt(['hipFlexor.R','adductors.R']);assert.equal(clicks.run('S.sel'),null);assert.deepEqual(clicks.plain('S.mapCandidates'),chosen);assert.equal(clicks.run('S.focusCandidates'),true);
clickAt([]);assert.match(clicks.run('S.msg'),/此處沒有可選位置/);assert.match(clicks.nodes.app.innerHTML,/role="status"/);assert.equal(clicks.run('S.sel'),null);assert.deepEqual(clicks.plain('S.mapCandidates'),[]);
clickAt(['deltoid.R']);assert.equal(clicks.run('S.sel'),null);assert.equal(clicks.run('S.draft.parts["deltoid.R"].s'),7);clickAt(['deltoid.R']);assert.equal(clicks.run('S.sel'),'deltoid.R');assert.deepEqual(clicks.plain('S.mapCandidates'),[]);assert.equal(clicks.run('S.focusReturn'),'g[data-location="deltoid.R"]');
console.log('PASS 點圖單一命中開啟／重疊不代選／空白不選，座標轉換與原觸發點還原');

assert(map.views.F.art.every(a=>a.slug==='head'));assert(map.views.B.art.every(a=>a.slug==='head'));console.log('PASS 體表輪廓不渲染內部肌肉解剖線，互動位置維持不變');
