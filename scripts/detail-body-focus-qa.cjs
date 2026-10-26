// 全身 SVG 的視窗聚焦與細格選取；不代表真機或專業解剖驗證。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const root=path.resolve(__dirname,'..'),catalog=require('../prototypes/detailed-locations.js');
const url=process.env.PROTOTYPE_URL||'http://127.0.0.1:8766/prototypes/detailed-locations.html';
const browsers=[];
async function choose(page,id,side='R'){
  const region=catalog.regions.find(r=>r.id===id);
  if(!await page.locator(`#region option[value="${id}"]`).count())await page.locator(`[data-action="layer"][data-value="${region.group}"]`).click();
  await page.selectOption('#region',id);await page.locator(`[data-action="side"][data-value="${side}"]`).click();
}
async function main(){
  fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});const report={engines:[],physicalDevice:'NOT VERIFIED',clinicalReview:'NOT VERIFIED'};
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await engine.launch({headless:true});browsers.push(browser);
    const page=await browser.newPage({viewport:{width:390,height:844},colorScheme:'light'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
    assert.equal(await page.locator('#body-map .body.focused').count(),0,'initial view shows full body');
    assert(!/步驟 2|Step 2/.test(await page.locator('body').innerText()));
    let focused=0;
    for(const region of catalog.regions)for(const side of ['R','L']){
      await choose(page,region.id,side);
      const result=await page.evaluate(({id,side})=>{
        const svg=document.querySelector('#body-map svg'),path=svg.querySelector(`[data-part="${id}.${side}"]>.hit`),box=path.getBBox(),view=svg.dataset.view,v=svg.viewBox.baseVal;
        return {centerError:Math.hypot(v.x+v.width/2-box.x-box.width/2,v.y+v.height/2-box.y-box.height/2),context:v.width>=box.width*2.79&&v.height>=box.height*2.79,wholeOutline:svg.querySelector('.outline').getAttribute('d')===window.FEMALE_MAP.views[view].outline,fullBox:window.FEMALE_MAP.views[view].viewBox,box:svg.getAttribute('viewBox'),focused:svg.classList.contains('focused')};
      },{id:region.id,side});
      assert(result.centerError<.001,`${name}:${region.id}.${side} not centered`);assert(result.context);assert(result.wholeOutline);assert(result.focused);assert.notEqual(result.box,result.fullBox);focused++;
    }
    await choose(page,'chest','R');
    assert.equal(await page.locator('#additional-diagram').isVisible(),false,'no isolated chest panel');
    assert.equal(await page.locator('#body-map svg').getAttribute('preserveAspectRatio'),'xMidYMid meet');
    await page.locator('[data-action="body-mode"][data-value="closer"]').focus();await page.keyboard.press('Tab');
    assert(await page.evaluate(()=>!!document.activeElement.dataset.bodyZone),'Tab goes directly to the visible fine regions, not off-camera body parts');
    const picture=page.locator('#body-map [data-body-zone="upper-inner"]');
    await picture.locator('circle').click();assert.equal(await page.locator('[data-action="zone"][data-value="upper-inner"]').getAttribute('aria-pressed'),'true');
    for(let n=0;n<3;n++)await page.locator('#more').click();
    const inner=await page.locator('[data-action="zone"][data-value="upper-inner"]').boundingBox(),outer=await page.locator('[data-action="zone"][data-value="upper-outer"]').boundingBox();assert(inner.x>outer.x);
    const patch=await page.locator('[data-overview-part="chest.R"][data-overview-zone="upper-inner"]').boundingBox(),whole=await page.locator('[data-part="chest.R"]>.hit').boundingBox();assert(patch.width*patch.height<whole.width*whole.height*.4);
    const regular=await page.locator('#body-map svg').getAttribute('viewBox');
    await page.locator('[data-action="body-mode"][data-value="closer"]').click();
    const close=(await page.locator('#body-map svg').getAttribute('viewBox')).split(' ').map(Number),normal=regular.split(' ').map(Number);assert.equal(close[2],normal[2]/2);assert.equal(close[3],normal[3]/2);assert.match(await page.locator('#entries').innerText(),/3\/10/);
    await page.locator('[data-action="body-mode"][data-value="full"]').click();
    assert.equal(await page.locator('#body-map .body.focused').count(),0);assert.equal(await page.locator('[data-overview-zone="upper-inner"]').count(),1);
    await page.locator('[data-action="body-mode"][data-value="focus"]').click();
    assert.equal(await page.locator('#body-map svg').getAttribute('viewBox'),regular);
    await page.locator('#body-map [data-body-zone="lower-outer"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-action="zone"][data-value="lower-outer"]').getAttribute('aria-pressed'),'true');
    await page.locator('#body-map').screenshot({path:path.join(root,`output/playwright/body-focus-chest-${name}-390.png`)});
    await page.locator('.layout').screenshot({path:path.join(root,`output/playwright/body-focus-layout-${name}-390.png`)});
    await page.locator('#clear').click();
    const failures=[];let layouts=0;
    for(const width of [320,375,390,1280])for(const colorScheme of ['light','dark'])for(const lang of ['zh-Hant','en']){
      await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});
      if(await page.locator('html').getAttribute('lang')!==lang)await page.locator('#lang').click();
      const result=await page.evaluate(({width,all})=>{
        let checked=0;const failures=[];
        for(const r of window.detailedLocations.regions.filter(r=>all||['chest','jKnee','jHand','jFoot','forearmF','jShoulder'].includes(r.id))){
          const select=document.querySelector('#region');if(![...select.options].some(o=>o.value===r.id))document.querySelector(`[data-action="layer"][data-value="${r.group}"]`).click();select.value=r.id;select.dispatchEvent(new Event('change',{bubbles:true}));
          for(const side of ['R','L']){document.querySelector(`[data-action="side"][data-value="${side}"]`).click();checked++;if(document.documentElement.scrollWidth>width)failures.push({id:r.id,side,error:'overflow',width});for(const b of document.querySelectorAll('#zones button,#body-zoom button,select'))if(b.getBoundingClientRect().height<48)failures.push({id:r.id,side,error:'short control'});}
        }return {checked,failures};
      },{width,all:width===320||width===1280});layouts+=result.checked;failures.push(...result.failures);
    }
    assert.deepEqual(failures,[]);assert.deepEqual(errors,[]);
    await page.setViewportSize({width:1280,height:900});await page.emulateMedia({colorScheme:'light'});if(await page.locator('html').getAttribute('lang')!=='zh-Hant')await page.locator('#lang').click();await choose(page,'chest');
    await page.screenshot({path:path.join(root,`output/playwright/body-focus-desktop-${name}.png`),fullPage:true});
    report.engines.push({name,version:browser.version(),focused,layouts,failures,errors,wholeBodyOutline:'PASS',detailSync:'PASS',zoomPreservesSelection:'PASS',keyboard:'PASS'});console.log('PASS',name,JSON.stringify(report.engines.at(-1)));await browser.close();
  }
  fs.writeFileSync(path.join(root,'output/playwright/body-focus-qa.json'),JSON.stringify(report,null,2));
}
main().catch(async error=>{console.error(error);await Promise.allSettled(browsers.map(b=>b.close()));process.exitCode=1;});
