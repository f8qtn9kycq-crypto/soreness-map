// 定位與逆投影的確定性回歸；矩形 fixture 不代替原生 SVG 或真機證據。
const assert=require('node:assert/strict');
const catalog=require('../prototypes/detailed-locations.js');
const diagrams=require('../prototypes/detailed-region-diagrams.js');
const bounds={x:100,y:200,width:90,height:90};
global.document={
  body:{append(){}},
  createElementNS(){return {style:{},append(){},remove(){},setAttribute(){},getBBox(){return bounds;},createSVGPoint(){return {x:0,y:0};},isPointInFill(p){return p.x>=100&&p.x<=190&&p.y>=200&&p.y<=290;}};}
};
const image=require('../prototypes/detailed-location-image.js');
const chest=catalog.regions.find(r=>r.id==='chest');
const location=(id,side,view)=>({id,side,view,path:'M100 200h90v90h-90Z'});
const map={locations:catalog.regions.flatMap(r=>[...r.view].flatMap(view=>['R','L'].map(side=>location(r.id,side,view))))};
function rectangle(path,transform){
  const p=path.match(/^M([^ ]+) ([^h]+)h([^v]+)v([^h]+)h/);assert(p,'rectangular projection');
  const [a,b,c,d,e,f]=transform.match(/matrix\((.*)\)/)[1].split(/\s+/).map(Number);
  const [x,y,w,h]=p.slice(1).map(Number);
  return {x:a*x+c*y+e,y:b*x+d*y+f,width:a*w,height:d*h};
}
for(const side of ['R','L']){
  const geometry=image.build(chest,side,'F',map),layout=image.spatialLayout(geometry);
  assert.equal(layout.columns,3);
  assert.equal(layout.slots.find(s=>s.id==='upper-inner').column,side==='R'?3:1);
  assert.equal(layout.slots.find(s=>s.id==='upper-inner').row,1);
  const order=layout.slots.filter(s=>s.row===1).sort((a,b)=>a.column-b.column).map(s=>s.id);
  assert.deepEqual(order,side==='R'?['upper-outer','upper-central','upper-inner']:['upper-inner','upper-central','upper-outer']);
  const projected=image.project(chest,side,'F',map,['upper-inner']);
  assert.equal(projected.paths.length,1);assert.equal(projected.paths[0].id,'upper-inner');
  assert.notEqual(projected.paths[0].path,map.locations[0].path);
  const patch=rectangle(projected.paths[0].path,projected.paths[0].transform);
  assert(patch.width<32&&patch.height<=30.001,'single cell must not fill the whole region');
  assert(Math.abs(patch.y-200)<.001);
  assert(side==='R'?patch.x>=159:patch.x<=101,'inner cell is on the correct side in front view');
  assert.deepEqual(image.project(chest,side,'F',map,['row-upper']).paths.map(p=>p.id).sort(),['upper-central','upper-inner','upper-outer']);
  assert.deepEqual(image.project(chest,side,'F',map,['col-inner']).paths.map(p=>p.id).sort(),['lower-inner','middle-inner','upper-inner']);
  assert.equal(image.project(chest,side,'F',map,['whole']).paths[0].path,map.locations[0].path);
  assert.deepEqual(image.project(chest,side,'F',map,['unspecified']),{paths:[],hidden:['unspecified']});
  assert.deepEqual(image.project(chest,side,'B',map,['upper-inner']),{paths:[],hidden:['upper-inner']});
  assert.deepEqual(image.project(chest,side,'F',map,[]),{paths:[],hidden:[]});
}
console.log('PASS 胸部左右圖文排列一致；單格／單軸／整區／未知／不可見視角分開投影');
for(const r of catalog.regions)for(const side of ['R','L']){
  const geometry=image.build(r,side,r.view[0],map),layout=image.spatialLayout(geometry);
  assert.equal(layout.slots.length,r.cells.length);
  assert.deepEqual(layout.slots.map(s=>s.id).sort(),r.cells.map(s=>s.id).sort());
  for(const a of geometry.zones)for(const b of geometry.zones){
    const x=layout.slots.find(s=>s.id===a.id),y=layout.slots.find(s=>s.id===b.id);
    if(Math.abs(a.anchor[0]-b.anchor[0])>48)assert.equal(Math.sign(x.column-y.column),Math.sign(a.anchor[0]-b.anchor[0]),r.id+': horizontal order');
    if(Math.abs(a.anchor[1]-b.anchor[1])>70)assert.equal(Math.sign(x.row-y.row),Math.sign(a.anchor[1]-b.anchor[1]),r.id+': vertical order');
  }
}
console.log('PASS 全37類／74側別的文字配置涵蓋每個圖形ID，保留水平與垂直相對順序');
for(const r of catalog.regions)for(const side of ['R','L'])for(const view of [...r.view]){
  for(const option of r.options){
    const result=image.project(r,side,view,map,[option.id]);
    assert(!result.paths.some(p=>p.id==='whole'),'detail must never silently become whole');
    assert(result.paths.length||result.hidden.includes(option.id),'each selected detail is visible or explicitly hidden');
  }
}
const knee=catalog.regions.find(r=>r.id==='jKnee'),foot=catalog.regions.find(r=>r.id==='jFoot');
assert.deepEqual(image.project(knee,'R','F',map,['back']),{paths:[],hidden:['back']});
assert.equal(image.project(knee,'R','B',map,['back']).paths[0].id,'back');
assert.deepEqual(image.project(foot,'R','F',map,['arch-inner']),{paths:[],hidden:['arch-inner']});
assert.deepEqual(image.project(foot,'R','B',map,['arch-inner']),{paths:[],hidden:['arch-inner']});
console.log('PASS 全部細分不自動填滿整區；膝後與足底不偽畫到不可見面');
const full='-50 -40 734 1538';
for(const box of [bounds,{x:215,y:319,width:102,height:114},{x:3,y:668,width:64,height:84},{x:212,y:957,width:68,height:68}]){
  const normal=image.focusViewBox(box,full).split(' ').map(Number),close=image.focusViewBox(box,full,2).split(' ').map(Number);
  assert.equal(normal[0]+normal[2]/2,box.x+box.width/2);assert.equal(normal[1]+normal[3]/2,box.y+box.height/2);
  assert(normal[2]>=box.width*2.79&&normal[3]>=box.height*2.79,'focus retains surrounding body context');
  assert.equal(close[2],normal[2]/2);assert.equal(close[3],normal[3]/2);
  assert.equal(close[0]+close[2]/2,box.x+box.width/2);assert.equal(close[1]+close[3]/2,box.y+box.height/2);
}
assert.equal(image.focusViewBox(null,full),full);
console.log('PASS 全身圖視窗聚焦部位中心並保留上下文；再放大保持中心，無可見部位回到全身');
delete global.document;
