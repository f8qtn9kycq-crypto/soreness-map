// 合成使用情境；不代表真人、真機或臨床證據。
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const url=process.env.APP_URL||'http://127.0.0.1:8770/';
const old=[{id:101,date:'2026-10-01',workout:'old workout',parts:{'jKnee.R':{s:3,t:['sore'],n:'old note'}}}];
async function screen(page,x,y){return page.evaluate(({x,y})=>{const s=document.querySelector('#drawing'),p=s.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(s.getScreenCTM());return [q.x,q.y];},{x,y});}
async function paint(page,points){await page.locator('#drawing').scrollIntoViewIfNeeded();const ps=[];for(const p of points)ps.push(await screen(page,...p));await page.mouse.move(...ps[0]);await page.mouse.down();for(const p of ps.slice(1))await page.mouse.move(...p,{steps:8});await page.mouse.up();}
async function clickWorld(page,x,y){await page.locator('#drawing').scrollIntoViewIfNeeded();await page.mouse.click(...await screen(page,x,y));}
async function score(page,n){await page.locator(`#scores [data-value="${n}"]`).click();assert.equal(await page.locator('#editor').isVisible(),false);}
async function draft(page){return page.evaluate(()=>window.FREEHAND_DATA.createStore(localStorage).load().draft);}
async function go(page,tab){await page.locator(`[data-tab="${tab}"]`).click();}
(async()=>{fs.mkdirSync('output/playwright',{recursive:true});const report=[];
for(const [engineName,engine]of [['chromium',chromium],['webkit',webkit]]){
const browser=await engine.launch();try{
const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
await context.addInitScript(data=>{if(!localStorage.getItem('seeded')){localStorage.setItem('bodymap.v1',JSON.stringify(data));localStorage.setItem('bodymap.draft',JSON.stringify({date:'2026-10-26',workout:'legacy draft',parts:{}}));localStorage.setItem('seeded','1');}},old);
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
assert((await page.locator('#drawing').boundingBox()).y<300,'body available in first viewport');
const point=await page.evaluate(()=>window.FEMALE_MAP.locations.find(p=>p.id==='quads'&&p.side==='R'&&p.view==='F').labelPoint);
await paint(page,[point,[point[0],point[1]+60]]);assert.equal((await draft(page)).strokes.length,1);assert.equal((await draft(page)).strokes[0].severity,null);
await score(page,3);await page.reload();assert.equal((await draft(page)).strokes[0].severity,3);
await page.locator('[data-action="select"]').click();assert.match(await page.locator('#editor-title').innerText(),/3\/10/);
await page.locator('#stroke-options').evaluate(e=>e.open=true);await page.selectOption('#part','quads.R');await page.locator('#note').fill('private note');await page.locator('#close-editor').click();
await page.locator('[data-action="mode"][data-value="focus"]').click();await clickWorld(page,...point);const focused=await page.locator('#drawing').getAttribute('viewBox');assert.notEqual(focused,await page.evaluate(()=>window.FEMALE_MAP.views.F.viewBox));
const before=JSON.stringify((await draft(page)).strokes[0].points);await page.locator('[data-action="zoom"][data-value="out"]').click();assert.equal(JSON.stringify((await draft(page)).strokes[0].points),before);
await page.locator('#surfaces').evaluate(e=>e.open=true);await page.locator('[data-action="view"][data-value="RI"]').click();
await paint(page,[[165,240],[160,470],[167,700]]);await score(page,5);
await page.locator('[data-action="view"][data-value="RO"]').click();await paint(page,[[160,650],[160,750]]);await score(page,7);
assert.equal((await draft(page)).strokes.length,3);assert.deepEqual((await draft(page)).strokes.map(s=>s.view),['F','RI','RO']);
await page.locator('[data-action="select"]').nth(1).click();await score(page,6);await page.locator('[data-action="undo"]').click();assert.equal((await draft(page)).strokes[1].severity,5);
await page.locator('[data-action="select"]').nth(2).click();await page.locator('#remove').click();assert.equal((await draft(page)).strokes.length,2);await page.locator('[data-action="undo"]').click();assert.equal((await draft(page)).strokes.length,3);
await page.locator('#clear').click();assert.equal((await draft(page)).strokes.length,0);await page.locator('[data-action="undo"]').click();assert.equal((await draft(page)).strokes.length,3);
await page.locator('#save').click();assert(await page.locator('#history').isVisible());assert.equal(await page.locator('#history-list article').count(),1);await page.reload();await go(page,'history');assert.equal(await page.locator('#history-list article').count(),1);assert.match(await page.locator('#legacy-history').innerText(),/old note/);
assert.equal(await page.evaluate(()=>localStorage.getItem('bodymap.v1')),JSON.stringify(old));assert.match(await page.evaluate(()=>localStorage.getItem('bodymap.draft')),/legacy draft/);
await go(page,'trend');await page.selectOption('#trend-part','quads.R');assert.match(await page.locator('#trend-results').innerText(),/3\/10/);await page.selectOption('#trend-part','calf.R');assert.doesNotMatch(await page.locator('#trend-results').innerText(),/\/10/);
await go(page,'backup');let dl=page.waitForEvent('download');await page.locator('#export-all').click();let download=await dl;const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.v,2);assert.equal(backup.drawEntries.length,1);assert.equal(backup.entries.length,1);
dl=page.waitForEvent('download');await page.locator('#export-csv').click();download=await dl;const csv=fs.readFileSync(await download.path(),'utf8');assert(!csv.includes('private note'));assert(!csv.includes('workout'));assert.match(csv,/RI/);
await page.setInputFiles('#import-file',{name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>document.querySelector('#backup-status').textContent.includes('已匯入'));
const stored=await page.evaluate(()=>localStorage.getItem('bodymap.draw.v2'));await page.setInputFiles('#import-file',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({v:2,entries:[],drawEntries:[{...backup.drawEntries[0],strokes:[{...backup.drawEntries[0].strokes[0],points:[[Infinity,0]]}]}]}))});await page.waitForFunction(()=>document.querySelector('#backup-status').textContent.includes('無效'));assert.equal(await page.evaluate(()=>localStorage.getItem('bodymap.draw.v2')),stored);
await go(page,'record');await page.locator('#surfaces').evaluate(e=>e.open=true);await page.locator('[data-action="view"][data-value="LI"]').click();await page.locator('#point-alternative').evaluate(e=>e.open=true);await page.locator('#point-x').fill('50');await page.locator('#point-y').fill('40');await page.locator('#add-point').click();await score(page,2);assert.equal((await draft(page)).strokes.length,1);
// 移動不得生成筆畫；旋轉／縮放不得改座標。
await page.locator('[data-action="mode"][data-value="pan"]').click();await paint(page,[[160,400],[180,420]]);assert.equal((await draft(page)).strokes.length,1);
let layouts=0;for(const width of [320,390,430,1024])for(const lang of ['zh','en'])for(const theme of ['light','dark']){await page.setViewportSize({width,height:width===1024?768:844});await page.emulateMedia({colorScheme:theme});if(await page.locator('html').getAttribute('lang')!==(lang==='zh'?'zh-Hant':'en'))await page.locator('#language').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);layouts++;}
await page.setViewportSize({width:844,height:390});assert.equal((await draft(page)).strokes.length,1);
assert.deepEqual(errors,[]);await page.screenshot({path:`output/playwright/freehand-${engineName}.png`});
// 寫入失敗保留記憶體草稿，且不得顯示成功。
const fail=await context.newPage();await fail.goto(url);await fail.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('quota');};});await fail.locator('#surfaces').evaluate(e=>e.open=true);await fail.locator('[data-action="view"][data-value="RI"]').click();await paint(fail,[[160,400],[160,450]]);await score(fail,4);await fail.locator('#save').click();assert.match(await fail.locator('#status').innerText(),/尚未儲存|Not saved/);assert(await fail.locator('#record').isVisible());assert(await fail.locator('#stroke-list button').count()>0);
report.push({engine:engineName,version:browser.version(),layouts,scenarios:'PASS',errors});console.log('PASS',report.at(-1));await context.close();
}finally{await browser.close();}}
fs.writeFileSync('output/playwright/freehand-report.json',JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
