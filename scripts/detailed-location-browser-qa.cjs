// 本機瀏覽器證據：不代表真人、真機或臨床審核。
const assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
(async()=>{for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.PROTOTYPE_URL||'http://127.0.0.1:8766/prototypes/detailed-locations.html');
 await page.evaluate(()=>{localStorage.setItem('bodymap.v1','unchanged');localStorage.setItem('bodymap.draft','unchanged');});
 await page.selectOption('#region','chest');
 const zone=id=>page.locator(`#zones [data-value="${id}"]`);
 await zone('upper-inner').click();assert(await page.locator('#rating').isVisible());
 const panel=await page.locator('#rating').boundingBox();assert(panel.y>=0&&panel.y+panel.height<=844.5,'editor fits viewport');
 assert(await page.locator('#done-location').isDisabled());
 for(let i=0;i<3;i++)await page.locator('#more').click();
 await page.locator('#done-location').click();assert.match(await page.locator('#total-count').innerText(),/已完成 1.*待完成 0/);
 await zone('upper-inner').click();assert.match(await page.locator('#severity-value').innerText(),/3\/10/);assert.equal(await page.locator('#entries li').count(),1);
 await page.locator('#remove-location').click();assert.equal(await page.locator('#entries li').count(),0);
 await page.locator('#undo').click();assert.match(await page.locator('#entries').innerText(),/3\/10/);
 await page.locator('#close-editor').click();await page.locator('#partial-directions').evaluate(e=>e.open=true);
 await page.locator('#partial-zones [data-value="row-upper"]').click();assert.equal(await page.locator('#entries li').count(),1);assert.match(await page.locator('#entries').innerText(),/僅上方/);
 await page.locator('#undo').click();assert.match(await page.locator('#entries').innerText(),/3\/10/);
 assert.equal(await page.locator('#rating').isVisible(),false);await page.locator('#clear').click();assert.equal(await page.locator('#entries li').count(),0);await page.locator('#undo').click();assert.match(await page.locator('#entries').innerText(),/3\/10/);
 await page.locator('[data-action="layer"][data-value="joint"]').click();await page.selectOption('#region','jHand');
 assert.equal(await page.locator('#body-map [data-body-zone="index"]').count(),0,'no false named finger on coarse body');
 await page.locator('#other-zones [data-value="index"]').click();assert(await page.locator('#additional-diagram').evaluate(e=>e.open));assert.equal(await page.locator('[data-overview-zone="index"]').count(),0);
 await page.locator('#more').click();await page.locator('#done-location').click();
 await page.selectOption('#region','jFoot');await page.locator('#other-zones [data-value="heel-sole"]').click();
 assert.equal(await page.locator('[data-overview-zone="heel-sole"]').count(),0);
 assert.equal(await page.evaluate(()=>localStorage.getItem('bodymap.v1')),'unchanged');assert.equal(await page.evaluate(()=>localStorage.getItem('bodymap.draft')),'unchanged');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);await page.screenshot({path:`output/playwright/delivery-${name}.png`,fullPage:true});
 console.log(`PASS ${name}: 編輯保留分數、完成/待完成、評分面板、互斥/刪除/清空復原、手足參考、正式資料保留`);
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1);});
