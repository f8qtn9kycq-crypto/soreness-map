/* 手繪紀錄資料契約：不存取 DOM，不自動讀寫任何儲存區。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FREEHAND_DATA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KEYS = Object.freeze({entries:'bodymap.draw.v2',draft:'bodymap.draw.draft.v2'});
  const PARTS = Object.freeze(['scm','traps','chest','deltoid','biceps','forearmF','abs','obliques','hipFlexor','quads','adductors','itBand','shin','rhomboid','lats','erector','rearDelt','rotator','triceps','forearmE','gluteMax','gluteMed','hamstrings','calf','achilles','jNeck','jShoulder','jElbow','jWrist','jHand','jThoracic','jLumbar','jSI','jHip','jKnee','jAnkle','jFoot'].flatMap(id => ['R','L'].map(side => id+'.'+side)));
  const VIEWS = Object.freeze(['F','B','RI','RO','LI','LO']);
  const LEGACY_TYPES = ['sore','pain','tight','sharp','numb'];
  const LEGACY_MAP = {neck:'jNeck',shoulder:'jShoulder',scapula:'rhomboid',upperBack:'jThoracic',lowerBack:'jLumbar',elbow:'jElbow',hip:'jHip',glute:'gluteMax',thighF:'quads',thighB:'hamstrings',knee:'jKnee',ankle:'jAnkle'};
  const MAX_ENTRIES = 10000, MAX_TEXT = 10000;
  const own = (object,key) => Object.prototype.hasOwnProperty.call(object,key);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const clone = value => JSON.parse(JSON.stringify(value));
  const fail = message => { throw new Error(message); };
  const safeId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,127}$/.test(value);
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value+'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
  }
  function today() {
    const date = new Date();
    return new Date(date-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
  }
  function emptyDraft(date = today()) { return {date,workout:'',strokes:[]}; }
  function text(value) {
    if (typeof value !== 'string' || value.length > MAX_TEXT) fail('文字格式不正確或超過 10000 字元。');
    return value;
  }
  function stroke(value, saved) {
    if (!record(value) || !safeId(value.id) || !VIEWS.includes(value.view) || value.artVersion !== 'surface-v1') fail('筆畫識別或人體圖版本不正確。');
    if (!Array.isArray(value.points) || value.points.length < 1 || value.points.length > 2000) fail('每筆畫需要 1 至 2000 個座標。');
    const points = value.points.map(point => {
      if (!Array.isArray(point) || point.length !== 2 || point.some(n => typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1)) fail('筆畫座標必須介於 0 與 1。');
      return [...point];
    });
    if (typeof value.width !== 'number' || !Number.isFinite(value.width) || value.width < 0.001 || value.width > 0.2) fail('筆畫寬度不正確。');
    if (!(value.severity === null && !saved) && !(Number.isInteger(value.severity) && value.severity >= 1 && value.severity <= 10)) fail('請為每一筆畫評分（1 至 10）。');
    if (value.part !== null && !PARTS.includes(value.part)) fail('部位標籤不正確。');
    return {id:value.id,view:value.view,artVersion:'surface-v1',points,width:value.width,severity:value.severity,part:value.part,note:text(value.note)};
  }
  function normalize(value, saved) {
    if (!record(value) || !validDate(value.date) || !Array.isArray(value.strokes) || value.strokes.length > 200 || (saved && !value.strokes.length)) fail('日期或筆畫數量不正確。');
    if (saved && !safeId(value.id)) fail('紀錄識別不正確。');
    const ids = new Set();
    const strokes = value.strokes.map(value => {
      const item = stroke(value,saved);
      if (ids.has(item.id)) fail('同一紀錄內的筆畫識別不可重複。');
      ids.add(item.id);
      return item;
    });
    return {...(saved ? {id:value.id} : {}),date:value.date,workout:text(value.workout),strokes};
  }
  const validateDraft = value => normalize(value,false);
  const validateEntry = value => normalize(value,true);
  function normalizeLegacy(value) {
    if (!record(value) || !Number.isSafeInteger(value.id) || value.id < 0 || !validDate(value.date) || typeof value.workout !== 'string' || !record(value.parts)) fail('舊版紀錄格式不正確。');
    const parts = {};
    for (const [key,item] of Object.entries(value.parts)) {
      const [part,side,...extra] = key.split('.');
      const mapped = (own(LEGACY_MAP,part) ? LEGACY_MAP[part] : part)+'.'+side;
      if (extra.length || !PARTS.includes(mapped) || own(parts,mapped) || !record(item) || !Number.isInteger(item.s) || item.s < 0 || item.s > 10 || !Array.isArray(item.t) || item.t.some(type => !LEGACY_TYPES.includes(type)) || typeof item.n !== 'string') fail('舊版部位格式不正確。');
      parts[mapped] = {s:item.s,t:[...new Set(item.t)],n:item.n};
    }
    return {id:value.id,date:value.date,workout:value.workout,parts};
  }
  function list(value, normalizer) {
    if (!Array.isArray(value) || value.length > MAX_ENTRIES) fail('紀錄清單格式不正確或超過 10000 筆。');
    return value.map(normalizer);
  }
  // 固定欄位順序後比較內容；筆畫順序代表繪製順序，不能重排。
  function mergeEntries(existing,incoming) {
    const merged = [], ids = new Map();
    for (const entry of [...list(existing,validateEntry),...list(incoming,validateEntry)]) {
      const serialized = JSON.stringify(entry);
      if (ids.has(entry.id)) {
        if (ids.get(entry.id) !== serialized) fail('相同紀錄識別含不同內容；整批匯入已取消。');
      } else { ids.set(entry.id,serialized); merged.push(entry); }
    }
    if (merged.length > MAX_ENTRIES) fail('紀錄超過 10000 筆。');
    return merged;
  }
  // 保留既有 v1 行為：跨備份碰到同一舊版 ID 時以現有紀錄為準。
  function mergeLegacy(existing,incoming) {
    const merged = [], ids = new Set();
    for (const entry of [...list(existing,normalizeLegacy),...list(incoming,normalizeLegacy)]) {
      if (!ids.has(entry.id)) { ids.add(entry.id); merged.push(entry); }
    }
    if (merged.length > MAX_ENTRIES) fail('舊版紀錄超過 10000 筆。');
    return merged;
  }
  function legacyList(value) {
    const entries = list(value,normalizeLegacy), ids = new Set();
    for (const entry of entries) {
      if (ids.has(entry.id)) fail('舊版備份含重複識別。');
      ids.add(entry.id);
    }
    return entries;
  }
  function parseBackup(value) {
    if (typeof value === 'string') {
      value = JSON.parse(value);
    }
    if (Array.isArray(value)) return {entries:legacyList(value),drawEntries:[]};
    if (!record(value)) fail('備份格式不正確。');
    if (value.v === undefined || value.v === 1) return {entries:legacyList(value.entries),drawEntries:[]};
    if (value.v !== 2) fail('不支援此備份版本。');
    return {entries:legacyList(value.entries),drawEntries:mergeEntries([],value.drawEntries),...(own(value,'drawDraft') ? {drawDraft:validateDraft(value.drawDraft)} : {})};
  }
  function makeBackup(legacyEntries,drawEntries,drawDraft) {
    return {v:2,entries:mergeLegacy([],legacyEntries),drawEntries:mergeEntries([],drawEntries),...(drawDraft === undefined ? {} : {drawDraft:validateDraft(drawDraft)})};
  }
  function trend(entries,part) {
    if (part !== null && !PARTS.includes(part)) fail('趨勢部位不正確。');
    return mergeEntries([],entries).flatMap(entry => entry.strokes.filter(item => item.part === part).map(item => ({entryId:entry.id,strokeId:item.id,date:entry.date,severity:item.severity}))).sort((a,b) => a.date.localeCompare(b.date));
  }
  function csv(entries,includeText = false) {
    const cell = value => {
      let valueText = String(value === null ? '' : value);
      if (/^[\s\uFEFF]*[=+\-@]/.test(valueText)) valueText = "'"+valueText;
      return '"'+valueText.replace(/"/g,'""')+'"';
    };
    // 側別只來自明確視角或手動部位標籤，不從筆畫座標推定。
    const side = item => ['RI','RO'].includes(item.view) ? 'R' : ['LI','LO'].includes(item.view) ? 'L' : item.part === null ? '' : item.part.split('.')[1];
    const rows = [['entry_id','date','stroke_id','view','side','part','severity',...(includeText ? ['workout','note'] : [])]];
    for (const entry of mergeEntries([],entries)) for (const item of entry.strokes) rows.push([entry.id,entry.date,item.id,item.view,side(item),item.part,item.severity,...(includeText ? [entry.workout,item.note] : [])]);
    return rows.map(row => row.map(cell).join(',')).join('\r\n');
  }
  function createStore(storage) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') fail('需要可用的瀏覽器儲存介面。');
    const blocked = new Set();
    const initial = () => ({v:2,revision:0,drawEntries:[],importedLegacy:[],drawDraft:emptyDraft()});
    function read(key,validate,fallback) {
      try {
        const raw = storage.getItem(key);
        return raw === null ? fallback : validate(JSON.parse(raw));
      } catch (_) { blocked.add(key); return fallback; }
    }
    function envelope(value) {
      if (!record(value) || value.v !== 2 || !Number.isSafeInteger(value.revision) || value.revision < 0) fail('儲存格式不正確。');
      return {v:2,revision:value.revision,drawEntries:mergeEntries([],value.drawEntries),importedLegacy:legacyList(value.importedLegacy),drawDraft:validateDraft(value.drawDraft)};
    }
    function readState() {
      const main = read(KEYS.entries,envelope,initial());
      const draftRecord = read(KEYS.draft,value => {
        if (!record(value) || value.v !== 2 || !Number.isSafeInteger(value.revision) || value.revision < 0) fail('草稿儲存格式不正確。');
        return {revision:value.revision,draft:validateDraft(value.draft)};
      },null);
      return {main,draft:draftRecord && draftRecord.revision === main.revision ? draftRecord.draft : main.drawDraft};
    }
    function load() {
      const state = readState();
      return clone({entries:state.main.drawEntries,draft:state.draft,importedLegacy:state.main.importedLegacy,blocked:[...blocked]});
    }
    function write(key,value) {
      if (blocked.has(key)) return {ok:false,error:'既有資料無法安全讀取，已停止覆寫；請先備份原始網站資料。'};
      try { storage.setItem(key,JSON.stringify(value)); return {ok:true}; }
      catch (_) { return {ok:false,error:'瀏覽器未能保存變更，請保留頁面並匯出備份後重試。'}; }
    }
    function attempt(action) { try { return action(); } catch (error) { return {ok:false,error:error.message}; } }
    function commit(state,entries,legacy,draft) {
      if (state.main.revision === Number.MAX_SAFE_INTEGER) fail('儲存版本已達上限；請先匯出完整備份。');
      return write(KEYS.entries,{v:2,revision:state.main.revision+1,drawEntries:entries,importedLegacy:legacy,drawDraft:draft});
    }
    function saveDraft(value) {
      return attempt(() => {
        const draft = validateDraft(value), state = readState();
        if (blocked.has(KEYS.entries)) return {ok:false,error:'歷史資料無法安全讀取，暫停儲存草稿以避免混淆。'};
        return write(KEYS.draft,{v:2,revision:state.main.revision,draft});
      });
    }
    function saveEntry(value) {
      return attempt(() => {
        const entry = validateEntry(value), state = readState();
        const result = commit(state,mergeEntries(state.main.drawEntries,[entry]),state.main.importedLegacy,emptyDraft(entry.date));
        if (!result.ok) return result;
        // 新 revision 已使舊草稿失效；清除失敗不會讓儲存的紀錄變成失敗或重現草稿。
        if (blocked.has(KEYS.draft)) return {ok:true,warning:'紀錄已儲存；無法讀取的舊草稿原始資料仍保留。'};
        try {
          if (typeof storage.removeItem === 'function') storage.removeItem(KEYS.draft);
          else storage.setItem(KEYS.draft,JSON.stringify({v:2,revision:state.main.revision+1,draft:emptyDraft(entry.date)}));
          return result;
        } catch (_) { return {ok:true,warning:'紀錄已儲存；舊草稿清理失敗，但不會再次載入。'}; }
      });
    }
    function importBackup(value) {
      return attempt(() => {
        // 接受 parseBackup 的回傳，也接受原始備份；驗證整批後才進行單次寫入。
        const parsed = parseBackup(record(value) && !own(value,'v') && own(value,'drawEntries') ? {v:2,...value} : value);
        const state = readState();
        return commit(state,mergeEntries(state.main.drawEntries,parsed.drawEntries),mergeLegacy(state.main.importedLegacy,parsed.entries),own(parsed,'drawDraft') ? parsed.drawDraft : state.draft);
      });
    }
    function deleteEntry(id) {
      return attempt(() => {
        if (!safeId(id)) fail('紀錄識別不正確。');
        const state = readState();
        return commit(state,state.main.drawEntries.filter(entry => entry.id !== id),state.main.importedLegacy,state.draft);
      });
    }
    return Object.freeze({load,saveDraft,saveEntry,importBackup,deleteEntry});
  }
  return Object.freeze({KEYS,PARTS,VIEWS,validDate,emptyDraft,validateDraft,validateEntry,parseBackup,mergeEntries,makeBackup,csv,trend,createStore});
});
