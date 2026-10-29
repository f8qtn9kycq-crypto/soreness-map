/* 筆畫體表位置：只描述圖上的區域，不判定肌肉、病因或診斷。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FREEHAND_LOCATION = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // 與 freehand-data 的封閉白名單同步；資料驗證不依賴瀏覽器模組載入順序。
  const REGIONS = Object.freeze(['neck','shoulder','chest','upperArm','elbow','forearm','wrist','hand','abdomen','upperBack','lowerBack','pelvis','hip','buttock','thigh','knee','lowerLeg','ankle','foot']);
  const NAMES = {
    neck:['頸部','neck'],shoulder:['肩部','shoulder'],chest:['胸部','chest'],upperArm:['上臂','upper arm'],elbow:['手肘','elbow'],forearm:['前臂','forearm'],wrist:['手腕','wrist'],hand:['手部','hand'],abdomen:['腹部','abdomen'],upperBack:['上背','upper back'],lowerBack:['下背','lower back'],pelvis:['骨盆周圍','pelvis area'],hip:['髖部','hip'],buttock:['臀部','buttock'],thigh:['大腿','thigh'],knee:['膝部','knee'],lowerLeg:['小腿','lower leg'],ankle:['腳踝','ankle'],foot:['足部','foot']
  };
  const FAMILY = {scm:'neck',traps:'shoulder',chest:'chest',deltoid:'shoulder',biceps:'upperArm',forearmF:'forearm',abs:'abdomen',obliques:'abdomen',hipFlexor:'hip',quads:'thigh',adductors:'thigh',itBand:'thigh',shin:'lowerLeg',rhomboid:'upperBack',lats:'upperBack',erector:'lowerBack',rearDelt:'shoulder',rotator:'shoulder',triceps:'upperArm',forearmE:'forearm',gluteMax:'buttock',gluteMed:'buttock',hamstrings:'thigh',calf:'lowerLeg',achilles:'ankle',jNeck:'neck',jShoulder:'shoulder',jElbow:'elbow',jWrist:'wrist',jHand:'hand',jThoracic:'upperBack',jLumbar:'lowerBack',jSI:'pelvis',jHip:'hip',jKnee:'knee',jAnkle:'ankle',jFoot:'foot'};
  function validateLocation(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.regions) || !value.regions.length || value.regions.length > REGIONS.length || value.regions.some(id => !REGIONS.includes(id)) || new Set(value.regions).size !== value.regions.length || ![null,'R','L'].includes(value.side) || ![null,'inner','outer','front','back'].includes(value.surface)) throw new Error('體表位置格式不正確。');
    return {regions:[...value.regions],side:value.side,surface:value.surface};
  }
  function label(value,lang) {
    const location = validateLocation(value), en = lang === 'en';
    const side = location.side === null ? '' : en ? (location.side === 'R' ? 'Right ' : 'Left ') : (location.side === 'R' ? '右' : '左');
    const surfaces = en ? {inner:'inner',outer:'outer',front:'front',back:'back'} : {inner:'內側',outer:'外側',front:'前側',back:'後側'};
    return side + location.regions.map(id => NAMES[id][en ? 1 : 0]).join(en ? ' / ' : '／') + (location.surface === null ? '' : (en ? ' · ' : '') + surfaces[location.surface]);
  }
  // 以 SVG 實際長度取樣；新增共線點或停留時的重複點不會改變權重。
  function sample(points,box) {
    const source = points.map(([x,y]) => [box[0]+x*box[2],box[1]+y*box[3]]), segments = [], first = source[0];
    let length = 0;
    for (let i=1;i<source.length;i++) {
      const a=source[i-1],b=source[i],distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if (distance) {segments.push({a,b,start:length,distance});length+=distance;}
    }
    if (!length) return [first];
    const count = Math.min(80,Math.max(2,Math.ceil(length/6)+1)), result=[];
    let cursor=0;
    for(let i=0;i<count;i++) {
      const target=length*i/(count-1);
      while(cursor<segments.length-1 && target>segments[cursor].start+segments[cursor].distance)cursor++;
      const s=segments[cursor],t=Math.max(0,Math.min(1,(target-s.start)/s.distance));
      result.push([s.a[0]+(s.b[0]-s.a[0])*t,s.a[1]+(s.b[1]-s.a[1])*t]);
    }
    return result;
  }
  function infer(stroke,art,map,hit) {
    const unknown = {part:null};
    if (!stroke || !['F','B','RI','RO','LI','LO'].includes(stroke.view) || !art || !Array.isArray(art.box) || art.box.length !== 4 || art.box.some(n=>!Number.isFinite(n)) || art.box[2]<=0 || art.box[3]<=0 || typeof art.inside !== 'function' || !Array.isArray(stroke.points) || !stroke.points.length || stroke.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1))) return unknown;
    const radius=Number.isFinite(stroke.width) && stroke.width>0 ? Math.min(stroke.width,0.2)*art.box[2]/2 : 0;
    // 中心線最多 80 點；另外探測圓形筆刷邊緣，粗筆跨界時不只看中心線。
    const offsets=radius ? Array.from({length:8},(_,i)=>[Math.cos(i*Math.PI/4)*radius,Math.sin(i*Math.PI/4)*radius]) : [];
    const points=sample(stroke.points,art.box).flatMap(([x,y])=>[[x,y],...offsets.map(([dx,dy])=>[x+dx,y+dy])]).filter(([x,y])=>art.inside(x,y));
    if(!points.length)return unknown;
    const regions=new Set(), sides=new Set(), surfaces=new Set();
    let matched=0;
    if(stroke.view.length===2) {
      for(const [,y] of points) {
        const region = y<65 || y>975 ? null : y<470 ? 'thigh' : y<580 ? 'knee' : y<895 ? 'lowerLeg' : 'foot';
        if(region) {regions.add(region);matched++;}
      }
      sides.add(stroke.view[0]);surfaces.add(stroke.view[1]==='I'?'inner':'outer');
    } else {
      if(!map || !Array.isArray(map.locations) || typeof hit!=='function')return unknown;
      const locations=map.locations.filter(p=>p.view===stroke.view && Object.prototype.hasOwnProperty.call(FAMILY,p.id) && ['R','L'].includes(p.side));
      for(const [x,y] of points) {
        const found=locations.filter(p=>hit(p,x,y));
        if(!found.length)continue;
        matched++;
        for(const p of found) {
          regions.add(FAMILY[p.id]);sides.add(p.side);
          surfaces.add(p.id==='adductors'?'inner':p.id==='itBand'?'outer':stroke.view==='F'?'front':'back');
        }
      }
    }
    // 大部分體內筆跡沒有對應區域時不以少數交點代表整筆；跨區／跨側保留集合。
    if(!regions.size || matched/points.length<0.6)return unknown;
    const location={regions:REGIONS.filter(id=>regions.has(id)),side:sides.size===1?[...sides][0]:null,surface:surfaces.size===1?[...surfaces][0]:null};
    // 體表範圍不自動指定肌肉；趨勢直接使用 location。
    return {location,part:null};
  }
  return Object.freeze({REGIONS,validateLocation,label,infer});
});
