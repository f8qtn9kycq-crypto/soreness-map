/* 圖上附近的解剖名稱；只讀取筆畫，不識別疼痛組織或寫入儲存資料。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FREEHAND_ANATOMY = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // 名稱粒度與來源限制見 docs/qa/anatomy-sources.md。區域路徑不是組織邊界。
  const muscle=(id,zh,en)=>({kind:'muscles',id,zh,en});
  const joint=(id,zh,en)=>({kind:'joints',id,zh,en});
  const MAPPING=Object.freeze(Object.fromEntries(Object.entries({
    scm:muscle('scm','胸鎖乳突肌','Sternocleidomastoid'),
    traps:muscle('traps','斜方肌','Trapezius'),
    chest:muscle('chest','胸大肌','Pectoralis major'),
    deltoid:muscle('deltoid','三角肌','Deltoid'),
    biceps:muscle('biceps','肱二頭肌','Biceps brachii'),
    forearmF:muscle('forearmF','前臂屈肌群','Forearm flexors'),
    abs:muscle('abs','腹直肌','Rectus abdominis'),
    obliques:muscle('obliques','腹斜肌群','Abdominal obliques'),
    hipFlexor:muscle('hipFlexor','髖屈肌群','Hip flexors'),
    quads:muscle('quads','股四頭肌','Quadriceps'),
    adductors:muscle('adductors','大腿內收肌群','Hip adductors'),
    itBand:{kind:'fallback',reason:'髂脛束是結締組織；保留大腿外側區域，不列為肌肉或關節。'},
    shin:muscle('shin','脛前肌','Tibialis anterior'),
    rhomboid:muscle('rhomboid','菱形肌群','Rhomboids'),
    lats:muscle('lats','背闊肌','Latissimus dorsi'),
    erector:muscle('erector','豎脊肌群','Erector spinae'),
    rearDelt:muscle('deltoid','三角肌','Deltoid'),
    rotator:muscle('rotator','旋轉肌袖肌群','Rotator cuff muscles'),
    triceps:muscle('triceps','肱三頭肌','Triceps brachii'),
    forearmE:muscle('forearmE','前臂伸肌群','Forearm extensors'),
    gluteMax:muscle('gluteMax','臀大肌','Gluteus maximus'),
    gluteMed:muscle('gluteMed','臀中肌','Gluteus medius'),
    hamstrings:muscle('hamstrings','腿後肌群','Hamstrings'),
    calf:muscle('calf','小腿後側肌群','Posterior calf muscles'),
    achilles:{kind:'fallback',reason:'阿基里斯腱是肌腱；保留腳跟後側區域，不列為肌肉或關節。'},
    jNeck:joint('jNeck','頸椎關節','Cervical spine joints'),
    jShoulder:joint('jShoulder','肩關節','Shoulder joint'),
    jElbow:joint('jElbow','肘關節','Elbow joint'),
    jWrist:joint('jWrist','腕關節','Wrist joint'),
    jHand:joint('jHand','手部關節','Hand joints'),
    jThoracic:joint('jThoracic','胸椎關節','Thoracic spine joints'),
    jLumbar:joint('jLumbar','腰椎關節','Lumbar spine joints'),
    jSI:joint('jSI','薦髂關節','Sacroiliac joint'),
    jHip:joint('jHip','髖關節','Hip joint'),
    jKnee:joint('jKnee','膝關節','Knee joint'),
    jAnkle:joint('jAnkle','踝關節','Ankle joint'),
    jFoot:joint('jFoot','足部關節','Foot joints')
  }).map(([id,entry])=>[id,Object.freeze(entry)])));
  const ORDER=[...new Set(Object.values(MAPPING).filter(x=>x.id).map(x=>x.id))];
  // 同一路徑依真實弧長均勻取樣，不受事件密度或停留重複點影響。
  function sample(points,box) {
    const source=points.map(([x,y])=>[box[0]+x*box[2],box[1]+y*box[3]]),segments=[];
    let length=0;
    for(let i=1;i<source.length;i++) {
      const a=source[i-1],b=source[i],distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if(distance) {segments.push({a,b,start:length,distance});length+=distance;}
    }
    if(!length)return [source[0]];
    // 超出可穩定取樣的長度時保留區域描述，不以稀疏取樣猜名稱。
    if(length>1440)return [];
    // 短線至少17點，避免粗取樣對窄熱區邊界造成比例偏差；不是獨立臨床觀察。
    const count=Math.min(80,Math.max(17,Math.ceil(length/6)+1)),result=[];
    let cursor=0;
    for(let i=0;i<count;i++) {
      const target=length*i/(count-1);
      while(cursor<segments.length-1&&target>segments[cursor].start+segments[cursor].distance)cursor++;
      const s=segments[cursor],t=Math.max(0,Math.min(1,(target-s.start)/s.distance));
      result.push([s.a[0]+(s.b[0]-s.a[0])*t,s.a[1]+(s.b[1]-s.a[1])*t]);
    }
    return result;
  }
  function analyze(stroke,art,map,hit) {
    const empty=()=>({muscles:[],joints:[]});
    if(!stroke||!['F','B'].includes(stroke.view)||!art||!Array.isArray(art.box)||art.box.length!==4||art.box.some(n=>!Number.isFinite(n))||art.box[2]<=0||art.box[3]<=0||typeof art.inside!=='function'||!map||!Array.isArray(map.locations)||typeof hit!=='function'||!Array.isArray(stroke.points)||!stroke.points.length||stroke.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1)))return empty();
    if(stroke.width!==undefined&&(!Number.isFinite(stroke.width)||stroke.width<0||stroke.width>0.2))return empty();
    const centers=sample(stroke.points,art.box);
    if(!centers.length)return empty();
    const radius=(stroke.width||0)*art.box[2]/2,offsets=[[0,0]];
    // 內外兩圈涵蓋圓形筆刷；單一最外緣命中不足以列出名稱。
    if(radius)for(const [count,scale] of [[4,0.5],[8,0.85]])for(let i=0;i<count;i++)offsets.push([Math.cos(i*2*Math.PI/count)*radius*scale,Math.sin(i*2*Math.PI/count)*radius*scale]);
    const locations=map.locations.filter(p=>p&&p.view===stroke.view&&['R','L'].includes(p.side)&&Object.prototype.hasOwnProperty.call(MAPPING,p.id));
    const counts=new Map();
    let inside=0,matched=0,centerInside=0,centerMatched=0;
    for(const [cx,cy] of centers)for(const [dx,dy] of offsets) {
      const x=cx+dx,y=cy+dy;
      if(!art.inside(x,y))continue;
      inside++;
      const core=dx===0&&dy===0;if(core)centerInside++;
      let any=false;
      const found=new Map();
      for(const location of locations)if(hit(location,x,y)) {
        any=true;
        const entry=MAPPING[location.id];
        if(entry.kind!=='fallback')found.set(entry.id+':'+location.side,{...entry,side:location.side});
      }
      if(any){matched++;if(core)centerMatched++;}
      for(const [key,entry] of found) {
        const prior=counts.get(key);
        counts.set(key,{entry,count:(prior?prior.count:0)+1,core:(prior?prior.core:0)+(core?1:0)});
      }
    }
    // 窄部位可有大部分筆刷落在輪廓外；明確位於熱區的整段中心線仍是位置證據。
    // 兩種證據都不成立時，不以少量邊緣交點猜名稱。
    const centerEvidence=centerInside/centers.length>=0.8&&centerMatched/centerInside>=0.8;
    const areaEvidence=inside/(centers.length*offsets.length)>=0.5&&matched/inside>=0.6;
    if(!inside||(!centerEvidence&&!areaEvidence))return empty();
    const coreSupported=x=>centerEvidence&&x.core/centerInside>=0.3&&x.core>=Math.min(3,centerInside);
    let selected=[...counts.values()].filter(x=>(areaEvidence&&x.count/inside>=0.15&&x.count>=Math.min(3,inside))||coreSupported(x));
    // 筆刷同時碰到過多相鄰熱區時，只保留有中心線支持的名稱；仍模糊就退回區域。
    if(selected.length>6)selected=selected.filter(coreSupported);
    if(selected.length>6)return empty();
    selected.sort((a,b)=>ORDER.indexOf(a.entry.id)-ORDER.indexOf(b.entry.id)||(a.entry.side==='R'?-1:1));
    const result=empty();
    for(const {entry} of selected) {
      const {id,side,zh,en}=entry;
      result[entry.kind].push({id,side,zh,en});
    }
    return result;
  }
  return Object.freeze({MAPPING,analyze});
});
