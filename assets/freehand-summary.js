/* 全身總結的顯示投影；不回寫筆畫，也不是臨床精準的組織定位。 */
(function (root, factory) {
  const geometry=typeof module==='object' && module.exports ? require('./freehand-summary-geometry.js') : root.FREEHAND_SUMMARY_GEOMETRY;
  const api = factory(geometry);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FREEHAND_SUMMARY = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (geometry) {
  'use strict';
  // 沿用已確認 Demo 的垂直錨點與筆寬比例；水平位置依同側腿部實際輪廓。
  const ANCHORS = [[65,665],[470,970],[580,1035],[895,1324],[975,1420]];
  const NAMES = {
    adductors:['大腿內收肌群','Thigh adductor group'],
    fibularis:['腓骨肌群（腓骨長肌、腓骨短肌）','Fibularis group (fibularis longus, fibularis brevis)'],
    knee:['膝關節','Knee joint'],
    ankle:['踝關節','Ankle joint']
  };
  function copy(value) {
    if (Array.isArray(value)) return value.map(copy);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,copy(item)]));
    return value;
  }
  function targetY(y) {
    let index=0;
    while(index<ANCHORS.length-2 && y>ANCHORS[index+1][0])index++;
    const [y0,t0]=ANCHORS[index],[y1,t1]=ANCHORS[index+1];
    return t0+(y-y0)/(y1-y0)*(t1-t0);
  }
  function rowAt(y,column) {
    const rows=geometry.rows;
    if(y<=rows[0][column])return rows[0];
    if(y>=rows[rows.length-1][column])return rows[rows.length-1];
    let low=0,high=rows.length-1;
    while(high-low>1){const mid=(low+high)>>1;if(rows[mid][column]<=y)low=mid;else high=mid;}
    const a=rows[low],b=rows[high],fraction=(y-a[column])/(b[column]-a[column]);
    return a.map((value,index)=>value+(b[index]-value)*fraction);
  }
  function legBounds(y,side) {
    if(!geometry || !Number.isFinite(y) || !['R','L'].includes(side) || y<geometry.rows[0][3] || y>geometry.rows.at(-1)[3])return null;
    const row=rowAt(y,3),column=side==='R'?4:6;
    return row.slice(column,column+2);
  }
  function band(row,view) {
    const column=view[0]==='R'?4:6,left=row[column],width=row[column+1]-left;
    const low=(view==='RO'||view==='LI')?.08:.54;
    return [left+width*low,left+width*(low+.38)];
  }
  function bodyArt(artProvider) {
    const art=artProvider && typeof artProvider.get==='function' && artProvider.get('F');
    if(!geometry || !art || !Array.isArray(art.box) || art.box.length!==4 || !art.box.every(Number.isFinite) || art.box[2]<=0 || art.box[3]<=0)throw new Error('全身投影缺少圖形或幾何表。');
    return art;
  }
  function normalize([x,y],art) {return [(x-art.box[0])/art.box[2],(y-art.box[1])/art.box[3]];}
  function clip(view,artProvider) {
    if(view==='F'||view==='B')return null;
    if(!['RI','RO','LI','LO'].includes(view))throw new Error('無效的筆畫視角。');
    const art=bodyArt(artProvider),left=[],right=[];
    for(const row of geometry.rows){const bounds=band(row,view);left.push(normalize([bounds[0],row[3]],art));right.push(normalize([bounds[1],row[3]],art));}
    return [...left,...right.reverse()];
  }
  function project(stroke, artProvider, map) {
    if (!stroke || !['F','B','RI','RO','LI','LO'].includes(stroke.view)) throw new Error('無效的筆畫視角。');
    const result = copy(stroke);
    if (stroke.view === 'F' || stroke.view === 'B') return result;
    const art=bodyArt(artProvider),source=[];
    // 以最多 2px 垂直間距補點，讓跨列曲線跟隨投影帶；不改原始控制點。
    stroke.points.forEach((point,index)=>{
      if(index){const previous=stroke.points[index-1],steps=Math.max(1,Math.ceil(Math.abs(point[1]-previous[1])*1040/2));for(let k=1;k<steps;k++)source.push([previous[0]+(point[0]-previous[0])*k/steps,previous[1]+(point[1]-previous[1])*k/steps]);}
      source.push(point);
    });
    result.points=source.map(([nx,ny])=>{
      const y=ny*1040,row=rowAt(y,0),bounds=band(row,stroke.view);
      // 不截斷 fraction：原圖外的尾端仍在投影帶外，由對應 clip 裁掉。
      const fraction=(nx*320-row[1])/(row[2]-row[1]);
      return normalize([bounds[0]+fraction*(bounds[1]-bounds[0]),targetY(y)],art);
    });
    result.width=stroke.width*320*.45/art.box[2];
    result.displaySourceView=stroke.view;
    result.view='F';
    return result;
  }
  function nearby(stroke, lang) {
    const result={muscles:[],joints:[]}, location=stroke && stroke.location;
    // 舊筆畫缺少 location 時不以 part、視角或投影座標回填。
    if (!location || !Array.isArray(location.regions)) return result;
    const names=new Set(location.regions), index=lang==='en' ? 1 : 0;
    if (names.has('thigh') && location.surface==='inner') result.muscles.push(NAMES.adductors[index]);
    if (names.has('lowerLeg') && location.surface==='outer') result.muscles.push(NAMES.fibularis[index]);
    if (names.has('knee')) result.joints.push(NAMES.knee[index]);
    if (names.has('ankle')) result.joints.push(NAMES.ankle[index]);
    return result;
  }
  return Object.freeze({project,clip,legBounds,nearby});
});
