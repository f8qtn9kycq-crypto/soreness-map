/* 獨立操作原型：僅記憶體狀態，不讀寫正式站 localStorage 或備份格式。 */
(function(){
  'use strict';
  const catalog=window.detailedLocations;
  if(!catalog){document.getElementById('notice').textContent='定位資料未載入，請重新開啟。 / Location data unavailable; reopen the prototype.';return;}
  const regions=catalog.regions,byId=Object.fromEntries(regions.map(r=>[r.id,r]));
  const map=window.FEMALE_MAP,model=window.DETAIL_SELECTION_STATE;
  const state={lang:'zh',region:'chest',side:'R',view:'F',layer:'muscle',selected:null,records:new Map(),imageZoom:1,bodyMode:'full',bodyZoom:1,undo:null,undoReason:null};
  const text={
    zh:{eyebrow:'SORENESS MAP / 位置細分',title:'更精確地記錄痠痛位置',noticeTitle:'互動原型・資料只留在這次頁面',notice:'涵蓋全部 37 類部位。可多選位置、分別評分；重新整理後清空，不讀寫正式紀錄。',choose:'選擇大部位',sideHint:'左右以你自己的身體為準。正面：你的右側在畫面左。',muscle:'肌肉與軟組織',joint:'關節與區域',front:'正面',back:'背面',R:'右',L:'左',regionLabel:'也可以用清單選擇',detailStep:'步驟 2 · 選取細部位置',optionCount:'個細分位置',cropHint:'放大圖只標示大部位。細分位置請依下方文字選取。',positionHint:'可選多個位置，各自記錄程度。這是感覺位置，不是受傷肌肉判定。',chestHint:'用上下 × 內外的九格描述右胸或左胸。格線為定位示意，不是肌肉邊界。',whole:'整區',unspecified:'無法明確定位',broadHint:'「整區／無法明確定位」與細分位置擇一；改選時會移除同部位的另一種選法。',rate:'記錄這個位置的程度',unrated:'尚未評分',less:'降低程度',more:'提高程度',ratingHint:'拖曳滑桿或按＋開始評分；每個位置獨立，未操作不會預填分數。',sourceTitle:'位置說明與參考來源',sourceWarning:'分區是產品定位提案，尚未經物理治療師／教練逐項審核。公開資料不等於專業背書。',summary:'這次原型選取',summaryHint:'點選任一列可回到該位置調整程度。此原型不儲存、不匯出。',empty:'先選細部位置，再記錄程度。',clear:'清空原型選取',footer:'僅供自我記錄，不提供診斷、治療或運動處方。正式資料格式與歷史紀錄未改動。',catalogLink:'全身細分對照表',artLink:'人體圖來源與授權',coverage:'37 類 / 74 個左右部位',legend:'已選大部位',recorded:'已有選取',mapMiss:'此處沒有位置；請使用清單或切換分類。',candidate:'此處重疊多個部位，請選擇：',mapUnavailable:'人體圖未載入；仍可使用位置清單。',selected:'已選取',removed:'已取消',replaced:'已移除同部位的另一種選法。',noImage:'此處沒有可顯示的圖形，請使用文字位置。',total:'個位置',mild:'輕微',moderate:'中等',severe:'嚴重'},
    en:{eyebrow:'SORENESS MAP / LOCATION DETAIL',title:'Pinpoint where you feel discomfort',noticeTitle:'Interactive prototype · this page only',notice:'All 37 regions included. Select multiple locations and rate each separately. Refresh clears selections; existing records are untouched.',choose:'Choose a body region',sideHint:'Left/right mean your own body. Front view: your right is on the left of the screen.',muscle:'Muscles & soft tissues',joint:'Joints & regions',front:'Front',back:'Back',R:'Right',L:'Left',regionLabel:'Or choose from the list',detailStep:'Step 2 · Choose precise locations',optionCount:'detail locations',cropHint:'The zoom shows the broad region only. Use the text below to select detail.',positionHint:'Select multiple locations and rate them independently. These are felt locations, not injured-tissue identification.',chestHint:'Use vertical × horizontal position for either side of the chest. These cells are location aids, not muscle boundaries.',whole:'Whole region',unspecified:'Cannot pinpoint',broadHint:'Choose broad/unspecified OR detailed locations. Changing approach removes the other selection type in this region.',rate:'Rate this location',unrated:'Not rated',less:'Decrease level',more:'Increase level',ratingHint:'Drag the slider or press + to rate. Each location is independent; no score is prefilled.',sourceTitle:'Location notes & references',sourceWarning:'These are proposed product locations, not yet individually reviewed by a physical therapist or trainer. Public references are not professional endorsement.',summary:'This prototype selection',summaryHint:'Select a row to return and adjust its level. Nothing is saved or exported.',empty:'Choose a detail location, then rate it.',clear:'Clear prototype selection',footer:'For personal logging only; no diagnosis, treatment or exercise prescription. Existing records and production data formats are untouched.',catalogLink:'Full-body location catalog',artLink:'Body artwork attribution',coverage:'37 regions / 74 sided regions',legend:'Chosen region',recorded:'Has selections',mapMiss:'No location here. Use the list or switch category.',candidate:'Several regions overlap. Choose one:',mapUnavailable:'Body illustration unavailable; use the location list.',selected:'Selected',removed:'Deselected',replaced:'The other selection type in this region was removed.',noImage:'No illustration here. Use the location text.',total:'locations',mild:'Mild',moderate:'Moderate',severe:'Severe'}
  };
  Object.assign(text.zh,{partialTitle:'只知道其中一個方向',partialHint:'例如只知道上方，卻不確定內外位置，也能記錄；不必猜另一個方向。'});
  Object.assign(text.en,{partialTitle:'I only know one direction',partialHint:'For example, log an upper area without guessing its inner or outer position.'});
  Object.assign(text.zh,{cropHint:'點圖中區塊或同編號文字，選取與高亮會同步。局部圖為位置展開示意，比例為方便點選而調整，不是精確肌肉邊界。',imageZoom:'放大圖形 2×',imageFit:'恢復全圖',imagePartial:'只知道一個方向，也可點選下方位置條',imageAll:'整區／無法明確定位',imageDescription:'可用滑鼠、觸控或鍵盤選取圖中編號區域。前後側以分開面板顯示；編號與下方文字相同。'});
  Object.assign(text.en,{cropHint:'Tap a shape or matching numbered label; selection and highlights stay in sync. Local diagrams are expanded for selection, not exact muscle boundaries or anatomical proportions.',imageZoom:'Enlarge image 2×',imageFit:'Fit image',imagePartial:'Know only one direction? Select a band below',imageAll:'Whole region / cannot pinpoint',imageDescription:'Choose numbered shapes using pointer, touch or keyboard. Different surfaces use separate panels; numbers match the text list below.'});
  Object.assign(text.zh,{legend:'目前編輯範圍（虛線）',recorded:'已選細部（色塊）',spatialHint:'文字位置依圖排列；左右切換時一同調整。',spatialScroll:'文字位置依圖排列；可橫向滑動查看完整排列。',overviewHidden:'有 {count} 處不在這個全身視角或無法明確定位，請看局部圖與摘要；不會改畫成整區。'});
  Object.assign(text.en,{legend:'Editing area (dashed)',recorded:'Chosen detail (filled)',spatialHint:'Text follows the image layout and changes with the body side.',spatialScroll:'Text follows the image layout. Scroll horizontally to see all positions.',overviewHidden:'{count} locations are outside this body view or cannot be pinpointed. See the local diagram and summary; they are not painted as whole regions.'});
  Object.assign(text.zh,{choose:'位置與視角',detailStep:'人體位置',bodyFull:'全身',bodyFocus:'聚焦所選部位',bodyCloser:'再放大',bodyHint:'直接放大整張人體圖並讓所選部位置中，保留周圍身體作為參照。點選編號細格，或使用下方同位置文字。',referenceTitle:'其他視角參考（例如掌背、足底）',hiddenSurface:'此視角未顯示：'});
  Object.assign(text.en,{choose:'Location & view',detailStep:'Body location',bodyFull:'Full body',bodyFocus:'Focus selected region',bodyCloser:'Zoom closer',bodyHint:'Zoom the complete body illustration around the selected region, keeping surrounding anatomy for context. Choose numbered areas or matching text below.',referenceTitle:'Other surface references (palm, back, sole)',hiddenSurface:'Outside this view: '});
  Object.assign(text.zh,{done:'完成這個位置',closeEditor:'繼續選位置',undo:'復原',completed:'已完成',pending:'待完成',removed:'已移除位置',replaced:'已改用另一種定位精度',cleared:'已清空本次選取',otherSurfaces:'其他表面位置（開啟參考圖）',broadHint:'同一側、同一部位一次使用一種精度：細格、單一方向、整區或無法定位。改用另一種會取代舊選取，可立即復原。',ratingHint:'先評分，再按「完成這個位置」。繼續選位置會保留待完成項目。'});
  Object.assign(text.en,{done:'Done with this location',closeEditor:'Continue selecting',undo:'Undo',completed:'Completed',pending:'Pending',removed:'Location removed',replaced:'Location precision changed',cleared:'Selections cleared',otherSurfaces:'Other surfaces (open reference)',broadHint:'Use one precision per body side and region: cells, one direction, whole, or unknown. Switching replaces previous selections; undo is available.',ratingHint:'Rate, then choose Done. Continue selecting keeps unfinished locations pending.'});
  const $=id=>document.getElementById(id),t=key=>text[state.lang][key];
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=item=>state.lang==='zh'?item.zh:item.en;
  const partName=(id=state.region,side=state.side)=>`${t(side)}${state.lang==='en'?' ':''}${label(byId[id])}`;
  const key=(zone,id=state.region,side=state.side)=>`${id}.${side}:${zone}`;
  const broad=id=>id==='whole'||id==='unspecified';
  const zoneName=(region,zone)=>broad(zone)?t(zone):label(byId[region].options.find(o=>o.id===zone));
  const button=(action,value,caption,on=false)=>`<button type="button" data-action="${action}" data-value="${esc(value)}" class="${on?'on':''}" aria-pressed="${on}">${esc(caption)}</button>`;
  function announce(message){$('announce').textContent=message;}
  function choose(id,side,focus=false){
    if(!byId[id]||!['R','L'].includes(side))return;
    state.region=id;state.side=side;state.layer=byId[id].group;
    if(!byId[id].view.includes(state.view))state.view=byId[id].view[0];
    state.selected=null;state.imageZoom=1;state.bodyMode='focus';state.bodyZoom=1;$('map-status').textContent='';$('candidates').hidden=true;
    render();if(focus)$('part-title').focus();
  }
  function renderUndo(){
    $('undo-notice').hidden=!state.undoReason||!state.undo;
    $('undo-message').textContent=state.undoReason?t(state.undoReason):'';$('undo').textContent=t('undo');
  }
  function toggle(zone){
    if(!broad(zone)&&!byId[state.region].options.some(o=>o.id===zone))return;
    const result=model.select(state,{region:state.region,side:state.side,zone});if(!result)return;
    if(!result.existing)state.undoReason=result.replaced?'replaced':null;
    renderDetails();renderSummary();renderMap();renderUndo();
    const visible=window.DETAIL_LOCATION_IMAGE.bodyGeometry(byId[state.region],state.side,state.view,map)?.zones.some(z=>z.id===zone);
    if(!broad(zone)&&!zone.startsWith('row-')&&!zone.startsWith('col-')&&!visible)$('additional-diagram').open=true;
    announce(`${t('selected')}：${zoneName(state.region,zone)}${result.replaced?' '+t('replaced'):''}`);
  }
  function removeSelected(){
    if(!model.remove(state))return;state.undoReason='removed';render();announce(t('removed'));
  }
  function setSeverity(value){
    if(!model.rate(state,Number(value)))return;
    state.undo=null;state.undoReason=null;renderRating();renderSummary();renderMap();renderCrop();renderUndo();
  }
  function closeEditor(complete=false){
    if(complete&&!model.complete(state))return;
    if(!complete)state.selected=null;
    state.undo=null;state.undoReason=null;render();$('part-title').focus({preventScroll:true});
  }
  function decoration(view){return `<path class="outline" d="${view.outline}"/>${view.hairBack?`<path class="hair" d="${view.hairBack}"/>`:''}${view.art.map(a=>`<path class="art" d="${a.path}"/>`).join('')}${view.hairFront?`<path class="hair" d="${view.hairFront}"/>`:''}${(view.hairLines||[]).map(d=>`<path class="hair-lines" d="${d}"/>`).join('')}`;}
  function renderMap(){
    $('body-zoom').setAttribute('aria-label',t('bodyFocus'));
    $('body-zoom').innerHTML=[button('body-mode','full',t('bodyFull'),state.bodyMode==='full'),button('body-mode','focus',t('bodyFocus'),state.bodyMode==='focus'&&state.bodyZoom===1),button('body-mode','closer',t('bodyCloser'),state.bodyMode==='focus'&&state.bodyZoom===2)].join('');
    $('body-hint').textContent=t('bodyHint');
    if(!map){$('body-map').innerHTML=`<p class="mut">${t('mapUnavailable')}</p>`;return;}
    const view=map.views[state.view],locations=map.locations.filter(p=>p.view===state.view&&byId[p.id].group===state.layer);
    const geometry=window.DETAIL_LOCATION_IMAGE?.bodyGeometry(byId[state.region],state.side,state.view,map);
    const focused=state.bodyMode==='focus'&&geometry;
    const camera=focused?window.DETAIL_LOCATION_IMAGE.focusViewBox(geometry.bounds,view.viewBox,state.bodyZoom):view.viewBox;
    const records=[...state.records.values()].filter(r=>byId[r.region].group===state.layer),shown=new Set();
    const activeLocation=locations.find(p=>p.id===state.region&&p.side===state.side);
    const radius=Number(camera.split(/\s+/)[2])/30;
    const focusedZones=focused&&activeLocation?`<defs><clipPath id="focused-region-clip"><path d="${activeLocation.path}"/></clipPath></defs>${geometry.zones.map(z=>{
      const own=state.records.has(key(z.id)),covered=imageCovered(byId[state.region],z.id);
      return `<g class="detail-zone ${own?'on':''} ${own&&!state.records.get(key(z.id))?.completed?'pending':''} ${covered?'covered':''}" data-body-zone="${z.id}" tabindex="0" role="button" aria-label="${esc(zoneNumber(byId[state.region],z.id)+'. '+zoneName(state.region,z.id))}" aria-pressed="${own}"><g clip-path="url(#focused-region-clip)"><path class="detail-hit" data-shape="${z.id}" d="${z.path}"${z.transform?` transform="${z.transform}"`:''} vector-effect="non-scaling-stroke"/></g><circle class="number-disc" cx="${z.anchor[0]}" cy="${z.anchor[1]}" r="${radius}"/><text class="zone-number" x="${z.anchor[0]}" y="${z.anchor[1]}" style="font-size:${radius*1.2}px">${zoneNumber(byId[state.region],z.id)}</text></g>`;
    }).join('')}`:'';
    $('body-map').innerHTML=`<svg class="body ${focused?'focused':''}" preserveAspectRatio="xMidYMid meet" data-view="${state.view}" viewBox="${camera}" role="group" aria-label="${t(state.view==='F'?'front':'back')}">${decoration(view)}${locations.map(p=>{
      const id=`${p.id}.${p.side}`,selected=p.id===state.region&&p.side===state.side,entries=records.filter(r=>r.region===p.id&&r.side===p.side);
      const projection=entries.length?(window.DETAIL_LOCATION_IMAGE?.project(byId[p.id],p.side,state.view,map,entries.map(r=>r.zone))||{paths:[],hidden:entries.map(r=>r.zone)}):{paths:[],hidden:[]};
      for(const r of entries)if(!projection.hidden.includes(r.zone))shown.add(key(r.zone,r.region,r.side));
      const clip=`overview-${p.id}-${p.side}`,overlay=projection.paths.length?`<defs><clipPath id="${clip}"><path d="${p.path}"/></clipPath></defs><g clip-path="url(#${clip})" pointer-events="none">${projection.paths.map(z=>`<path class="overview-detail ${entries.find(r=>r.zone===z.id||window.DETAIL_LOCATION_IMAGE.covers(byId[p.id],r.zone,z.id))?.completed?'complete':'pending'}" data-overview-part="${id}" data-overview-zone="${z.id}" d="${z.path}"${z.transform?` transform="${z.transform}"`:''}/>`).join('')}</g>`:'';
      const unknown=entries.some(r=>r.zone==='unspecified')?`<text class="overview-unknown" x="${p.labelPoint[0]}" y="${p.labelPoint[1]}">?</text>`:'';
      return `<g class="map-part" data-part="${id}" tabindex="${focused?-1:0}" role="button" aria-label="${esc(partName(p.id,p.side))}" aria-pressed="${selected}"><path class="hit ${selected?'selected':''}" d="${p.path}"/>${overlay}${unknown}</g>`;
    }).join('')}${focusedZones}</svg>`;
    const hidden=records.filter(r=>!shown.has(key(r.zone,r.region,r.side))).length;
    $('overview-status').textContent=hidden?t('overviewHidden').replace('{count}',hidden):'';
  }
  function imageCovered(region,id){
    if(state.records.has(key('whole')))return true;
    if(!region.cols)return false;
    const cell=region.cells.find(o=>o.id===id);if(!cell)return false;
    return region.rows.some(r=>id.startsWith(r.id+'-')&&state.records.has(key('row-'+r.id)))||region.cols.some(c=>id.endsWith('-'+c.id)&&state.records.has(key('col-'+c.id)));
  }
  function zoneNumber(region,id){const index=region.options.findIndex(o=>o.id===id);return index<0?(id==='whole'?'◎':'?'):String(index+1);}
  function imageGroup(region,id,content){const own=state.records.has(key(id)),covered=imageCovered(region,id);return `<g class="detail-zone ${own?'on':''} ${covered?'covered':''} ${key(id)===state.selected?'current':''}" data-image-zone="${id}" tabindex="0" role="button" aria-label="${esc(zoneNumber(region,id)+'. '+zoneName(region.id,id))}" aria-pressed="${own}">${content}</g>`;}
  function imageBand(region,id,x,y,width){
    const caption=`${zoneNumber(region,id)}. ${zoneName(region.id,id)}`;
    const lines=state.lang==='zh'?[caption.slice(0,15),caption.slice(15)].filter(Boolean):caption.match(/.{1,29}(?:\s|$)|.{1,29}/g)||[caption];
    const text=lines.slice(0,2).map((line,n)=>`<tspan x="${x+width/2}" y="${y+(lines.length>1?27:38)+n*24}">${esc(line.trim())}</tspan>`).join('');
    return imageGroup(region,id,`<path class="detail-hit band-hit" d="M${x} ${y}h${width}v68h${-width}Z"/><text class="detail-toolbar-label">${text}</text>`);
  }
  function renderCrop(){
    const region=byId[state.region],geometry=window.DETAIL_LOCATION_IMAGE?.build(region,state.side,state.view,map);
    if(!geometry){$('crop').textContent=t('noImage');return;}
    const prior=$('detail-image-frame'),scroll={left:prior?.scrollLeft||0,top:prior?.scrollTop||0};
    const defs=geometry.source?`<defs><clipPath id="detail-source-clip"><path d="${geometry.source.path}" transform="${geometry.source.transform}"/></clipPath></defs>`:'';
    const backgrounds=geometry.backgrounds.map(p=>`<path class="detail-background" d="${p.path}"${p.transform?` transform="${p.transform}"`:''}/>`).join('');
    const shapes=geometry.zones.map(z=>imageGroup(region,z.id,`<path class="detail-hit" data-shape="${z.id}" d="${z.path}"${z.transform?` transform="${z.transform}"`:''}${z.clip?' clip-path="url(#detail-source-clip)"':''}/><circle class="number-disc" cx="${z.anchor[0]}" cy="${z.anchor[1]}" r="24"/><text class="zone-number" x="${z.anchor[0]}" y="${z.anchor[1]}">${zoneNumber(region,z.id)}</text>`)).join('');
    const outline=geometry.source?`<path class="detail-contour" d="${geometry.source.path}" transform="${geometry.source.transform}"/>`:'';
    const labels=geometry.labels.map(l=>`<text class="diagram-label" x="${l.x}" y="${l.y}" text-anchor="${l.align||'middle'}">${esc(label(l))}</text>`).join('');
    let y=geometry.height+8;
    let bands='';
    if(region.partials.length){bands+=`<text class="diagram-label" x="320" y="${y}" text-anchor="middle">${esc(t('imagePartial'))}</text>`;y+=18;bands+=region.partials.map((o,n)=>imageBand(region,o.id,n%2?330:10,y+Math.floor(n/2)*78,300)).join('');y+=Math.ceil(region.partials.length/2)*78+18;}
    bands+=['whole','unspecified'].map((id,n)=>imageBand(region,id,n?330:10,y,300)).join('');
    const height=y+82;
    $('crop').innerHTML=`<div class="diagram-controls"><button type="button" data-image-zoom="${state.imageZoom===1?2:1}" aria-pressed="${state.imageZoom===2}">${esc(t(state.imageZoom===1?'imageZoom':'imageFit'))}</button></div><div class="diagram-scroll" id="detail-image-frame" tabindex="0" role="group" aria-label="${esc(t('imageDescription'))}"><svg class="detail-image" viewBox="0 0 ${geometry.width} ${height}" style="width:${state.imageZoom*100}%" role="group" aria-label="${esc(partName())}"><title>${esc(partName())}</title><desc>${esc(t('imageDescription'))}</desc>${defs}${backgrounds}${shapes}${outline}${labels}${bands}</svg></div>`;
    $('detail-image-frame').scrollLeft=scroll.left;$('detail-image-frame').scrollTop=scroll.top;
  }
  function renderDetails(){
    const region=byId[state.region];$('detail-step').textContent=t('detailStep');$('part-title').textContent=partName();$('option-count').textContent=`${region.options.length} ${t('optionCount')}`;
    $('crop-hint').textContent=t('cropHint');$('position-hint').textContent=t(region.id==='chest'?'chestHint':'positionHint');
    $('zone-axes').textContent=region.cols?`${region.rows.map(label).join(' / ')} × ${region.cols.map(label).join(' / ')}`:'';
    const body=window.DETAIL_LOCATION_IMAGE?.bodyGeometry(region,state.side,state.view,map);
    const geometry=window.DETAIL_LOCATION_IMAGE?.build(region,state.side,state.view,map),layout=body?.layout||window.DETAIL_LOCATION_IMAGE?.spatialLayout(geometry);
    $('zones').className='zones';
    $('zones').setAttribute('aria-label',t('detailStep'));
    if(layout){
      const slots=new Map();for(const slot of layout.slots.filter(s=>!s.hidden)){const k=slot.row+':'+slot.column;if(!slots.has(k))slots.set(k,[]);slots.get(k).push(slot);}
      $('zones').style.gridTemplateColumns=`repeat(${layout.columns},minmax(0,1fr))`;$('zones').style.minWidth=layout.columns>4?layout.columns*90+'px':'';
      $('zones').innerHTML=[...slots.values()].sort((a,b)=>a[0].row-b[0].row||a[0].column-b[0].column).map(group=>`<div class="zone-slot" style="grid-row:${group[0].row};grid-column:${group[0].column}">${group.map(s=>{const o=region.cells.find(c=>c.id===s.id);return button('zone',o.id,(s.hidden?t('hiddenSurface'):'')+zoneNumber(region,o.id)+'. '+label(o),state.records.has(key(o.id)));}).join('')}</div>`).join('');
    }else{
      $('zones').style.gridTemplateColumns=`repeat(${region.cols?.length||1},minmax(0,1fr))`;$('zones').style.minWidth='';
      $('zones').innerHTML=region.cells.map(o=>button('zone',o.id,zoneNumber(region,o.id)+'. '+label(o),state.records.has(key(o.id)))).join('');
    }
    const other=region.cells.filter(c=>!body?.zones.some(z=>z.id===c.id));$('other-surfaces').hidden=!other.length;$('other-title').textContent=t('otherSurfaces');$('other-zones').innerHTML=other.map(o=>button('zone',o.id,zoneNumber(region,o.id)+'. '+label(o),state.records.has(key(o.id)))).join('');
    $('spatial-hint').textContent=t(layout?.columns>4?'spatialScroll':'spatialHint');
    $('reference-title').textContent=t('referenceTitle');$('additional-diagram').hidden=!!body&&body.zones.length===region.cells.length;
    $('partial-directions').hidden=!region.partials.length;$('partial-title').textContent=t('partialTitle');$('partial-hint').textContent=t('partialHint');$('partial-zones').setAttribute('aria-label',t('partialTitle'));
    $('partial-zones').innerHTML=region.partials.map(o=>button('zone',o.id,zoneNumber(region,o.id)+'. '+label(o),state.records.has(key(o.id)))).join('');
    $('broad').innerHTML=['whole','unspecified'].map(zone=>button('zone',zone,t(zone),state.records.has(key(zone)))).join('');
    $('broad').setAttribute('aria-label',t('whole')+' / '+t('unspecified'));
    $('broad-hint').textContent=t('broadHint');$('source-title').textContent=t('sourceTitle');$('context').textContent=state.lang==='zh'?region.context:region.contextEn;
    $('source-list').innerHTML=region.sources.map(id=>{const source=catalog.sources[id];const sourceName=state.lang==='zh'?source.title:({upper:'OSU 11.6 · Upper limb',lower:'OSU 11.7 · Lower limb',trunk:'OSU 11.5 · Trunk',axial:'OSU 11.4 · Neck & back',joints:'OSU 9.6 · Selected joints',physioChest:'Physiopedia · Pectoralis major',physioTraps:'Physiopedia / Rehab My Patient · Trapezius'})[id];return `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${esc(sourceName)}</a></li>`;}).join('');
    $('source-warning').textContent=t('sourceWarning');renderCrop();renderRating();
  }
  function renderRating(){
    const record=state.records.get(state.selected);$('rating').hidden=!record;document.body.classList.toggle('editing',!!record);if(!record)return;
    $('rating-title').textContent=t('rate');$('rating-label').textContent=partName(record.region,record.side)+' · '+zoneName(record.region,record.zone);
    $('severity-value').textContent=record.severity===null?t('unrated'):`${record.severity}/10 · ${t(record.severity<=3?'mild':record.severity<=6?'moderate':'severe')}`;
    $('severity').value=record.severity??1;$('severity').setAttribute('aria-valuetext',$('severity-value').textContent);
    $('less').setAttribute('aria-label',t('less'));$('less').disabled=record.severity===null||record.severity===1;$('more').setAttribute('aria-label',t('more'));$('more').disabled=record.severity===10;
    $('rating-hint').textContent=t('ratingHint');
    let remove=$('remove-location');if(!remove){remove=document.createElement('button');remove.id='remove-location';remove.type='button';remove.className='full';remove.addEventListener('click',removeSelected);$('rating').append(remove);}
    remove.textContent=state.lang==='zh'?'移除這個位置':'Remove this location';$('done-location').textContent=t('done');$('done-location').disabled=record.severity===null;$('close-editor').textContent=t('closeEditor');
  }
  function renderSummary(){
    $('summary-title').textContent=t('summary');$('summary-hint').textContent=t('summaryHint');$('total-count').textContent=`${t('completed')} ${model.counts(state).completed} · ${t('pending')} ${model.counts(state).pending}`;
    $('entries').innerHTML=state.records.size?`<ul>${[...state.records].map(([id,r])=>`<li class="entry"><button type="button" data-action="edit" data-value="${id}"><strong>${esc(partName(r.region,r.side))}</strong><br><span class="mut">${esc(zoneName(r.region,r.zone))}</span></button><span class="score">${r.completed?'✓ '+t('completed'):'○ '+t('pending')}<br>${r.severity===null?t('unrated'):r.severity+'/10'}</span></li>`).join('')}</ul>`:`<p class="empty">${t('empty')}</p>`;
    $('clear').textContent=t('clear');$('clear').disabled=!state.records.size;
  }
  function render(){
    document.documentElement.lang=state.lang==='zh'?'zh-Hant':'en';document.title=t('title');
    for(const [id,k] of [['eyebrow','eyebrow'],['title','title'],['noticeTitle','noticeTitle'],['notice','notice'],['region-label','regionLabel'],['footer','footer'],['catalog-link','catalogLink'],['art-link','artLink']])$(id).textContent=t(k);
    $('choose-title').textContent=t('choose');$('side-hint').textContent=t('sideHint');$('lang').textContent=state.lang==='zh'?'EN':'中文';$('lang').setAttribute('aria-label',state.lang==='zh'?'Switch to English':'切換繁體中文');
    $('layers').setAttribute('aria-label',state.lang==='zh'?'部位分類':'Region category');$('layers').innerHTML=['muscle','joint'].map(g=>button('layer',g,t(g),state.layer===g)).join('');
    $('views').setAttribute('aria-label',state.lang==='zh'?'身體視角':'Body view');$('views').innerHTML=[['F','front'],['B','back']].map(([v,name])=>button('view',v,t(name),state.view===v)).join('');
    $('sides').setAttribute('aria-label',state.lang==='zh'?'你自己的左右':'Your own body side');$('sides').innerHTML=['R','L'].map(s=>button('side',s,t(s),state.side===s)).join('');
    // List includes every region in the selected category, independent of the current map view.
    $('region').innerHTML=regions.filter(r=>r.group===state.layer).map(r=>`<option value="${r.id}"${r.id===state.region?' selected':''}>${esc(label(r))}</option>`).join('');
    $('legend').innerHTML=`<span><b>◇</b> ${t('legend')}</span><span>▰ ${t('recorded')}</span>`;$('coverage').innerHTML=`<span>${t('coverage')}</span>`;
    renderMap();renderDetails();renderSummary();renderUndo();
  }
  $('region').addEventListener('change',event=>choose(event.target.value,state.side));
  $('lang').addEventListener('click',()=>{state.lang=state.lang==='zh'?'en':'zh';$('map-status').textContent='';$('candidates').hidden=true;announce('');render();});
  $('clear').addEventListener('click',()=>{if(model.clear(state)){state.undoReason='cleared';render();announce(t('cleared'));}});
  $('done-location').addEventListener('click',()=>closeEditor(true));
  $('close-editor').addEventListener('click',()=>closeEditor());
  $('undo').addEventListener('click',()=>{if(model.undo(state)){state.undoReason=null;render();announce(t('undo'));}});
  $('severity').addEventListener('input',event=>setSeverity(event.target.value));
  $('less').addEventListener('click',()=>setSeverity((state.records.get(state.selected)?.severity??2)-1));
  $('more').addEventListener('click',()=>setSeverity((state.records.get(state.selected)?.severity??0)+1));
  document.addEventListener('click',event=>{
    const bodyZone=event.target.closest('[data-body-zone]');if(bodyZone){const id=bodyZone.dataset.bodyZone;toggle(id);document.querySelector(`[data-body-zone="${id}"]`)?.focus({preventScroll:true});return;}
    const imageZone=event.target.closest('[data-image-zone]');
    if(imageZone){const id=imageZone.dataset.imageZone;toggle(id);document.querySelector(`[data-image-zone="${id}"]`)?.focus({preventScroll:true});return;}
    const imageZoom=event.target.closest('[data-image-zoom]');if(imageZoom){state.imageZoom=Number(imageZoom.dataset.imageZoom);renderCrop();document.querySelector('[data-image-zoom]')?.focus({preventScroll:true});return;}
    const control=event.target.closest('[data-action]');if(control){const {action,value}=control.dataset;
      if(action==='body-mode'){state.bodyMode=value==='full'?'full':'focus';state.bodyZoom=value==='closer'?2:1;if(value!=='full'&&!byId[state.region].view.includes(state.view))state.view=byId[state.region].view[0];render();document.querySelector(`[data-action="body-mode"][data-value="${value}"]`)?.focus({preventScroll:true});return;}
      if(action==='zone'){toggle(value);document.querySelector(`[data-action="zone"][data-value="${value}"]`)?.focus();return;}
      if(action==='side'){choose(state.region,value);$(`sides`).querySelector(`[data-value="${value}"]`).focus();return;}
      if(action==='view'){state.view=value;$('candidates').hidden=true;$('map-status').textContent='';render();$('views').querySelector(`[data-value="${value}"]`).focus();return;}
      if(action==='layer'){choose(regions.find(r=>r.group===value&&r.view.includes(state.view)).id,state.side);$('layers').querySelector(`[data-value="${value}"]`).focus();return;}
      if(action==='edit'){const record=state.records.get(value);if(record){choose(record.region,record.side);state.selected=value;renderCrop();renderRating();$('severity').focus({preventScroll:true});}return;}
      if(action==='candidate'){const [id,side]=value.split('.');choose(id,side,true);return;}
    }
    const svg=event.target.closest('svg.body');if(!svg)return;
    // Native pointer geometry preserves the existing overlap-candidate behavior.
    if(event.detail===0){const part=event.target.closest('[data-part]');if(part){const [id,side]=part.dataset.part.split('.');choose(id,side,true);}return;}
    const matrix=svg.getScreenCTM();if(!matrix)return;
    const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
    const local=point.matrixTransform(matrix.inverse());
    const hits=[...svg.querySelectorAll('[data-part]')].filter(node=>node.querySelector('path').isPointInFill(local)).map(node=>node.dataset.part);
    if(hits.length===1){const [id,side]=hits[0].split('.');choose(id,side,true);}
    else if(hits.length>1){$('map-status').textContent=t('candidate');$('candidates').hidden=false;$('candidates').className='candidate';$('candidates').innerHTML=hits.map(value=>{const[id,side]=value.split('.');return button('candidate',value,partName(id,side));}).join('');$('candidates').querySelector('button').focus();}
    else{$('candidates').hidden=true;$('map-status').textContent=t('mapMiss');}
  });
  document.addEventListener('keydown',event=>{if(event.isComposing||event.keyCode===229)return;if(event.key==='Escape'&&state.selected){event.preventDefault();closeEditor();return;}if(event.key!=='Enter'&&event.key!==' ')return;const bodyZone=event.target.closest('[data-body-zone]');if(bodyZone){event.preventDefault();const id=bodyZone.dataset.bodyZone;toggle(id);document.querySelector(`[data-body-zone="${id}"]`)?.focus({preventScroll:true});return;}const imageZone=event.target.closest('[data-image-zone]');if(imageZone){event.preventDefault();const id=imageZone.dataset.imageZone;toggle(id);document.querySelector(`[data-image-zone="${id}"]`)?.focus({preventScroll:true});return;}const target=event.target.closest('.map-part');if(target){event.preventDefault();const [id,side]=target.dataset.part.split('.');choose(id,side,true);}});
  render();
})();
