/* 獨立原型的選取狀態；只修改傳入的記憶體資料，不讀寫正式紀錄。 */
(function(root){
  'use strict';
  const token=/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
  const validScore=value=>Number.isInteger(value)&&value>=1&&value<=10;
  const key=record=>`${record.region}.${record.side}:${record.zone}`;
  function level(zone){
    if(zone==='whole')return 'whole';
    if(zone==='unspecified'||zone==='unknown')return 'unknown';
    if(typeof zone==='string'&&zone.startsWith('row-'))return 'row';
    if(typeof zone==='string'&&zone.startsWith('col-'))return 'column';
    return 'cell';
  }
  // 紀錄格式只有純量欄位；Map 與每筆紀錄都另建，避免復原資料與編輯互相連動。
  const copyRecords=records=>new Map([...records].map(([id,record])=>[id,{...record}]));
  function snapshot(state){state.undo={records:copyRecords(state.records),selected:state.selected};}
  function counts(state){
    let completed=0;
    for(const record of state.records.values())if(record.completed===true)completed++;
    return {completed,pending:state.records.size-completed,total:state.records.size};
  }
  function select(state,record){
    if(!record||typeof record.region!=='string'||!token.test(record.region)||
      !['R','L'].includes(record.side)||typeof record.zone!=='string'||!token.test(record.zone))return null;
    const id=key(record);
    if(state.records.has(id)){state.selected=id;return {existing:true,replaced:0};}
    const conflicts=[];
    for(const [recordKey,entry] of state.records){
      if(entry.region===record.region&&entry.side===record.side&&level(entry.zone)!==level(record.zone))conflicts.push(recordKey);
    }
    snapshot(state);
    for(const recordKey of conflicts)state.records.delete(recordKey);
    state.records.set(id,{region:record.region,side:record.side,zone:record.zone,severity:null,completed:false});
    state.selected=id;
    return {existing:false,replaced:conflicts.length};
  }
  function rate(state,value){
    const record=state.records.get(state.selected);
    if(!record||!validScore(value))return false;
    record.severity=value;record.completed=false;return true;
  }
  function complete(state){
    const record=state.records.get(state.selected);
    if(!record||!validScore(record.severity))return false;
    record.completed=true;state.selected=null;return true;
  }
  function remove(state,recordKey=state.selected){
    if(!state.records.has(recordKey))return false;
    snapshot(state);state.records.delete(recordKey);
    if(state.selected===recordKey)state.selected=null;
    return true;
  }
  function clear(state){
    if(!state.records.size)return false;
    snapshot(state);state.records.clear();state.selected=null;return true;
  }
  function undo(state){
    if(!state.undo)return false;
    const previous=state.undo;
    state.records=copyRecords(previous.records);state.selected=previous.selected;state.undo=null;
    return true;
  }
  const api={key,level,counts,select,rate,complete,remove,clear,undo};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.DETAIL_SELECTION_STATE=api;
})(typeof window==='object'?window:globalThis);
