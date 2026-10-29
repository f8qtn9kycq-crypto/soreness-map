// 以瀏覽器原生 SVG fill 幾何重建固定投影表；不代表臨床定位。
// APP_URL=http://127.0.0.1:8774/ PLAYWRIGHT_MODULE_PATH=/path/to/playwright node scripts/build-freehand-summary-geometry.cjs
const fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
(async()=>{
  const browser=await chromium.launch();
  try {
    const page=await browser.newPage();
    await page.goto(process.env.APP_URL||'http://127.0.0.1:8774/');
    const data=await page.evaluate(()=>{
      const A=window.FREEHAND_ART,M=window.FEMALE_MAP,source=A.get('RO'),target=A.get('F');
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');document.body.append(svg);
      const path=outline=>{const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',outline);svg.append(p);return p;};
      const s=path(source.outline),t=path(target.outline),p=svg.createSVGPoint();
      const inside=(shape,x,y)=>{p.x=x;p.y=y;return shape.isPointInFill(p);};
      const intervals=(shape,y,box)=>{
        const ranges=[],step=.5;let start=null,previous=box[0]-step;
        const edge=(lo,hi,wantInside)=>{for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(inside(shape,mid,y)===wantInside)hi=mid;else lo=mid;}return (lo+hi)/2;};
        for(let x=box[0];x<=box[0]+box[2]+step;x+=step){
          const hit=inside(shape,x,y);
          if(hit&&start===null)start=edge(previous,x,true);
          if(!hit&&start!==null){ranges.push([start,edge(previous,x,false)]);start=null;}
          previous=x;
        }
        return ranges;
      };
      const anchors=[[65,665],[470,970],[580,1035],[895,1324],[975,1420]];
      const projectY=y=>{let k=0;while(k<anchors.length-2&&y>anchors[k+1][0])k++;const [y0,t0]=anchors[k],[y1,t1]=anchors[k+1];return t0+(y-y0)/(y1-y0)*(t1-t0);};
      const landmarks=Object.fromEntries(['R','L'].map(side=>[side,['jKnee','jAnkle'].map(id=>M.locations.find(l=>l.id===id&&l.view==='F'&&l.side===side).labelPoint)]));
      const middle=(landmarks.R[0][0]+landmarks.L[0][0])/2;
      const bounds=s.getBBox(),ys=[bounds.y+.001];
      for(let y=Math.ceil(bounds.y);y<bounds.y+bounds.height;y++)ys.push(y);
      ys.push(bounds.y+bounds.height-.001);
      const rows=ys.filter((y,i)=>i===0||y>ys[i-1]).map(y=>{
        const sourceRanges=intervals(s,y,source.box);
        if(sourceRanges.length!==1)throw Error('Source row not one interval: '+y);
        const ty=projectY(y),ranges=intervals(t,ty,target.box),sides=['R','L'].map(side=>{
          const [knee,ankle]=landmarks[side],f=Math.max(0,Math.min(1,(ty-991)/333)),center=knee[0]+(ankle[0]-knee[0])*f;
          const range=ranges.find(([left,right])=>left<=center&&right>=center);
          if(!range)throw Error('Missing continuous '+side+' leg interval at '+ty);
          return side==='R'?[range[0],Math.min(middle,range[1])]:[Math.max(middle,range[0]),range[1]];
        });
        return [y,...sourceRanges[0],ty,...sides.flat()].map(n=>Math.round(n*1e6)/1e6);
      });
      svg.remove();
      return {version:'surface-v1/whole-body-band-v1',sourceVersion:A.version,sourceBox:source.box,bodyBox:target.box,rowStep:1,columns:['sourceY','sourceLeft','sourceRight','targetY','rightLeft','rightRight','leftLeft','leftRight'],rows,sourceOutline:source.outline,bodyOutline:target.outline};
    });
    data.sourceHash=crypto.createHash('sha256').update(data.sourceOutline).digest('hex');
    data.bodyHash=crypto.createHash('sha256').update(data.bodyOutline).digest('hex');
    delete data.sourceOutline;delete data.bodyOutline;
    const output='/* 由 scripts/build-freehand-summary-geometry.cjs 生成；逐列 SVG 原生填色邊界。 */\n(function(root){const data='+JSON.stringify(data)+';if(typeof module===\'object\'&&module.exports)module.exports=data;else root.FREEHAND_SUMMARY_GEOMETRY=data;})(typeof globalThis!==\'undefined\'?globalThis:this);\n';
    if(process.argv.includes('--check')) {
      if(fs.readFileSync('assets/freehand-summary-geometry.js','utf8')!==output)throw Error('投影幾何表已過期，請重新執行生成指令。');
    } else fs.writeFileSync('assets/freehand-summary-geometry.js',output);
    console.log(JSON.stringify({version:data.version,rows:data.rows.length,sourceHash:data.sourceHash,bodyHash:data.bodyHash}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
