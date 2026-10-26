/* 既有體表輪廓的局部展開示意；不改原圖、部位ID或醫療語意。 */
(function(root){
  'use strict';
  const cache=new Map();
  const rect=(x,y,w,h)=>`M${x} ${y}h${w}v${h}h${-w}Z`;
  function sourceDiagram(region,side,view,location){
    const cacheKey=`${region.id}.${side}.${view}.${region.cols?.map(c=>c.id).join(',')||''}`;
    if(cache.has(cacheKey))return cache.get(cacheKey);
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
    svg.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;pointer-events:none';
    path.setAttribute('d',location.path);svg.append(path);document.body.append(svg);
    const box=path.getBBox(),left=140,top=64,width=360,height=288;
    // 局部獨立展開圖調整橫縱比例，以容納手機點選；不宣稱解剖比例。
    const sx=width/box.width,sy=height/box.height;
    const transform=`matrix(${sx} 0 0 ${sy} ${left-box.x*sx} ${top-box.y*sy})`;
    const points=[];
    for(let y=top+2;y<top+height;y+=4)for(let x=left+2;x<left+width;x+=4){
      const point=svg.createSVGPoint();point.x=(x-left)/sx+box.x;point.y=(y-top)/sy+box.y;
      if(path.isPointInFill(point))points.push([x,y]);
    }
    svg.remove();
    const horizontal=region.id==='traps';
    const rowCount=horizontal?1:region.rows.length,colCount=horizontal?region.cells.length:(region.cols?.length||1);
    const lateralFirst=region.cols?.[0]?.id==='thumb';
    const medialAtRight=(view==='F')===(side==='R');
    const reverse=lateralFirst?!medialAtRight:medialAtRight;
    const zones=[];
    for(let row=0;row<rowCount;row++){
      const y0=top+row*height/rowCount,y1=top+(row+1)*height/rowCount;
      const samples=points.filter(p=>p[1]>=y0&&p[1]<y1),xs=samples.map(p=>p[0]).sort((a,b)=>a-b);
      if(!xs.length)throw Error(`Empty source strip: ${cacheKey}:${row}`);
      // 按每段的可見輪廓分配內／外位置，避免彎曲輪廓的角落出現空白熱區。
      const stops=[left,...Array.from({length:colCount-1},(_,i)=>xs[Math.floor(xs.length*(i+1)/colCount)]),left+width];
      for(let col=0;col<colCount;col++){
        const displayCol=reverse?colCount-col-1:col,x0=stops[displayCol],x1=stops[displayCol+1];
        const id=horizontal?region.cells[col].id:region.cols?`${region.rows[row].id}-${region.cols[col].id}`:region.cells[row].id;
        const filled=samples.filter(p=>p[0]>=x0&&p[0]<x1);
        if(!filled.length)throw Error(`Empty source cell: ${cacheKey}:${id}`);
        const center=[filled.reduce((n,p)=>n+p[0],0)/filled.length,filled.reduce((n,p)=>n+p[1],0)/filled.length];
        const anchor=filled.reduce((best,p)=>(p[0]-center[0])**2+(p[1]-center[1])**2<(best[0]-center[0])**2+(best[1]-center[1])**2?p:best);
        zones.push({id,path:rect(x0,y0,x1-x0,y1-y0),anchor,clip:'source',row:row+1,column:displayCol+1});
      }
    }
    const directionLabels=region.cols?[region.cols[reverse?colCount-1:0],region.cols[reverse?0:colCount-1]]:horizontal?[region.cells[reverse?colCount-1:0],region.cells[reverse?0:colCount-1]]:[];
    const labels=directionLabels.map((l,n)=>({zh:l.zh,en:l.en,x:n?610:30,y:36,align:n?'end':'start'}));
    labels.push({zh:(view==='F'?'正面':'背面')+'・局部展開',en:(view==='F'?'Front':'Back')+' · expanded local view',x:320,y:390});
    const result={width:640,height:410,source:{path:location.path,transform,inverseTransform:`matrix(${1/sx} 0 0 ${1/sy} ${box.x-left/sx} ${box.y-top/sy})`,bounds:{x:box.x,y:box.y,width:box.width,height:box.height}},backgrounds:[],labels,zones,worldPoints:points.map(p=>[(p[0]-left)/sx+box.x,(p[1]-top)/sy+box.y])};
    cache.set(cacheKey,result);return result;
  }
  function build(region,side,view,map){
    const custom=root.DETAIL_REGION_DIAGRAMS?.build(region,side);
    if(custom)return custom;
    if(!map)return null;
    const viewId=region.view.includes(view)?view:region.view[0];
    const location=map.locations.find(p=>p.id===region.id&&p.side===side&&p.view===viewId);
    return location?sourceDiagram(region,side,viewId,location):null;
  }
  function spatialLayout(geometry){
    if(!geometry?.zones.length)return null;
    const zones=geometry.zones;
    if(zones.every(z=>Number.isInteger(z.row)&&Number.isInteger(z.column)))return {columns:Math.max(...zones.map(z=>z.column)),slots:zones.map(z=>({id:z.id,row:z.row,column:z.column}))};
    const cluster=(index,tolerance)=>{
      const groups=[];
      for(const z of [...zones].sort((a,b)=>a.anchor[index]-b.anchor[index])){
        const value=z.anchor[index],last=groups.at(-1);
        if(last&&value-last.mean<=tolerance){last.values.push(value);last.mean=last.values.reduce((n,v)=>n+v,0)/last.values.length;}
        else groups.push({mean:value,values:[value]});
      }
      return value=>groups.reduce((best,g,n)=>Math.abs(g.mean-value)<Math.abs(groups[best].mean-value)?n:best,0)+1;
    };
    const column=cluster(0,24),row=cluster(1,35);
    const slots=zones.map(z=>({id:z.id,row:row(z.anchor[1]),column:column(z.anchor[0])}));
    return {columns:Math.max(...slots.map(s=>s.column)),slots};
  }
  function covers(region,selected,cell){
    return selected==='whole'||selected===cell||region.rows.some(r=>selected==='row-'+r.id&&cell.startsWith(r.id+'-'))||region.cols?.some(c=>selected==='col-'+c.id&&cell.endsWith('-'+c.id));
  }
  // 全身圖只投影在該視角可見的體表區域；足底等不可見面不硬畫成整區。
  function project(region,side,view,map,selected){
    const location=map?.locations.find(p=>p.id===region.id&&p.side===side&&p.view===view);
    if(!location)return {paths:[],hidden:[...selected]};
    if(selected.includes('whole'))return {paths:[{id:'whole',path:location.path}],hidden:selected.filter(id=>id!=='whole')};
    if(selected.every(id=>id==='unspecified'))return {paths:[],hidden:[...selected]};
    let sourceRegion=region;
    if(region.id==='jNeck'||region.id==='adductors'){
      const visible=region.id==='jNeck'?(view==='F'?['front','side']:['back','side']):['front','inner'];
      sourceRegion={...region,cols:visible.map(id=>region.cols.find(c=>c.id===id))};
    }
    const customIds=new Set(['hipFlexor','rotator','achilles','jShoulder','jElbow','jWrist','jHand','jSI','jHip','jKnee','jAnkle','jFoot']);
    const source=sourceDiagram(sourceRegion,side,view,location);
    let zones;
    if(!customIds.has(region.id))zones=source.zones.map(z=>({id:z.id,path:z.path,transform:source.source.inverseTransform,anchor:[(z.anchor[0]-140)/360*source.source.bounds.width+source.source.bounds.x,(z.anchor[1]-64)/288*source.source.bounds.height+source.source.bounds.y],row:z.row,column:z.column}));
    else{
      const b=source.source.bounds,innerLeft=(view==='B')===(side==='R');
      const area=(id,x,y,w,h)=>{
        const box={x:b.x+(innerLeft?x:1-x-w)*b.width,y:b.y+y*b.height,width:w*b.width,height:h*b.height};
        const center=[box.x+box.width/2,box.y+box.height/2];
        const filled=source.worldPoints.filter(p=>p[0]>=box.x&&p[0]<=box.x+box.width&&p[1]>=box.y&&p[1]<=box.y+box.height);
        const anchor=filled.reduce((best,p)=>(p[0]-center[0])**2+(p[1]-center[1])**2<(best[0]-center[0])**2+(best[1]-center[1])**2?p:best,filled[0]||center);
        return {id,path:rect(box.x,box.y,box.width,box.height),anchor};
      };
      const faces={
        hipFlexor:()=>[area('crease-inner',0,0,1/3,.55),area('crease-center',1/3,0,1/3,.55),area('crease-outer',2/3,0,1/3,.55),area('below',0,.55,1,.45)],
        rotator:()=>[area('upper',0,0,.7,1/3),area('center',0,1/3,.7,1/3),area('lower',0,2/3,.7,1/3),area('outer',.7,0,.3,1)],
        jSI:()=>[area('upper',0,0,.7,1/3),area('middle',0,1/3,.7,1/3),area('lower',0,2/3,.7,1/3),area('outer',.7,0,.3,1)],
        achilles:()=>[area('above',0,0,1,.45),area('inner',0,.45,1/3,.55),area('back',1/3,.45,1/3,.55),area('outer',2/3,.45,1/3,.55)],
        jShoulder:()=>[area('top',0,0,1,.3),area('outer',.7,.3,.3,.7),area(view==='F'?'front':'back',0,.3,.7,.7)],
        jElbow:()=>[area('inner',0,0,.25,1),area('outer',.75,0,.25,1),area(view==='F'?'front':'back',.25,0,.5,1)],
        jWrist:()=>[area('little',0,0,.25,1),area('thumb',.75,0,.25,1),area(view==='F'?'palm':'back',.25,0,.5,1)],
        jHand:()=>[], // 全身底圖無獨立手指輪廓；精細位置改由掌背參考圖呈現。
        jHip:()=>[area('front-inner',0,0,.4,1),area('front',.4,0,.35,1),area('outer',.75,0,.25,1)],
        jKnee:()=>[area('inner',0,0,.2,1),area('outer',.8,0,.2,1),...(view==='B'?[area('back',.2,0,.6,1)]:[area('above',.2,0,.6,.3),area('front',.2,.3,.6,.4),area('below',.2,.7,.6,.3)])],
        jAnkle:()=>[area('inner',0,0,.25,1),area('outer',.75,0,.25,1),area(view==='F'?'front':'back',.25,0,.5,1)],
        jFoot:()=>view==='F'?[area('top',0,0,1,.65)]:[]
      };
      zones=faces[region.id]();
    }
    const paths=zones.filter(z=>selected.some(id=>covers(region,id,z.id)));
    return {paths,hidden:selected.filter(id=>!paths.some(z=>covers(region,id,z.id)))};
  }
  function focusViewBox(bounds,fullViewBox,zoom=1){
    if(!bounds)return fullViewBox;
    const factor=zoom===2?2:1;
    const width=Math.max(280,bounds.width*2.8)/factor,height=Math.max(380,bounds.height*2.8)/factor;
    return [bounds.x+bounds.width/2-width/2,bounds.y+bounds.height/2-height/2,width,height].join(' ');
  }
  function bodyGeometry(region,side,view,map){
    const location=map?.locations.find(p=>p.id===region.id&&p.side===side&&p.view===view);
    if(!location)return null;
    const source=sourceDiagram(region,side,view,location),paths=project(region,side,view,map,region.cells.map(c=>c.id)).paths;
    const bounds=source.source.bounds;
    const normalized=paths.map(p=>({...p,anchor:[(p.anchor[0]-bounds.x)/bounds.width*640,(p.anchor[1]-bounds.y)/bounds.height*420]}));
    const layout=spatialLayout({zones:normalized})||{columns:region.cols?.length||1,slots:[]};
    let nextRow=Math.max(0,...layout.slots.map(s=>s.row))+1;
    const missing=region.cells.filter(c=>!paths.some(p=>p.id===c.id));
    missing.forEach((c,n)=>layout.slots.push({id:c.id,row:nextRow+Math.floor(n/layout.columns),column:n%layout.columns+1,hidden:true}));
    return {bounds,zones:paths,layout};
  }
  const api={build,spatialLayout,covers,project,bodyGeometry,focusViewBox};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.DETAIL_LOCATION_IMAGE=api;
})(typeof window==='object'?window:globalThis);
