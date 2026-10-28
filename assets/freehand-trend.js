/* 各次實際記錄的變化：不平均、不補缺值、不推論康復。 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FREEHAND_TREND=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const locationKey=l=>'loc:'+l.regions.slice().sort().join(',')+':'+(l.side||'-')+':'+(l.surface||'-');
 function build(entries,days,today){
  const end=Date.parse(today+'T00:00:00Z'),start=end-(days-1)*86400000,groups=new Map();
  for(const e of entries){const date=Date.parse(e.date+'T00:00:00Z');if(date<start||date>end)continue;
   for(const s of e.strokes){if(!Number.isInteger(s.severity)||s.severity<0||s.severity>10)continue;const key=s.location?locationKey(s.location):s.part?'part:'+s.part:null;if(!key)continue;
    if(!groups.has(key))groups.set(key,{key,...(s.location?{location:s.location}:{part:s.part}),points:[]});
    groups.get(key).points.push({date:e.date,severity:s.severity,strokeId:s.id});
   }
  }
  return [...groups.values()].map(g=>{g.points.sort((a,b)=>a.date.localeCompare(b.date));const dates=[...new Set(g.points.map(p=>p.date))],lastDate=dates.at(-1),last=g.points.filter(p=>p.date===lastDate).map(p=>p.severity),previous=dates.length>1?g.points.filter(p=>p.date===dates.at(-2)).map(p=>p.severity):[];
   const low=Math.min(...last),high=Math.max(...last),prior=[...new Set(previous)];return {...g,lastDate,low,high,latestCount:last.length,delta:low===high&&prior.length===1?low-prior[0]:null,days:dates.length};
  }).sort((a,b)=>b.lastDate.localeCompare(a.lastDate)||b.high-a.high||a.key.localeCompare(b.key));
 }
 return {locationKey,build};
});
